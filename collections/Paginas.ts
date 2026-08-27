import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAdmins, soloAutenticados } from '../access'
import { BLOQUES_PAGINA } from '../blocks'
import { grupoSeo } from '../fields/seo'
import { campoSlug } from '../fields/slug'
import { campoUnidad } from '../fields/unidad'
import { traducible } from '../lib/localizacion'
import { versionesConBorrador } from '../lib/versiones'

/**
 * Paginas armadas con bloques: home, "quienes somos", landings por unidad,
 * politica de privacidad. El contenido estructurado (cursos, articulos)
 * NO va aca: tiene su propia coleccion.
 */
export const Paginas: CollectionConfig = {
  slug: 'paginas',
  labels: { singular: 'Pagina', plural: 'Paginas' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'slug', 'unidad', '_status'],
    group: 'Transversal',
  },
  access: {
    read: publicadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAdmins,
  },
  versions: versionesConBorrador,
  fields: [
    traducible({ name: 'titulo', type: 'text', required: true }),
    {
      name: 'bloques',
      type: 'blocks',
      blocks: BLOQUES_PAGINA,
      admin: { initCollapsed: true },
    },
    campoSlug(),
    campoUnidad(false),
    grupoSeo,
  ],
}
