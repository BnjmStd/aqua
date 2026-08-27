import type { Curso } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/**
 * La Local API de Payload usa `overrideAccess: true` por defecto: el
 * `access.read` de la coleccion (publicadosOAutenticados, en access/index.ts)
 * NO se aplica aca. Por eso el filtro de "publicado" se escribe a mano en
 * cada query publica — copiar este patron al agregar Servicios/Casos/etc.
 */
const PUBLICADO = { _status: { equals: 'published' } } as const

export async function obtenerCursosPublicados(): Promise<Curso[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'cursos',
    where: {
      ...PUBLICADO,
      estadoProducto: { not_equals: 'en_desarrollo' },
    },
    sort: 'titulo',
    depth: 1,
    limit: 100,
  })

  return docs
}

export async function obtenerCursoPorSlug(slug: string): Promise<Curso | null> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'cursos',
    where: {
      ...PUBLICADO,
      estadoProducto: { not_equals: 'en_desarrollo' },
      slug: { equals: slug },
    },
    depth: 1,
    limit: 1,
  })

  return docs[0] ?? null
}
