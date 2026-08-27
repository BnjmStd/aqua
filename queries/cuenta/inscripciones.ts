import type { Inscripcione } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/**
 * Lee las inscripciones de la cuenta logueada. Se filtra por `cuenta` en la
 * query (no basta con `access.read` — sin el filtro traeria TODAS las que
 * el access permite y aca solo interesan las propias).
 */
export async function obtenerMisInscripciones(cuentaId: string): Promise<Inscripcione[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'inscripciones',
    where: { cuenta: { equals: cuentaId } },
    sort: '-createdAt',
    depth: 1,
    limit: 50,
  })

  return docs
}
