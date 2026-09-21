import type { Cuenta } from '../../../payload-types'
import { HORAS_VALIDEZ_VERIFICACION } from '../../verificacion'
import { rutaAbsoluta } from './comunes'
import { type Destinatario, definirReceta } from '../tipos'

type Contexto = { cuenta: Cuenta; token: string }

/**
 * Correo para confirmar la dirección de una cuenta nueva.
 *
 * `datosSensibles`: el token en claro viaja en los datos del evento para poder
 * armar el enlace al enviar, y el envío los borra apenas sale el mensaje. En
 * la cuenta solo queda el hash (lib/verificacion.ts).
 */
export const cuentaVerificarCorreo = definirReceta({
  id: 'cuenta-verificar-correo',
  evento: 'cuenta.verificar-correo',
  categoria: 'cuenta',
  // Es parte de crear la cuenta: no se puede desactivar en las preferencias.
  obligatoria: true,
  datosSensibles: true,
  // No va a la campana: quien todavía no verifica su correo no está mirando su bandeja.
  soloExterno: true,
  cargar: async ({ cuentaId, token }, req): Promise<Contexto | null> => {
    const cuenta = await req.payload.findByID({ collection: 'cuentas', id: cuentaId, depth: 0, req }).catch(() => null)
    if (!cuenta) return null
    return { cuenta, token }
  },
  // Si ya verificó (por ejemplo, con un enlace anterior), el correo ya no sale.
  vigente: ({ cuenta }) => !cuenta.correoVerificadoEl,
  clave: ({ token }) => token.slice(0, 12),
  destinatarios: async ({ cuenta }): Promise<Destinatario[]> => [
    { coleccion: 'cuentas', id: cuenta.id, nombre: cuenta.nombre, email: cuenta.email },
  ],
  contenido: ({ cuenta, token }) => {
    const ruta = `/cuenta/verificar?token=${encodeURIComponent(token)}`
    const primerNombre = cuenta.nombre.trim().split(/\s+/)[0]

    return {
      inApp: {
        titulo: 'Verifica tu correo',
        cuerpo: 'Confirma tu dirección para que podamos contactarte.',
        url: '/cuenta',
      },
      email: {
        asunto: 'Confirma tu correo · AquaBioProcess',
        titulo: `Hola, ${primerNombre}`,
        parrafos: [
          'Confirma que este correo es tuyo para que podamos avisarte de tus cursos y solicitudes.',
          `El enlace vence en ${HORAS_VALIDEZ_VERIFICACION} horas.`,
          'Si no creaste una cuenta en aquabioprocess.cl, ignora este mensaje.',
        ],
        accion: { texto: 'Confirmar mi correo', url: rutaAbsoluta(ruta) },
      },
    }
  },
})
