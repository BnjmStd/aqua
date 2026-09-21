import type { PayloadRequest } from 'payload'

import { canalesDisponibles } from './canales'
import { recetasDelEvento } from './recetas'
import type { CatalogoEventos, Destinatario, NombreEvento, Receta } from './tipos'

/**
 * Único punto de entrada del sistema de notificaciones: lo llaman los hooks de
 * las colecciones cuando pasa algo. No sabe de correos ni de WhatsApp.
 *
 *   emitirEvento('justificacion.creada', { justificacionId: doc.id }, { req })
 *
 * Se llama SIEMPRE con el `req` de la operación: así todo ocurre dentro de la
 * misma transacción (si el documento no se guarda, no sale ningún aviso) y se
 * sabe quién lo provocó, para no avisarle a sí mismo.
 *
 * Nunca hace fallar la operación del negocio: si algo revienta, se registra y
 * la justificación (o lo que sea) igual se guarda.
 */
export async function emitirEvento<E extends NombreEvento>(
  evento: E,
  datos: CatalogoEventos[E],
  { req }: { req: PayloadRequest },
): Promise<void> {
  // Seeds, scripts de datos de prueba e importaciones pasan este contexto.
  if (req.context?.sinNotificaciones) return

  for (const receta of recetasDelEvento(evento)) {
    try {
      await aplicarReceta(receta, datos as Record<string, unknown>, req)
    } catch (error) {
      req.payload.logger.error({ err: error, evento, receta: receta.id }, 'No se pudo emitir la notificación')
    }
  }
}

async function aplicarReceta(receta: Receta, datos: Record<string, unknown>, req: PayloadRequest) {
  const contexto = await receta.cargar(datos as never, req)
  if (!contexto) return
  if (receta.vigente && !receta.vigente(contexto)) return

  const actor = req.user ? `${(req.user as { collection?: string }).collection}:${req.user.id}` : null
  const destinatarios = (await receta.destinatarios(contexto, req)).filter(
    (destinatario) => `${destinatario.coleccion}:${destinatario.id}` !== actor,
  )

  const canales = canalesDisponibles()

  for (const destinatario of destinatarios) {
    const claveUnica = `${receta.id}:${receta.clave(contexto)}:${destinatario.coleccion}:${destinatario.id}`

    // Se consulta antes de crear (y no se confía solo en el índice único) para
    // no romper la transacción en curso con un error de base de datos.
    const { totalDocs } = await req.payload.count({
      collection: 'notificaciones',
      where: { claveUnica: { equals: claveUnica } },
      req,
    })
    if (totalDocs) continue

    const contenido = receta.contenido(contexto, destinatario)

    const notificacion = await req.payload.create({
      collection: 'notificaciones',
      data: {
        destinatario: { relationTo: destinatario.coleccion, value: destinatario.id },
        titulo: contenido.inApp.titulo,
        cuerpo: contenido.inApp.cuerpo,
        url: contenido.inApp.url,
        categoria: receta.categoria,
        receta: receta.id,
        datos: datos as Record<string, unknown>,
        claveUnica,
        // "Solo externo": queda el registro, pero no aparece como pendiente en la campana.
        leidaEl: receta.soloExterno ? new Date().toISOString() : undefined,
      },
      req,
    })

    if (contenido.email && destinatario.email && canales.includes('email')) {
      await encolarEnvio({
        req,
        canal: 'email',
        destino: destinatario.email,
        notificacionId: notificacion.id,
        agrupar: receta.agrupar
          ? { clave: `${receta.agrupar.clave}:${destinatario.coleccion}:${destinatario.id}`, ventanaMinutos: receta.agrupar.ventanaMinutos }
          : undefined,
      })
    }
    // Fase 3: WhatsApp y SMS entran acá, con teléfono verificado y preferencias.
  }
}

async function encolarEnvio({
  req,
  canal,
  destino,
  notificacionId,
  agrupar,
}: {
  req: PayloadRequest
  canal: 'email' | 'whatsapp' | 'sms'
  destino: string
  notificacionId: string
  agrupar?: { clave: string; ventanaMinutos: number }
}) {
  // Con agrupación: si ya hay un envío esperando con la misma clave, este aviso
  // se suma a ese mensaje en vez de generar otro.
  if (agrupar) {
    const { docs } = await req.payload.find({
      collection: 'envios',
      where: {
        and: [
          { claveAgrupacion: { equals: agrupar.clave } },
          { estado: { equals: 'pendiente' } },
          { canal: { equals: canal } },
        ],
      },
      depth: 0,
      limit: 1,
      req,
    })

    const enEspera = docs[0]
    if (enEspera) {
      const actuales = (enEspera.notificaciones ?? []).map((n) => (typeof n === 'string' ? n : n.id))
      await req.payload.update({
        collection: 'envios',
        id: enEspera.id,
        data: { notificaciones: [...actuales, notificacionId] },
        req,
      })
      return
    }
  }

  const envio = await req.payload.create({
    collection: 'envios',
    data: {
      notificaciones: [notificacionId],
      canal,
      destino,
      estado: 'pendiente',
      intentos: 0,
      claveAgrupacion: agrupar?.clave,
    },
    req,
  })

  await req.payload.jobs.queue({
    task: 'enviarNotificacion',
    input: { envioId: envio.id },
    // Con agrupación el envío espera a que se cierre la ventana; si no, sale al tiro.
    ...(agrupar ? { waitUntil: new Date(Date.now() + agrupar.ventanaMinutos * 60_000) } : {}),
    req,
  })
}

/** Para destinatarios sin cuenta (participante B2B, suscriptores): fase 2. */
export type { Destinatario }
