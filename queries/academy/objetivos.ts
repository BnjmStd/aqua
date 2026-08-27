import type { Objetivo } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

export async function obtenerObjetivosDeCurso(cursoId: string): Promise<Objetivo[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'objetivos',
    where: { curso: { equals: cursoId } },
    sort: 'orden',
    depth: 0,
    limit: 100,
  })

  return docs
}
