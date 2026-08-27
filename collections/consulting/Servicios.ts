import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { grupoSeo } from '../../fields/seo'
import { campoSlug } from '../../fields/slug'
import { campoUnidad } from '../../fields/unidad'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/** Asesorias y auditorias que ofrece la consultora. */
export const Servicios: CollectionConfig = {
  slug: 'servicios',
  labels: { singular: 'Servicio', plural: 'Servicios' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'unidad', 'tipo', '_status'],
    group: 'Consulting',
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
    traducible({
      name: 'entregables',
      type: 'array',
      label: 'Entregables',
      fields: [{ name: 'entregable', type: 'text', required: true }],
    }),
    traducible({
      name: 'beneficios',
      type: 'array',
      label: 'Beneficios para el cliente',
      fields: [{ name: 'beneficio', type: 'text', required: true }],
    }),
    traducible({ name: 'dirigidoA', type: 'textarea', label: 'Dirigido a' }),
    {
      name: 'tipo',
      type: 'select',
      options: [
        { label: 'Asesoria', value: 'asesoria' },
        { label: 'Auditoria', value: 'auditoria' },
        { label: 'Diagnostico', value: 'diagnostico' },
        { label: 'Implementacion', value: 'implementacion' },
        { label: 'Acompanamiento continuo', value: 'acompanamiento' },
      ],
      admin: { position: 'sidebar' },
    },
    campoUnidad(true),
    campoSlug(),
    { name: 'imagenDestacada', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    { name: 'categorias', type: 'relationship', relationTo: 'categorias', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'orden', type: 'number', admin: { position: 'sidebar', description: 'Menor numero aparece primero.' } },
    grupoSeo,
  ],
}
