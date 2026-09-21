import type { Servicio } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

export async function obtenerServiciosPublicados(): Promise<Servicio[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'servicios',
    where: { _status: { equals: 'published' }, unidad: { equals: 'consulting' } },
    sort: 'orden',
    depth: 1,
    limit: 100,
  })

  return docs
}

export async function obtenerServicioPorSlug(slug: string): Promise<Servicio | null> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'servicios',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { unidad: { equals: 'consulting' } },
        { slug: { equals: slug } },
      ],
    },
    depth: 1,
    limit: 1,
  })

  return docs[0] ?? null
}
