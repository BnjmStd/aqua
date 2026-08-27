import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { campoSlug } from '../../fields/slug'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/** Fabricantes y marcas que aquabioprocess representa comercialmente. */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partner', plural: 'Partners' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'pais', 'tipoRepresentacion', '_status'],
    group: 'Technologies',
    description: 'La marca o fabricante. Sus productos van en Tecnologias.',
  },
  access: {
    read: publicadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  versions: versionesConBorrador,
  fields: [
    { name: 'nombre', type: 'text', required: true },
    campoSlug('nombre'),
    traducible({ name: 'descripcion', type: 'richText' }),
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'sitioWeb', type: 'text' },
    { name: 'pais', type: 'text', label: 'Pais de origen' },
    {
      name: 'tipoRepresentacion',
      type: 'select',
      options: [
        { label: 'Representacion exclusiva', value: 'exclusiva' },
        { label: 'Distribuidor autorizado', value: 'distribuidor' },
        { label: 'Alianza tecnica', value: 'alianza' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'vigenteDesde', type: 'date', admin: { position: 'sidebar' } },
  ],
}
