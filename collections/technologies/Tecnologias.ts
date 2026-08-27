import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { grupoSeo } from '../../fields/seo'
import { campoSlug } from '../../fields/slug'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/** Productos o soluciones tecnologicas representadas. */
export const Tecnologias: CollectionConfig = {
  slug: 'tecnologias',
  labels: { singular: 'Tecnologia', plural: 'Tecnologias' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'partner', 'estadoRepresentacion', '_status'],
    group: 'Technologies',
  },
  access: {
    read: publicadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  versions: versionesConBorrador,
  fields: [
    traducible({ name: 'titulo', type: 'text', required: true }),
    traducible({ name: 'resumen', type: 'textarea', required: true, maxLength: 300 }),
    traducible({ name: 'descripcion', type: 'richText' }),
    { name: 'partner', type: 'relationship', relationTo: 'partners', required: true },
    traducible({
      name: 'aplicaciones',
      type: 'array',
      label: 'Aplicaciones',
      fields: [{ name: 'aplicacion', type: 'text', required: true }],
    }),
    traducible({
      name: 'especificaciones',
      type: 'array',
      label: 'Especificaciones tecnicas',
      fields: [
        { name: 'parametro', type: 'text', required: true },
        { name: 'valor', type: 'text', required: true },
      ],
    }),
    {
      name: 'fichaTecnica',
      type: 'upload',
      relationTo: 'media',
      label: 'Ficha tecnica (PDF)',
    },
    { name: 'galeria', type: 'array', label: 'Galeria', fields: [{ name: 'imagen', type: 'upload', relationTo: 'media', required: true }] },
    {
      // EJE COMERCIAL, distinto de publicado/borrador.
      name: 'estadoRepresentacion',
      type: 'select',
      required: true,
      defaultValue: 'vigente',
      options: [
        { label: 'Vigente', value: 'vigente' },
        { label: 'En evaluacion', value: 'evaluacion' },
        { label: 'Descontinuada', value: 'descontinuada' },
      ],
      admin: { position: 'sidebar' },
    },
    campoSlug(),
    { name: 'imagenDestacada', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    { name: 'categorias', type: 'relationship', relationTo: 'categorias', hasMany: true, admin: { position: 'sidebar' } },
    grupoSeo,
  ],
}
