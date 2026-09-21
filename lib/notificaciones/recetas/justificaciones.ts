import type { PayloadRequest } from 'payload'

import { MOTIVOS_JUSTIFICACION } from '../../justificaciones'
import type { Convocatoria, Inscripcione, Justificacione } from '../../../payload-types'
import { type Destinatario, definirReceta } from '../tipos'

import { destinatariosDelEquipo, recorte, rutaAbsoluta } from './comunes'

const etiquetaMotivo = (motivo: string) =>
  MOTIVOS_JUSTIFICACION.find((m) => m.value === motivo)?.label ?? motivo

type Contexto = {
  justificacion: Justificacione
  inscripcion: Inscripcione
  convocatoria: Convocatoria
  /** Datos tal como venían en el evento: sirven para saber si algo cambió después. */
  evento: { estado?: string; resultado?: string | null }
}

async function cargarContexto(justificacionId: string, req: PayloadRequest, evento: Contexto['evento'] = {}) {
  const justificacion = await req.payload
    .findByID({ collection: 'justificaciones', id: justificacionId, depth: 0, req })
    .catch(() => null)
  if (!justificacion) return null

  const inscripcion = await req.payload
    .findByID({
      collection: 'inscripciones',
      id: typeof justificacion.inscripcion === 'string' ? justificacion.inscripcion : justificacion.inscripcion.id,
      // 2 para llegar al curso (inscripcion -> convocatoria -> curso) y nombrarlo bien.
      depth: 2,
      req,
    })
    .catch(() => null)
  if (!inscripcion || typeof inscripcion.convocatoria === 'string') return null

  return { justificacion, inscripcion, convocatoria: inscripcion.convocatoria, evento }
}

/** Nombre del curso (o de la convocatoria, si no viene poblado). */
function nombreCurso(convocatoria: Convocatoria) {
  return typeof convocatoria.curso === 'object' ? convocatoria.curso.titulo : convocatoria.titulo
}

/**
 * Al equipo: llegó una justificación para revisar.
 * Por ahora la reciben todos los usuarios del panel; en la fase 2 cada uno lo
 * ajusta en sus preferencias.
 */
export const justificacionCreada = definirReceta({
  id: 'justificacion-creada',
  evento: 'justificacion.creada',
  categoria: 'equipo',
  cargar: ({ justificacionId }, req) => cargarContexto(justificacionId, req),
  // Si alguien del equipo ya la revisó antes de que saliera el correo, no se manda.
  vigente: ({ justificacion }) => justificacion.estado === 'pendiente',
  clave: ({ justificacion }) => justificacion.id,
  // Varias justificaciones en una hora = un solo correo al equipo.
  agrupar: { clave: 'academia-equipo', ventanaMinutos: 60 },
  destinatarios: (_ctx, req) => destinatariosDelEquipo(req),
  contenido: ({ justificacion, inscripcion, convocatoria }) => {
    const ruta = `/admin/collections/justificaciones/${justificacion.id}`
    const referencia = `${inscripcion.participanteNombre} · ${nombreCurso(convocatoria)} · sesión ${justificacion.sesion}`

    return {
      inApp: {
        titulo: 'Nueva justificación de inasistencia',
        cuerpo: `${referencia} · ${etiquetaMotivo(justificacion.motivo)}`,
        url: ruta,
      },
      email: {
        asunto: `Justificación pendiente: ${inscripcion.participanteNombre} (sesión ${justificacion.sesion})`,
        titulo: 'Hay una justificación esperando revisión',
        parrafos: [
          referencia,
          `Motivo: ${etiquetaMotivo(justificacion.motivo)}`,
          `"${recorte(justificacion.detalle)}"`,
          justificacion.filename ? 'Adjuntó un respaldo.' : 'Sin respaldo adjunto.',
        ],
        accion: { texto: 'Revisar en el panel', url: rutaAbsoluta(ruta) },
      },
    }
  },
})

const TEXTOS_REVISION = {
  presente: {
    titulo: 'Corregimos tu asistencia',
    cuerpo: (sesion: number) => `Revisamos tu justificación y la sesión ${sesion} quedó como asistida.`,
  },
  justificada: {
    titulo: 'Justificamos tu inasistencia',
    cuerpo: (sesion: number) => `La sesión ${sesion} no va a contar en tu porcentaje de asistencia.`,
  },
  rechazada: {
    titulo: 'Tu justificación no fue aceptada',
    cuerpo: (sesion: number) => `Revisamos lo que enviaste para la sesión ${sesion} y no pudimos aceptarlo.`,
  },
} as const

/** Al alumno: el equipo revisó su justificación. */
export const justificacionRevisada = definirReceta({
  id: 'justificacion-revisada',
  evento: 'justificacion.revisada',
  categoria: 'academia',
  cargar: ({ justificacionId, estado, resultado }, req) =>
    cargarContexto(justificacionId, req, { estado, resultado }),
  // Si la volvieron a cambiar antes de enviar, este aviso ya no corresponde.
  vigente: ({ justificacion, evento }) =>
    justificacion.estado === evento.estado && (justificacion.resultado ?? null) === (evento.resultado ?? null),
  clave: ({ justificacion, evento }) => `${justificacion.id}:${evento.estado}:${evento.resultado ?? ''}`,
  destinatarios: async ({ justificacion }, req): Promise<Destinatario[]> => {
    const id = typeof justificacion.cuenta === 'string' ? justificacion.cuenta : justificacion.cuenta.id
    const cuenta = await req.payload.findByID({ collection: 'cuentas', id, depth: 0, req }).catch(() => null)
    if (!cuenta) return []
    return [{ coleccion: 'cuentas', id: cuenta.id, nombre: cuenta.nombre, email: cuenta.email }]
  },
  contenido: ({ justificacion, inscripcion, convocatoria }) => {
    const clave = justificacion.estado === 'rechazada' ? 'rechazada' : (justificacion.resultado ?? 'justificada')
    const texto = TEXTOS_REVISION[clave as keyof typeof TEXTOS_REVISION]
    const ruta = `/cuenta/cursos/${inscripcion.id}#sesiones`

    return {
      inApp: {
        titulo: texto.titulo,
        cuerpo: `${nombreCurso(convocatoria)} · sesión ${justificacion.sesion}`,
        url: ruta,
      },
      email: {
        asunto: `${texto.titulo} · ${nombreCurso(convocatoria)}`,
        titulo: texto.titulo,
        parrafos: [
          texto.cuerpo(justificacion.sesion),
          ...(justificacion.respuesta ? [`Respuesta del equipo: "${recorte(justificacion.respuesta)}"`] : []),
        ],
        accion: { texto: 'Ver el curso', url: rutaAbsoluta(ruta) },
      },
    }
  },
})
