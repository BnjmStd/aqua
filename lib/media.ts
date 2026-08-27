import type { Media } from '@/payload-types'

type TamanoMedia = keyof NonNullable<Media['sizes']>

/**
 * Punto unico para resolver la URL de una imagen de Payload. Prueba el
 * tamano pedido (ver `imageSizes` en collections/Media.ts), y si no existe
 * (imagen vieja, subida antes de agregar ese tamano) cae al original.
 */
export function urlDeMedia(
  media: Media | string | null | undefined,
  tamano?: TamanoMedia,
): string | null {
  if (!media || typeof media === 'string') return null

  const url = tamano ? media.sizes?.[tamano]?.url : undefined
  return url ?? media.url ?? null
}
