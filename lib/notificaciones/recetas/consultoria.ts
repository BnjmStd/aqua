import type { SolicitudesConsulting } from '../../../payload-types'
import { destinatariosDelEquipo, recorte, rutaAbsoluta } from './comunes'
import { definirReceta } from '../tipos'

type Contexto = { solicitud: SolicitudesConsulting }

/** Al equipo: entró una solicitud de consultoría por el sitio. */
export const solicitudConsultoriaCreada = definirReceta({
  id: 'solicitud-consultoria-creada',
  evento: 'solicitud-consultoria.creada',
  categoria: 'equipo',
  agrupar: { clave: 'consultoria-equipo', ventanaMinutos: 60 },
  cargar: async ({ solicitudId }, req): Promise<Contexto | null> => {
    const solicitud = await req.payload
      .findByID({ collection: 'solicitudes-consulting', id: solicitudId, depth: 1, req })
      .catch(() => null)
    return solicitud ? { solicitud } : null
  },
  // Si el equipo ya la movió de "nueva", el aviso perdió sentido.
  vigente: ({ solicitud }) => solicitud.estado === 'nueva',
  clave: ({ solicitud }) => solicitud.id,
  destinatarios: (_ctx, req) => destinatariosDelEquipo(req),
  contenido: ({ solicitud }) => {
    const ruta = `/admin/collections/solicitudes-consulting/${solicitud.id}`
    const servicio = typeof solicitud.servicio === 'object' && solicitud.servicio ? solicitud.servicio.titulo : 'Consulta general'
    const quien = typeof solicitud.cuenta === 'object' ? solicitud.cuenta.nombre : 'Una cuenta'

    return {
      inApp: {
        titulo: 'Nueva solicitud de consultoría',
        cuerpo: `${quien}${solicitud.empresa ? ` · ${solicitud.empresa}` : ''} · ${servicio}`,
        url: ruta,
      },
      email: {
        asunto: `Nueva solicitud de consultoría: ${servicio}`,
        titulo: 'Entró una solicitud de consultoría',
        parrafos: [
          `${quien}${solicitud.empresa ? ` · ${solicitud.empresa}` : ''}`,
          `Servicio: ${servicio}`,
          `"${recorte(solicitud.mensaje)}"`,
        ],
        accion: { texto: 'Ver la solicitud', url: rutaAbsoluta(ruta) },
      },
    }
  },
})
