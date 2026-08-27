import type { Caso } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

export async function obtenerCasosPublicados(limite = 100): Promise<Caso[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'casos',
    where: { _status: { equals: 'published' }, unidades: { contains: 'consulting' } },
    sort: '-createdAt',
    depth: 1,
    limit: limite,
  })

  return docs
}
