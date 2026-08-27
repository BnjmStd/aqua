import type { CollectionConfig } from 'payload'

import type { FieldAccess } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { grupoSeo } from '../../fields/seo'
import { campoSlug } from '../../fields/slug'
import { campoUnidades } from '../../fields/unidad'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/**
 * Casos de exito. Muchos trabajos de consultoria estan bajo confidencialidad,
 * por eso `clienteAnonimo` permite publicar el caso sin nombrar al cliente.
 */
/**
 * La identidad del cliente se oculta al publico cuando el caso es anonimo.
 *
 * El `admin.condition` de mas abajo solo esconde el campo en el panel: la
 * API seguia devolviendo el cliente vinculado en casos marcados como
 * confidenciales. Ocultar no es proteger; esto si lo protege.
 */
const clienteVisible: FieldAccess = ({ doc, req: { user } }) => {
  if (user) return true
  return !doc?.clienteAnonimo
}

export const Casos: CollectionConfig = {
  slug: 'casos',
  labels: { singular: 'Caso', plural: 'Casos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'cliente', 'clienteAnonimo', '_status'],
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
    traducible({ name: 'desafio', type: 'richText', label: 'El desafio' }),
    traducible({ name: 'solucion', type: 'richText', label: 'La solucion' }),
    traducible({ name: 'resultados', type: 'richText', label: 'Resultados' }),
    {
      name: 'metricas',
      type: 'array',
      label: 'Metricas de impacto',
      admin: { description: 'Cifras concretas. Es lo que mas convence en un caso.' },
      fields: [
        { name: 'valor', type: 'text', required: true, admin: { description: 'Ej: "-32%"' } },
        { name: 'descripcion', type: 'text', required: true, admin: { description: 'Ej: "consumo de agua"' } },
      ],
    },
    {
      name: 'clienteAnonimo',
      type: 'checkbox',
      label: 'Publicar sin identificar al cliente',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Para trabajos bajo confidencialidad.' },
    },
    {
      name: 'cliente',
      type: 'relationship',
      relationTo: 'clientes',
      access: { read: clienteVisible },
      admin: {
        position: 'sidebar',
        condition: (data) => !data?.clienteAnonimo,
      },
    },
    {
      name: 'descripcionClienteAnonimo',
      type: 'text',
      label: 'Como describir al cliente',
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.clienteAnonimo),
        description: 'Ej: "salmonicultora de la Region de Los Lagos".',
      },
    },
    campoUnidades(),
    campoSlug(),
    { name: 'imagenDestacada', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    { name: 'categorias', type: 'relationship', relationTo: 'categorias', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'servicios', type: 'relationship', relationTo: 'servicios', hasMany: true, admin: { position: 'sidebar' } },
    grupoSeo,
  ],
}
