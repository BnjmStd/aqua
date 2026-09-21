import type { Access, Payload, Where } from 'payload'

import type { Inscripcione } from '../payload-types'
import { esPersonalDelPanel } from './index'

/**
 * Acceso al "aula" de un curso: enlace de clase, material, grabaciones.
 * Ver docs/plan-aula-cursos.md.
 *
 * Solo lo ven las inscripciones confirmadas o con asistencia registrada.
 * Pendiente / lista de espera todavia no (no hay cupo asegurado); no asistio
 * y cancelada, ya no.
 */
export const ESTADOS_CON_AULA: Inscripcione['estadoInscripcion'][] = ['confirmada', 'asistio']

export const tieneAula = (inscripcion: Pick<Inscripcione, 'estadoInscripcion'>) =>
  ESTADOS_CON_AULA.includes(inscripcion.estadoInscripcion)

/** Convocatorias y cursos cuyo aula puede abrir la cuenta. */
export async function alcanceDelAula(payload: Payload, cuentaId: string) {
  const { docs } = await payload.find({
    collection: 'inscripciones',
    where: { and: [{ cuenta: { equals: cuentaId } }, { estadoInscripcion: { in: ESTADOS_CON_AULA } }] },
    depth: 1,
    limit: 500,
    pagination: false,
  })

  const convocatorias = new Set<string>()
  const cursos = new Set<string>()
  for (const inscripcion of docs) {
    const convocatoria = inscripcion.convocatoria
    if (typeof convocatoria === 'string') {
      convocatorias.add(convocatoria)
      continue
    }
    convocatorias.add(convocatoria.id)
    cursos.add(typeof convocatoria.curso === 'string' ? convocatoria.curso : convocatoria.curso.id)
  }
  return { convocatorias: [...convocatorias], cursos: [...cursos] }
}

/** Filtro de ventana de visibilidad: sin fecha = siempre. */
export function dentroDeVentana(ahora: string): Where[] {
  return [
    { or: [{ visibleDesde: { exists: false } }, { visibleDesde: { less_than_equal: ahora } }] },
    { or: [{ visibleHasta: { exists: false } }, { visibleHasta: { greater_than_equal: ahora } }] },
  ]
}

/**
 * `access.read` de Recursos. Se aplica tambien al servir el ARCHIVO
 * (/api/recursos/file/...): Payload corre esta funcion y cruza el `Where`
 * con el nombre del archivo, asi que un enlace copiado no le sirve a quien
 * no esta inscrito.
 */
export const leerRecursos: Access = async ({ req }) => {
  const { user, payload } = req
  if (esPersonalDelPanel(user)) return true
  if (!user || (user as { collection?: string }).collection !== 'cuentas') return false

  const { convocatorias, cursos } = await alcanceDelAula(payload, String(user.id))
  if (!convocatorias.length) return false

  return {
    and: [
      {
        or: [
          { and: [{ alcance: { equals: 'convocatoria' } }, { convocatoria: { in: convocatorias } }] },
          { and: [{ alcance: { equals: 'curso' } }, { curso: { in: cursos } }] },
        ],
      },
      ...dentroDeVentana(new Date().toISOString()),
    ],
  }
}
