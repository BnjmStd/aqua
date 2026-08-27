import type { CollectionConfig } from 'payload'

import type { FieldAccess } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { grupoSeo } from '../../fields/seo'
import { campoSlug } from '../../fields/slug'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/** Proyectos de I+D, pilotos e innovacion aplicada. */
/**
 * Un proyecto marcado `confidencial` puede tener ficha publica (titulo y
 * resumen) sin exponer resultados, financiamiento ni contrapartes.
 * Si el estado dice confidencial, tiene que serlo tambien en la API.
 */
const detalleNoConfidencial: FieldAccess = ({ doc, req: { user } }) => {
  if (user) return true
  return doc?.estadoProyecto !== 'confidencial'
}

export const Proyectos: CollectionConfig = {
  slug: 'proyectos',
  labels: { singular: 'Proyecto', plural: 'Proyectos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'estadoProyecto', 'anioInicio', '_status'],
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
    traducible({ name: 'titulo', type: 'text', required: true }),
    traducible({ name: 'resumen', type: 'textarea', required: true, maxLength: 300 }),
    traducible({ name: 'descripcion', type: 'richText' }),
    traducible({ name: 'objetivos', type: 'array', fields: [{ name: 'objetivo', type: 'text', required: true }] }),
    {
      ...traducible({ name: 'resultados', type: 'richText', label: 'Resultados obtenidos' }),
      access: { read: detalleNoConfidencial },
    },
    {
      name: 'tipo',
      type: 'select',
      options: [
        { label: 'Investigacion aplicada', value: 'investigacion' },
        { label: 'Piloto', value: 'piloto' },
        { label: 'Prueba de concepto', value: 'poc' },
        { label: 'Desarrollo de producto', value: 'desarrollo' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      // Un proyecto confidencial puede estar publicado como ficha minima
      // sin exponer resultados. El eje es distinto al de publicacion.
      name: 'estadoProyecto',
      type: 'select',
      required: true,
      defaultValue: 'en_curso',
      options: [
        { label: 'En formulacion', value: 'formulacion' },
        { label: 'En curso', value: 'en_curso' },
        { label: 'Finalizado', value: 'finalizado' },
        { label: 'Confidencial', value: 'confidencial' },
        { label: 'Suspendido', value: 'suspendido' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'anioInicio', type: 'number', admin: { width: '50%' } },
        { name: 'anioTermino', type: 'number', admin: { width: '50%' } },
      ],
    },
    {
      name: 'financiamiento',
      type: 'group',
      access: { read: detalleNoConfidencial },
      fields: [
        { name: 'fuente', type: 'text', admin: { description: 'Ej: CORFO, ANID, FIA, privado.' } },
        { name: 'codigoProyecto', type: 'text' },
      ],
    },
    {
      name: 'contrapartes',
      type: 'array',
      label: 'Contrapartes y socios',
      access: { read: detalleNoConfidencial },
      fields: [
        { name: 'nombre', type: 'text', required: true },
        { name: 'tipo', type: 'select', options: [
          { label: 'Universidad', value: 'universidad' },
          { label: 'Centro de investigacion', value: 'centro' },
          { label: 'Empresa', value: 'empresa' },
          { label: 'Sector publico', value: 'publico' },
        ] },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'equipo',
      type: 'relationship',
      relationTo: 'personas',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    campoSlug(),
    { name: 'imagenDestacada', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    { name: 'categorias', type: 'relationship', relationTo: 'categorias', hasMany: true, admin: { position: 'sidebar' } },
    grupoSeo,
  ],
}
