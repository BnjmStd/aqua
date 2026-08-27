import type { Convocatoria } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/**
 * Local API con `overrideAccess: true`: el filtro de "publicado" se escribe
 * a mano, igual que en queries/academy/cursos.ts.
 */
const PUBLICADA = { _status: { equals: 'published' } } as const

export type ConvocatoriaConCupo = Convocatoria & { cuposDisponibles: number | null }

/**
 * Convocatorias con inscripcion abierta, mas proximas primero.
 * `cuposDisponibles` se calcula aca (no via el hook `inscritosConfirmados`,
 * que se salta a proposito en findMany) porque solo mostramos un puñado en
 * la landing: el costo de un count() extra por tarjeta es aceptable.
 */
export async function obtenerProximasConvocatorias(limite = 3): Promise<ConvocatoriaConCupo[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'convocatorias',
    where: {
      ...PUBLICADA,
      estadoConvocatoria: { equals: 'inscripciones_abiertas' },
      fechaInicio: { greater_than_equal: new Date().toISOString() },
    },
    sort: 'fechaInicio',
    depth: 1,
    limit: limite,
  })

  return Promise.all(
    docs.map(async (convocatoria) => {
      const { totalDocs } = await payload.count({
        collection: 'inscripciones',
        where: {
          convocatoria: { equals: convocatoria.id },
          estadoInscripcion: { in: ['confirmada', 'asistio'] },
        },
      })

      return {
        ...convocatoria,
        cuposDisponibles: Math.max(convocatoria.valor.cupoMaximo - totalDocs, 0),
      }
    }),
  )
}
