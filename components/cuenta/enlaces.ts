/** Secciones de /cuenta. Las comparten la sidebar, el menu del header y el nav movil. */
export const ENLACES_CUENTA = [
  { etiqueta: 'Resumen', url: '/cuenta' },
  { etiqueta: 'Mis cursos', url: '/cuenta/cursos' },
  { etiqueta: 'Mis compras', url: '/cuenta/compras' },
  { etiqueta: 'Mis solicitudes', url: '/cuenta/solicitudes' },
  { etiqueta: 'Notificaciones', url: '/cuenta/notificaciones' },
  { etiqueta: 'Mis datos', url: '/cuenta/datos' },
] as const

/** `/cuenta` solo es activo exacto; si no, marcaria todas las subsecciones. */
export function esEnlaceCuentaActivo(url: string, pathname: string) {
  return url === '/cuenta' ? pathname === url : pathname === url || pathname.startsWith(`${url}/`)
}
