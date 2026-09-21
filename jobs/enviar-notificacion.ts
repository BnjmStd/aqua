import type { PayloadRequest, TaskConfig } from 'payload'

import { obtenerCanal } from '../lib/notificaciones/canales'
import { recetaPorId } from '../lib/notificaciones/recetas'
import { contenidoDeResumen } from '../lib/notificaciones/resumen'
import type { Contenido, Destinatario } from '../lib/notificaciones/tipos'
import type { Notificacione } from '../payload-types'

/**
 * Entrega UN envío por su canal. Lo encola `lib/notificaciones/emitir.ts`.
 *
 * Reconstruye el contenido a partir de la receta y los datos del evento (no
 * usa texto guardado): así, si algo cambió entre que se encoló y se envía, el
 * mensaje sale al día — o no sale, si la receta dice que ya no aplica.
 *
 * Los cambios de estado se escriben SIN `req`: si el envío falla hay que
 * lanzar el error para que Payload reintente, y eso revierte la transacción
 * del job (perderíamos el registro del intento).
 */
export const tareaEnviarNotificacion: TaskConfig<'enviarNotificacion'> = {
  slug: 'enviarNotificacion',
  label: 'Enviar notificación',
  inputSchema: [{ name: 'envioId', type: 'text', required: true }],
  retries: { attempts: 5, backoff: { type: 'exponential', delay: 30_000 } },
  handler: async ({ input, req }) => {
    const { payload } = req
    const envio = await payload.findByID({ collection: 'envios', id: input.envioId, depth: 1 }).catch(() => null)
    if (!envio || envio.estado === 'enviado' || envio.estado === 'omitido') return { output: {} }

    const notificaciones = (envio.notificaciones ?? []).filter(
      (n): n is Notificacione => typeof n !== 'string',
    )
    const canal = obtenerCanal(envio.canal)
    if (!notificaciones.length) return omitir(req, envio.id, 'El aviso ya no existe')
    if (!canal) return omitir(req, envio.id, `Canal ${envio.canal} sin configurar`)

    // Cada aviso se revisa de nuevo: entre que se encoló y ahora la situación pudo cambiar.
    const vigentes: { notificacion: Notificacione; contenido: Contenido; sensible: boolean }[] = []
    for (const notificacion of notificaciones) {
      const receta = recetaPorId(notificacion.receta)
      if (!receta) continue
      const contexto = await receta.cargar(notificacion.datos as never, req)
      if (!contexto) continue
      if (receta.vigente && !receta.vigente(contexto)) continue

      const destinatario: Destinatario = {
        coleccion: notificacion.destinatario.relationTo,
        id:
          typeof notificacion.destinatario.value === 'string'
            ? notificacion.destinatario.value
            : notificacion.destinatario.value.id,
        nombre: '',
        email: envio.destino,
      }
      vigentes.push({ notificacion, contenido: receta.contenido(contexto, destinatario), sensible: Boolean(receta.datosSensibles) })
    }

    if (!vigentes.length) return omitir(req, envio.id, 'Ya no aplica')

    // Uno solo: el mensaje completo de su receta. Varios: un resumen enumerado.
    const contenido: Contenido =
      vigentes.length === 1
        ? vigentes[0].contenido
        : {
            inApp: vigentes[0].contenido.inApp,
            email: contenidoDeResumen(vigentes.map((v) => v.notificacion)),
          }

    try {
      const { idProveedor } = await canal.enviar({ destino: envio.destino, contenido, req })
      await payload.update({
        collection: 'envios',
        id: envio.id,
        data: { estado: 'enviado', enviadoEl: new Date().toISOString(), intentos: (envio.intentos ?? 0) + 1, idProveedor },
      })

      // Tokens y similares: quedan fuera de la base apenas el mensaje salió.
      for (const { notificacion, sensible } of vigentes) {
        if (sensible) await payload.update({ collection: 'notificaciones', id: notificacion.id, data: { datos: {} } })
      }
      return { output: {} }
    } catch (error) {
      await payload.update({
        collection: 'envios',
        id: envio.id,
        data: {
          estado: 'fallido',
          intentos: (envio.intentos ?? 0) + 1,
          ultimoError: error instanceof Error ? error.message : String(error),
        },
      })
      // Se relanza a proposito: Payload reintenta con espera creciente.
      throw error
    }
  },
}

async function omitir(req: PayloadRequest, id: string, motivo: string) {
  await req.payload.update({ collection: 'envios', id, data: { estado: 'omitido', motivoOmision: motivo } })
  return { output: {} }
}
