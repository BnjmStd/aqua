import type { Bioindicadore } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/**
 * Bioindicadores publicados, en el orden definido en la colección. `depth: 1`
 * para traer la imagen resuelta. La Local API ignora el control de acceso, así
 * que el filtro `_status` va explícito (mismo criterio que casos y servicios).
 */
export async function obtenerBioindicadores(): Promise<Bioindicadore[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'bioindicadores',
    where: { _status: { equals: 'published' } },
    sort: 'orden',
    depth: 1,
    limit: 50,
  })

  return docs
}
