import type { Block } from 'payload'

import { traducible } from '../lib/localizacion'

/**
 * Bloques para armar paginas. Deliberadamente pocos y genericos:
 * un catalogo de 30 bloques termina en paginas inconsistentes.
 * Conviene agregar bloques cuando el diseno los pida, no antes.
 */

export const BloqueHero: Block = {
  slug: 'hero',
  labels: { singular: 'Portada', plural: 'Portadas' },
  fields: [
    traducible({ name: 'titulo', type: 'text', required: true }),
    traducible({ name: 'bajada', type: 'textarea' }),
    { name: 'imagenFondo', type: 'upload', relationTo: 'media' },
    {
      name: 'acciones',
      type: 'array',
      maxRows: 2,
      fields: [
        { name: 'texto', type: 'text', required: true },
        { name: 'enlace', type: 'text', required: true },
        { name: 'estilo', type: 'select', defaultValue: 'primario', options: [
          { label: 'Primario', value: 'primario' },
          { label: 'Secundario', value: 'secundario' },
        ] },
      ],
    },
  ],
}

export const BloqueContenido: Block = {
  slug: 'contenido',
  labels: { singular: 'Texto', plural: 'Bloques de texto' },
  fields: [traducible({ name: 'texto', type: 'richText', required: true })],
}

export const BloqueDestacados: Block = {
  slug: 'destacados',
  labels: { singular: 'Destacados', plural: 'Destacados' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    {
      name: 'origen',
      type: 'select',
      required: true,
      defaultValue: 'servicios',
      options: [
        { label: 'Servicios', value: 'servicios' },
        { label: 'Cursos', value: 'cursos' },
        { label: 'Proximas convocatorias', value: 'convocatorias' },
        { label: 'Tecnologias', value: 'tecnologias' },
        { label: 'Articulos', value: 'articulos' },
        { label: 'Casos', value: 'casos' },
        { label: 'Proyectos', value: 'proyectos' },
      ],
    },
    {
      name: 'cantidad',
      type: 'number',
      defaultValue: 3,
      admin: { description: 'Cuantos mostrar si la seleccion es automatica.' },
    },
    {
      name: 'seleccionManual',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Si se activa, elegis los documentos uno a uno.' },
    },
    {
      name: 'documentos',
      type: 'relationship',
      relationTo: ['servicios', 'cursos', 'convocatorias', 'tecnologias', 'articulos', 'casos', 'proyectos'],
      hasMany: true,
      admin: { condition: (_, siblingData) => Boolean(siblingData?.seleccionManual) },
    },
  ],
}

export const BloqueCTA: Block = {
  slug: 'cta',
  labels: { singular: 'Llamado a la accion', plural: 'Llamados a la accion' },
  fields: [
    traducible({ name: 'titulo', type: 'text', required: true }),
    traducible({ name: 'texto', type: 'textarea' }),
    { name: 'textoBoton', type: 'text', required: true },
    { name: 'enlace', type: 'text', required: true },
  ],
}

export const BloqueLogos: Block = {
  slug: 'logos',
  labels: { singular: 'Logos de clientes', plural: 'Logos de clientes' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    {
      name: 'clientes',
      type: 'relationship',
      relationTo: 'clientes',
      hasMany: true,
      filterOptions: { mostrarLogo: { equals: true } }, // solo los autorizados
    },
  ],
}

export const BloqueFaq: Block = {
  slug: 'faq',
  labels: { singular: 'Preguntas frecuentes', plural: 'Preguntas frecuentes' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    traducible({
      name: 'preguntas',
      type: 'array',
      fields: [
        { name: 'pregunta', type: 'text', required: true },
        { name: 'respuesta', type: 'richText', required: true },
      ],
    }),
  ],
}

export const BloqueEquipo: Block = {
  slug: 'equipo',
  labels: { singular: 'Equipo', plural: 'Equipo' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    { name: 'personas', type: 'relationship', relationTo: 'personas', hasMany: true },
  ],
}

export const BLOQUES_PAGINA = [
  BloqueHero,
  BloqueContenido,
  BloqueDestacados,
  BloqueCTA,
  BloqueLogos,
  BloqueFaq,
  BloqueEquipo,
]
