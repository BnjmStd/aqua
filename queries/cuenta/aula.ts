import { dentroDeVentana, tieneAula } from '@/access/aula'
import { esPoblado } from '@/lib/relaciones'
import { obtenerPayload } from '@/lib/payload'
import { PLAZO_JUSTIFICACION_DIAS } from '@/lib/justificaciones'
import type { Convocatoria, Curso, Inscripcione, Justificacione, Recurso } from '@/payload-types'

/**
 * `justificada`: ausente con justificacion aprobada que no cuenta en el %.
 * Una justificacion aprobada como "presente" deja la sesion en `presente`.
 */
export type EstadoAsistencia = 'presente' | 'ausente' | 'justificada' | 'sin_registro' | 'futura'

export type SesionDelAula = {
  numero: number
  inicio: number
  fin: number
  tema: string | null
  duracionHoras: number | null
  asistencia: EstadoAsistencia
  /** Ultima justificacion enviada para esta sesion, si hay. */
  justificacion: Justificacione | null
  /** Ausente, sin justificacion vigente y dentro del plazo. */
  puedeJustificar: boolean
  /** Hasta cuando se puede justificar (inicio + plazo). */
  plazoJustificacion: number
  enlaceClase: Recurso | null
  grabaciones: Recurso[]
  materiales: Recurso[]
}

export type Aula = {
  inscripcion: Inscripcione
  convocatoria: Convocatoria
  curso: Curso | null
  habilitada: boolean
  sesiones: SesionDelAula[]
  materialGeneral: Recurso[]
  asistencia: { presentes: number; registradas: number; justificadas: number; porcentaje: number | null; minima: number }
  terminado: boolean
  ahora: number
}

const HORA_MS = 3_600_000
const DIA_MS = 86_400_000

/** Estados de inscripcion en que tiene sentido justificar (hubo cupo y se paso lista). */
const ESTADOS_QUE_JUSTIFICAN: Inscripcione['estadoInscripcion'][] = ['confirmada', 'asistio', 'no_asistio']

/**
 * Todo lo que muestra el aula de UNA inscripcion de la cuenta, o null si la
 * inscripcion no existe o es de otra cuenta (la pagina responde 404 en ambos
 * casos: no confirmar que existe).
 *
 * Corre con la Local API (overrideAccess): el control es explicito aca —
 * dueño de la inscripcion + estado con aula — y la asistencia se reduce a la
 * de esta inscripcion antes de salir del servidor.
 */
export async function obtenerAula(cuentaId: string, inscripcionId: string, ahora: number): Promise<Aula | null> {
  const payload = await obtenerPayload()

  const inscripcion = await payload
    .findByID({ collection: 'inscripciones', id: inscripcionId, depth: 2 })
    .catch(() => null)
  if (!inscripcion) return null
  const duena = typeof inscripcion.cuenta === 'string' ? inscripcion.cuenta : inscripcion.cuenta.id
  if (duena !== cuentaId || !esPoblado(inscripcion.convocatoria)) return null

  const convocatoria = inscripcion.convocatoria
  const curso = esPoblado(convocatoria.curso) ? convocatoria.curso : null
  const habilitada = tieneAula(inscripcion)

  const [recursos, listas, justificaciones] = await Promise.all([
    habilitada
      ? payload
          .find({
            collection: 'recursos',
            where: {
              and: [
                {
                  or: [
                    { and: [{ alcance: { equals: 'convocatoria' } }, { convocatoria: { equals: convocatoria.id } }] },
                    ...(curso ? [{ and: [{ alcance: { equals: 'curso' } }, { curso: { equals: curso.id } }] }] : []),
                  ],
                },
                ...dentroDeVentana(new Date(ahora).toISOString()),
              ],
            },
            depth: 0,
            sort: 'createdAt',
            pagination: false,
          })
          .then((r) => r.docs)
      : Promise.resolve([] as Recurso[]),
    payload
      .find({
        collection: 'listas-asistencia',
        where: { convocatoria: { equals: convocatoria.id } },
        depth: 0,
        pagination: false,
      })
      .then((r) => r.docs),
    payload
      .find({
        collection: 'justificaciones',
        where: { inscripcion: { equals: inscripcion.id } },
        sort: '-createdAt',
        depth: 0,
        pagination: false,
      })
      .then((r) => r.docs),
  ])

  // Sin sesiones cargadas, el curso cuenta como una sola jornada.
  const filas = convocatoria.sesiones?.length
    ? [...convocatoria.sesiones].sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha))
    : [{ fecha: convocatoria.fechaInicio, duracionHoras: curso?.duracionHoras ?? null, tema: null }]

  const presentesPorSesion = new Map(
    listas.map((lista) => [lista.sesion, new Set((lista.presentes ?? []).map((p) => (typeof p === 'string' ? p : p.id)))]),
  )

  const deSesion = (numero: number | null, tipo: Recurso['tipo']) =>
    recursos.filter((recurso) => recurso.tipo === tipo && (recurso.sesion ?? null) === numero)

  const enlaceGeneral = deSesion(null, 'enlace_clase')[0] ?? null

  const sesiones: SesionDelAula[] = filas.map((fila, indice) => {
    const numero = indice + 1
    const inicio = Date.parse(fila.fecha)
    const duracionHoras = fila.duracionHoras ?? null
    const fin = inicio + (duracionHoras ?? 2) * HORA_MS
    const presentes = presentesPorSesion.get(numero)
    // Ordenadas de la mas nueva a la mas vieja: la primera es la vigente.
    const justificacion = justificaciones.find((j) => j.sesion === numero) ?? null

    const segunLista: EstadoAsistencia = presentes
      ? presentes.has(inscripcion.id)
        ? 'presente'
        : 'ausente'
      : inicio > ahora
        ? 'futura'
        : 'sin_registro'

    const aprobada = segunLista === 'ausente' && justificacion?.estado === 'aprobada' ? justificacion.resultado : null
    const asistencia: EstadoAsistencia = aprobada === 'presente' ? 'presente' : aprobada === 'justificada' ? 'justificada' : segunLista

    const plazoJustificacion = inicio + PLAZO_JUSTIFICACION_DIAS * DIA_MS
    const puedeJustificar =
      asistencia === 'ausente' &&
      ESTADOS_QUE_JUSTIFICAN.includes(inscripcion.estadoInscripcion) &&
      ahora <= plazoJustificacion &&
      (!justificacion || justificacion.estado === 'rechazada')

    return {
      numero,
      inicio,
      fin,
      tema: fila.tema ?? null,
      duracionHoras,
      asistencia,
      justificacion,
      puedeJustificar,
      plazoJustificacion,
      enlaceClase: deSesion(numero, 'enlace_clase')[0] ?? enlaceGeneral,
      grabaciones: deSesion(numero, 'grabacion'),
      materiales: [...deSesion(numero, 'material'), ...deSesion(numero, 'lectura')],
    }
  })

  // Lo que no cuelga de una sesion (o de una sesion que ya no existe) va como material general.
  const numerosValidos = new Set(sesiones.map((sesion) => sesion.numero))
  const materialGeneral = recursos.filter(
    (recurso) => recurso.tipo !== 'enlace_clase' && (recurso.sesion == null || !numerosValidos.has(recurso.sesion)),
  )

  const registradas = sesiones.filter((s) => s.asistencia === 'presente' || s.asistencia === 'ausente').length
  const presentes = sesiones.filter((s) => s.asistencia === 'presente').length
  const justificadas = sesiones.filter((s) => s.asistencia === 'justificada').length
  const ultima = sesiones.at(-1)
  const finCurso = convocatoria.fechaTermino ? Math.max(Date.parse(convocatoria.fechaTermino), ultima?.fin ?? 0) : ultima?.fin ?? 0

  return {
    inscripcion,
    convocatoria,
    curso,
    habilitada,
    sesiones,
    materialGeneral,
    asistencia: {
      presentes,
      registradas,
      justificadas,
      porcentaje: registradas ? Math.round((presentes / registradas) * 100) : null,
      minima: curso?.asistenciaMinima ?? 75,
    },
    terminado: ahora > finCurso,
    ahora,
  }
}
