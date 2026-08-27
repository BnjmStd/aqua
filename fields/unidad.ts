import type { Field } from 'payload'

/**
 * Las seis lineas de negocio de aquabioprocess.cl.
 * Es la espina dorsal de la arquitectura de informacion: casi todo lo publicable
 * pertenece a una unidad, y de ahi salen las paginas por unidad sin trabajo extra.
 */
export const UNIDADES = [
  { label: 'Consultoría — asesorias y auditorias', value: 'consulting' },
  { label: 'Academia — capacitacion', value: 'academy' },
  { label: 'Tecnologías — representacion tecnologica', value: 'technologies' },
  { label: 'Insights — contenidos y publicaciones', value: 'insights' },
  { label: 'R&D — investigacion aplicada', value: 'rnd' },
] as const

export type Unidad = (typeof UNIDADES)[number]['value']

/**
 * @param required Casos y articulos pueden ser transversales; cursos no.
 */
export const campoUnidad = (required = true): Field => ({
  name: 'unidad',
  type: 'select',
  options: [...UNIDADES],
  required,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Linea de negocio a la que pertenece este contenido.',
  },
})

/** Version multiple, para contenido que cruza unidades (ej: un caso de Consulting + R&D). */
export const campoUnidades = (): Field => ({
  name: 'unidades',
  type: 'select',
  hasMany: true,
  options: [...UNIDADES],
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Puede pertenecer a mas de una linea de negocio.',
  },
})
