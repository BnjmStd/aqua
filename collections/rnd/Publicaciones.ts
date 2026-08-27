import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { campoSlug } from '../../fields/slug'
import { versionesConBorrador } from '../../lib/versiones'

/**
 * Publicaciones cientificas y tecnicas.
 * Se separa de Articulos porque tiene metadatos academicos propios (DOI,
 * revista, indexacion) que no aplican a un post de blog.
 */
export const Publicaciones: CollectionConfig = {
  slug: 'publicaciones',
  labels: { singular: 'Publicacion', plural: 'Publicaciones' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tipo', 'anio', 'revista'],
    group: 'R&D',
  },
  access: {
    read: publicadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  versions: versionesConBorrador,
  fields: [
    { name: 'titulo', type: 'text', required: true },
    campoSlug(),
    { name: 'abstract', type: 'textarea' },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Articulo cientifico', value: 'paper' },
        { label: 'Capitulo de libro', value: 'capitulo' },
        { label: 'Ponencia en congreso', value: 'ponencia' },
        { label: 'Informe tecnico', value: 'informe' },
        { label: 'Tesis dirigida', value: 'tesis' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'anio', type: 'number', required: true, admin: { position: 'sidebar' } },
    { name: 'revista', type: 'text', label: 'Revista o editorial' },
    { name: 'doi', type: 'text', label: 'DOI' },
    { name: 'url', type: 'text', label: 'Enlace externo' },
    { name: 'indexacion', type: 'select', hasMany: true, options: [
      { label: 'WoS / ISI', value: 'wos' },
      { label: 'Scopus', value: 'scopus' },
      { label: 'SciELO', value: 'scielo' },
      { label: 'Latindex', value: 'latindex' },
    ], admin: { position: 'sidebar' } },
    {
      name: 'autoresTexto',
      type: 'text',
      label: 'Autores (cita completa)',
      admin: { description: 'Tal como aparece en la publicacion, incluyendo autores externos.' },
    },
    {
      name: 'autoresInternos',
      type: 'relationship',
      relationTo: 'personas',
      hasMany: true,
      admin: { description: 'Para enlazar con las fichas del equipo.' },
    },
    { name: 'proyecto', type: 'relationship', relationTo: 'proyectos' },
    { name: 'archivo', type: 'upload', relationTo: 'media', label: 'PDF (si es de acceso abierto)' },
  ],
}
