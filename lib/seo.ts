import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { urlDeMedia } from './media'

type GrupoSeo = {
  titulo?: string | null
  descripcion?: string | null
  imagen?: string | Media | null
  noIndexar?: boolean | null
} | null | undefined

type Fallback = {
  titulo: string
  descripcion?: string | null
}

/**
 * Implementa el fallback documentado en el propio campo (fields/seo.ts):
 * si el grupo SEO viene vacio, se usa el titulo y el resumen del documento.
 */
export function metadataDesdeSeo(seo: GrupoSeo, fallback: Fallback): Metadata {
  const titulo = seo?.titulo || fallback.titulo
  const descripcion = seo?.descripcion || fallback.descripcion || undefined
  const imagen = urlDeMedia(seo?.imagen, 'og')

  return {
    title: titulo,
    description: descripcion,
    robots: seo?.noIndexar ? { index: false, follow: false } : undefined,
    openGraph: {
      title: titulo,
      description: descripcion,
      images: imagen ? [{ url: imagen }] : undefined,
    },
  }
}
