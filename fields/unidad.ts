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
 * URL publica de cada unidad. Va aparte del `value` a proposito: el `value`
 * se guarda en la base (select de Payload) y cambiarlo exige migrar datos; la
 * ruta es solo presentacion. Insights y R&D quedan en ingles como marca.
 *
 * Si cambias una ruta, agrega el 301 desde la anterior en next.config.ts.
 */
export const RUTA_UNIDAD: Record<Unidad, string> = {
  consulting: '/consultoria',
  academy: '/academia',
  technologies: '/tecnologias',
  insights: '/insights',
  rnd: '/rnd',
}

/**
 * Unidades que todavia no tienen pagina publica (`/technologies`, `/rnd` dan
 * 404). Se omiten de los menus hasta que existan; sacar de aca para publicarlas.
 */
export const UNIDADES_SIN_PAGINA: readonly Unidad[] = ['technologies', 'rnd']

/** Unidades con pagina publica, para armar navegacion (header, footer). */
export const UNIDADES_NAVEGABLES = UNIDADES.filter(
  (unidad) => !UNIDADES_SIN_PAGINA.includes(unidad.value),
)

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
