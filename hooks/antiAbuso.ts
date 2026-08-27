import crypto from 'crypto'

import { APIError } from 'payload'
import type { CollectionBeforeValidateHook, PayloadRequest } from 'payload'

import { esPersonalDelPanel } from '../access'

/**
 * Proteccion de los formularios publicos (inscripciones, solicitudes de
 * consulting y newsletter).
 *
 * Estas colecciones aceptan `create` de alguien sin sesion de panel — es la
 * unica forma de que el sitio reciba envios. Sin limite, cualquiera puede
 * llenar la base con basura o quemar la reputacion del dominio de correo.
 *
 * El bypass de estos hooks es "esta creando el propio panel" (`esPersonalDelPanel`),
 * NO "hay alguien logueado": desde que existe `Cuentas` (auth publica, ver
 * collections/Cuentas.ts), un envio real de un cliente TAMBIEN trae sesion
 * — la de su cuenta. Usar `Boolean(req.user)` como bypass saltearia el
 * honeypot y el rate limit para cualquier cliente logueado, que es
 * justamente a quien hay que seguir limitando.
 *
 * Todo vive dentro de Payload: no depende de memoria del proceso, asi que
 * funciona igual en un servidor propio o en serverless, donde cada request
 * puede caer en una instancia distinta.
 */

/** Extrae la IP del cliente respetando los proxies del hosting. */
export const obtenerIp = (req: PayloadRequest): string => {
  const forwarded = req.headers?.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return req.headers?.get('x-real-ip') ?? 'desconocida'
}

/**
 * La IP es un dato personal, asi que no se guarda en claro.
 * Se guarda un HMAC: sirve para comparar envios entre si, pero no permite
 * reconstruir la direccion si alguien accede a la base.
 */
export const hashearIp = (ip: string): string =>
  crypto
    .createHmac('sha256', process.env.PAYLOAD_SECRET ?? 'sin-secreto')
    .update(ip)
    .digest('hex')
    .slice(0, 32)

type OpcionesLimite = {
  /** Cuantos envios se permiten dentro de la ventana. */
  maximo: number
  /** Tamano de la ventana en minutos. */
  ventanaMinutos: number
}

/**
 * Rechaza el envio si esa IP ya mando demasiados en la ventana reciente.
 * Solo aplica a envios anonimos: un administrador cargando datos a mano
 * nunca queda limitado.
 */
export const limitarEnviosPorIp =
  ({ maximo, ventanaMinutos }: OpcionesLimite): CollectionBeforeValidateHook =>
  async ({ collection, data, operation, req }) => {
    if (operation !== 'create' || esPersonalDelPanel(req.user)) return data

    const huella = hashearIp(obtenerIp(req))
    const desde = new Date(Date.now() - ventanaMinutos * 60_000).toISOString()

    const { totalDocs } = await req.payload.count({
      collection: collection.slug,
      req,
      where: {
        and: [{ huellaOrigen: { equals: huella } }, { createdAt: { greater_than: desde } }],
      },
    })

    if (totalDocs >= maximo) {
      // APIError con `isPublic: true` para que el mensaje llegue al
      // formulario. Un `Error` normal se convierte en 500 "Something went
      // wrong" y la persona no entiende que paso.
      throw new APIError(
        'Recibimos varios envios desde tu conexion en los ultimos minutos. ' +
          'Espera un momento antes de volver a intentarlo.',
        429,
        null,
        true,
      )
    }

    return { ...data, huellaOrigen: huella }
  }

/**
 * Rechaza el envio si el campo trampa viene completo.
 * Se ejecuta antes que el limite por IP para no gastar una consulta.
 */
export const rechazarSiHoneypot: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation !== 'create' || esPersonalDelPanel(req.user)) return data

  const trampa = (data as Record<string, unknown>)?.sitioWebContacto
  if (typeof trampa === 'string' && trampa.trim().length > 0) {
    // Mensaje neutro a proposito: no confirmarle al bot que cayo en la trampa.
    throw new APIError('No pudimos procesar el formulario.', 400, null, true)
  }

  return data
}

/**
 * Fuerza los valores que el publico NO puede decidir sobre si mismo.
 *
 * Sin esto, un POST directo a la API podria inscribirse como "confirmada"
 * y con el pago en "pagado", o darse de alta en el newsletter saltandose
 * la confirmacion por correo. El formulario del sitio no hace eso, pero
 * la API no atiende solo al formulario.
 */
export const forzarValoresSeguros =
  (valores: Record<string, unknown>): CollectionBeforeValidateHook =>
  ({ data, operation, req }) => {
    if (operation !== 'create' || esPersonalDelPanel(req.user)) return data
    return { ...data, ...valores }
  }
