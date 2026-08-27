/**
 * Nombres de los iconos disponibles. Vive aparte de `components/ui/iconos.tsx`
 * porque la config de Payload necesita la lista para armar el select y no puede
 * importar un modulo con JSX. El registro de `iconos.tsx` se tipa contra esta
 * lista, asi que agregar un nombre aca obliga a dibujar el icono alla.
 */
export const NOMBRES_ICONO = [
  'lupa',
  'birrete',
  'chip',
  'documento',
  'matraz',
  'molecula',
  'ajustes',
  'grafico',
  'casco',
] as const

export type NombreIcono = (typeof NOMBRES_ICONO)[number]
