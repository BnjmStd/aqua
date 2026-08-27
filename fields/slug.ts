import type { Field } from 'payload'

import { formatearSlug } from '../hooks/formatearSlug'

/**
 * Slug unico e indexado. Se autogenera al crear y despues queda congelado,
 * salvo que lo edites a mano.
 */
export const campoSlug = (campoOrigen = 'titulo'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'URL del contenido. Se genera solo desde el titulo; cambiarlo rompe enlaces existentes.',
  },
  hooks: {
    beforeValidate: [formatearSlug(campoOrigen)],
  },
})
