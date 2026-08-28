import type { Articulo } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/**
 * La Local API usa `overrideAccess: true`: el `access.read` de la colección no
 * se aplica, así que el filtro de publicado va explícito (ver queries/academy).
 */
const PUBLICADO = { _status: { equals: 'published' } } as const

/** Artículos publicados y no archivados, del más nuevo al más viejo. */
export async function obtenerArticulosPublicados(): Promise<Articulo[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'articulos',
    where: { ...PUBLICADO, archivado: { not_equals: true } },
    sort: '-fechaPublicacion',
    depth: 1,
    limit: 100,
  })

  return docs
}

/**
 * Un artículo por slug. No filtra `archivado`: un artículo retirado de los
 * listados sigue accesible por URL para no romper enlaces. `depth: 2` puebla
 * las imágenes embebidas en el rich text.
 */
export async function obtenerArticuloPorSlug(slug: string): Promise<Articulo | null> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'articulos',
    where: { ...PUBLICADO, slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  return docs[0] ?? null
}
