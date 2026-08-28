import type { Block, Field } from 'payload'

import { NOMBRES_ICONO } from '../fields/iconos'
import { UNIDADES } from '../fields/unidad'
import { traducible } from '../lib/localizacion'

/**
 * Bloques para armar paginas. Deliberadamente pocos y genericos:
 * un catalogo de 30 bloques termina en paginas inconsistentes.
 * Conviene agregar bloques cuando el diseno los pida, no antes.
 */

/** Botones de un hero: hasta dos, primario + secundario. Compartido hero/perfil. */
const campoAcciones: Field = {
  name: 'acciones',
  type: 'array',
  maxRows: 2,
  fields: [
    { name: 'texto', type: 'text', required: true },
    { name: 'enlace', type: 'text', required: true },
    {
      name: 'estilo',
      type: 'select',
      defaultValue: 'primario',
      options: [
        { label: 'Primario', value: 'primario' },
        { label: 'Secundario', value: 'secundario' },
      ],
    },
  ],
}

export const BloqueHero: Block = {
  slug: 'hero',
  labels: { singular: 'Portada', plural: 'Portadas' },
  fields: [
    traducible({
      name: 'antetitulo',
      type: 'text',
      admin: {
        description:
          'Linea corta sobre el titulo. Texto libre: la razon social canonica esta en Configuracion del sitio.',
      },
    }),
    traducible({ name: 'titulo', type: 'text', required: true }),
    traducible({ name: 'bajada', type: 'textarea' }),
    { name: 'imagenFondo', type: 'upload', relationTo: 'media' },
    {
      name: 'esquema',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Muestra el esquema animado de la linea de tratamiento a la derecha del texto (solo en pantallas grandes).',
      },
    },
    campoAcciones,
  ],
}

export const BloquePerfil: Block = {
  slug: 'perfil',
  labels: { singular: 'Perfil', plural: 'Perfiles' },
  fields: [
    traducible({
      name: 'antetitulo',
      type: 'text',
      admin: { description: 'Linea corta sobre el nombre, en mayusculas. Ej: FUNDADOR Y CONSULTOR PRINCIPAL.' },
    }),
    traducible({ name: 'nombre', type: 'text', required: true }),
    traducible({ name: 'subtitulo', type: 'text', admin: { description: 'Cargo o titulo profesional.' } }),
    traducible({ name: 'texto', type: 'textarea' }),
    { name: 'foto', type: 'upload', relationTo: 'media' },
    campoAcciones,
    {
      name: 'estadisticas',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Dato', plural: 'Datos' },
      admin: { description: 'Se muestran sobre la foto. Ej: EXPERIENCIA / 20+ anios.' },
      fields: [
        { name: 'etiqueta', type: 'text', required: true },
        { name: 'valor', type: 'text', required: true },
      ],
    },
  ],
}

export const BloqueProceso: Block = {
  slug: 'proceso',
  labels: { singular: 'Proceso animado', plural: 'Procesos animados' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    traducible({ name: 'bajada', type: 'textarea' }),
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

export const BloqueUnidades: Block = {
  slug: 'unidades',
  labels: { singular: 'Unidades de negocio', plural: 'Unidades de negocio' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    traducible({ name: 'bajada', type: 'textarea' }),
    {
      name: 'tarjetas',
      type: 'array',
      maxRows: UNIDADES.length,
      admin: { description: 'El icono y el enlace salen de la unidad; aca solo se escribe la descripcion.' },
      fields: [
        {
          name: 'unidad',
          type: 'select',
          required: true,
          options: [...UNIDADES],
        },
        traducible({ name: 'descripcion', type: 'textarea', required: true }),
      ],
    },
  ],
}

export const BloquePropuesta: Block = {
  slug: 'propuesta',
  labels: { singular: 'Propuesta de valor', plural: 'Propuestas de valor' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    traducible({ name: 'bajada', type: 'textarea' }),
    {
      name: 'pilares',
      type: 'array',
      maxRows: 4,
      admin: {
        description:
          'Exactamente cuatro: la grilla es un bento 2-1-1-2 y el ancho de cada tarjeta sale de su posicion, no se elige.',
      },
      fields: [
        traducible({ name: 'titulo', type: 'text', required: true }),
        traducible({ name: 'descripcion', type: 'textarea', required: true }),
        {
          name: 'icono',
          type: 'select',
          required: true,
          options: [...NOMBRES_ICONO],
        },
      ],
    },
  ],
}

export const BloquePresencia: Block = {
  slug: 'presencia',
  labels: { singular: 'Presencia geografica', plural: 'Presencia geografica' },
  fields: [
    traducible({ name: 'titulo', type: 'text' }),
    traducible({ name: 'bajada', type: 'textarea' }),
    {
      name: 'antetitulo',
      type: 'text',
      admin: { description: 'Linea corta sobre el titulo, en mayusculas. Ej: PRESENCIA INDUSTRIAL.' },
    },
    {
      name: 'paises',
      type: 'array',
      labels: { singular: 'Pais', plural: 'Paises' },
      fields: [
        { name: 'pais', type: 'text', required: true },
        {
          name: 'plantas',
          type: 'array',
          fields: [
            { name: 'nombre', type: 'text', required: true },
            traducible({ name: 'descripcion', type: 'textarea', required: true }),
            {
              name: 'insignia',
              type: 'checkbox',
              label: 'Proyecto insignia',
              defaultValue: false,
              admin: { description: 'Resalta la tarjeta con un acento.' },
            },
          ],
        },
      ],
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
  BloqueProceso,
  BloquePerfil,
  BloqueContenido,
  BloqueDestacados,
  BloqueUnidades,
  BloquePropuesta,
  BloquePresencia,
  BloqueCTA,
  BloqueLogos,
  BloqueFaq,
  BloqueEquipo,
]
