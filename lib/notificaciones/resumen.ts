import type { Notificacione } from '../../payload-types'
import type { ContenidoCorreo } from './tipos'

const SERVIDOR = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/**
 * Contenido de un correo que junta varios avisos. Se arma con lo que quedó
 * guardado en cada notificación (título y cuerpo), no con las recetas: el
 * resumen solo enumera, el detalle está en cada enlace.
 */
export function contenidoDeResumen(notificaciones: Notificacione[]): ContenidoCorreo {
  const paraEquipo = notificaciones[0]?.destinatario?.relationTo === 'users'
  const ruta = paraEquipo ? '/admin/collections/notificaciones' : '/cuenta/notificaciones'

  return {
    asunto: `Tienes ${notificaciones.length} avisos de AquaBioProcess`,
    titulo: `${notificaciones.length} avisos nuevos`,
    parrafos: notificaciones.map((notificacion) =>
      [notificacion.titulo, notificacion.cuerpo].filter(Boolean).join(' — '),
    ),
    accion: { texto: paraEquipo ? 'Ver en el panel' : 'Ver mis notificaciones', url: `${SERVIDOR}${ruta}` },
  }
}
