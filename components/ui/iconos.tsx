import type { NombreIcono } from '@/fields/iconos'

/**
 * Registro unico de iconos del sitio. La maqueta usa Material Symbols cargado
 * desde Google Fonts; aca van en SVG inline para no sumar una fuente externa
 * solo por un punado de glifos (decidimos no migrar tipografias del template).
 *
 * Trazo, no relleno: el color lo pone el contenedor via `currentColor`.
 */
const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const ICONOS: Record<NombreIcono, React.ReactNode> = {
  /** Auditoria y diagnostico. */
  lupa: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" {...trazo} />
      <path d="M15.5 15.5 L21 21" {...trazo} />
    </>
  ),
  /** Formacion. */
  birrete: (
    <>
      <path d="M12 3.5 22 8.5 12 13.5 2 8.5 Z" {...trazo} />
      <path d="M6.5 10.8 V16 c0 1.6 2.5 3 5.5 3 s5.5-1.4 5.5-3 v-5.2" {...trazo} />
    </>
  ),
  /** Tecnologia. */
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" {...trazo} />
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" {...trazo} />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" {...trazo} />
    </>
  ),
  /** Publicaciones. */
  documento: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" {...trazo} />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" {...trazo} />
    </>
  ),
  /** Investigacion aplicada, pilotajes. */
  matraz: (
    <>
      <path d="M9.5 3h5" {...trazo} />
      <path d="M10 3v6.2L5 18.6A1.5 1.5 0 0 0 6.3 21h11.4a1.5 1.5 0 0 0 1.3-2.4L14 9.2V3" {...trazo} />
      <path d="M7.3 15h9.4" {...trazo} />
    </>
  ),
  /** Ciencia y biologia. Los trazos se acortan en el radio para no cruzar los nodos. */
  molecula: (
    <>
      <circle cx="12" cy="5.5" r="2.5" {...trazo} />
      <circle cx="5.5" cy="16.5" r="2.5" {...trazo} />
      <circle cx="18.5" cy="16.5" r="2.5" {...trazo} />
      <path d="M10.73 7.65 6.77 14.35M13.27 7.65 17.23 14.35M8 16.5h8" {...trazo} />
    </>
  ),
  /** Optimizacion de proceso. Las lineas se cortan alrededor de cada perilla. */
  ajustes: (
    <>
      <path d="M3 7h10M17 7h4M3 12h3M10 12h11M3 17h11M18 17h3" {...trazo} />
      <circle cx="15" cy="7" r="2" {...trazo} />
      <circle cx="8" cy="12" r="2" {...trazo} />
      <circle cx="16" cy="17" r="2" {...trazo} />
    </>
  ),
  /** Datos y analisis metrico. */
  grafico: (
    <>
      <path d="M4 4v15h16" {...trazo} />
      <path d="M7 15.5 11 11l3 2.5 4.5-6" {...trazo} />
    </>
  ),
  /** Experiencia en terreno. */
  casco: (
    <>
      <path d="M6 15.5v-3a6 6 0 0 1 12 0v3" {...trazo} />
      <path d="M10 15.5V7.4M14 15.5V7.4" {...trazo} />
      <rect x="2.5" y="15.5" width="19" height="3.2" rx="1.6" {...trazo} />
    </>
  ),
}

export function Icono({ nombre, size = 32 }: { nombre: NombreIcono; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden focusable="false">
      {ICONOS[nombre]}
    </svg>
  )
}
