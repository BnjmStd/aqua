import type { Servicio } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

export async function obtenerServiciosPublicados(): Promise<Servicio[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'servicios',
    where: { _status: { equals: 'published' }, unidad: { equals: 'consulting' } },
    sort: 'orden',
    depth: 0,
    limit: 100,
  })

  return docs
}
