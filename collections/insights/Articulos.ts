import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { grupoSeo } from '../../fields/seo'
import { campoSlug } from '../../fields/slug'
import { campoUnidades } from '../../fields/unidad'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/**
 * Articulos y contenidos de Insights.
 * Aca `_status` + publicacion programada alcanzan: no hace falta un estado
 * de negocio adicional, salvo el archivado.
 */
export const Articulos: CollectionConfig = {
  slug: 'articulos',
  labels: { singular: 'Articulo', plural: 'Articulos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tipo', 'fechaPublicacion', '_status'],
    group: 'Insights',
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
    traducible({ name: 'bajada', type: 'textarea', required: true, maxLength: 300, label: 'Bajada / resumen' }),
    traducible({ name: 'contenido', type: 'richText' }),
    {
      name: 'tipo',
      type: 'select',
      required: true,
      defaultValue: 'articulo',
      options: [
        { label: 'Articulo', value: 'articulo' },
        { label: 'Analisis tecnico', value: 'analisis' },
        { label: 'Nota de LinkedIn', value: 'linkedin' },
        { label: 'Noticia', value: 'noticia' },
        { label: 'Caso comentado', value: 'caso_comentado' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'fechaPublicacion',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Fecha que se muestra. Para publicar a futuro usa "programar publicacion".',
      },
    },
    {
      name: 'destacado',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Aparece grande al inicio de /insights. Si hay varios, se muestra el mas reciente.',
      },
    },
    {
      name: 'archivado',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Sigue accesible por URL pero se oculta de los listados. Evita romper enlaces.',
      },
    },
    {
      name: 'autores',
      type: 'relationship',
      relationTo: 'personas',
      hasMany: true,
      filterOptions: { roles: { contains: 'autor' } },
      admin: { position: 'sidebar' },
    },
    { name: 'urlLinkedin', type: 'text', label: 'URL del post en LinkedIn', admin: { position: 'sidebar' } },
    campoUnidades(),
    campoSlug(),
    { name: 'imagenDestacada', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    { name: 'categorias', type: 'relationship', relationTo: 'categorias', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'tiempoLecturaMinutos', type: 'number', admin: { position: 'sidebar' } },
    grupoSeo,
  ],
}
