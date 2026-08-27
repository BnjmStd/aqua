import type { FieldHook } from 'payload'

/** Convierte texto a slug URL-safe. Maneja tildes y enie del espanol. */
export const aSlug = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita diacriticos: acentos y dieresis
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Genera el slug desde otro campo si el editor no lo escribio a mano.
 * Solo autogenera al crear: si un documento ya esta publicado, cambiarle el
 * titulo NO le cambia la URL (eso romperia enlaces y SEO).
 */
export const formatearSlug =
  (campoOrigen: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string' && value.length > 0) return aSlug(value)

    if (operation === 'create' || !originalDoc?.slug) {
      const origen = data?.[campoOrigen] ?? originalDoc?.[campoOrigen]
      if (typeof origen === 'string' && origen.length > 0) return aSlug(origen)
    }

    return value
  }
