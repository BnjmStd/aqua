/**
 * Utilidades de presentación de notificaciones, compartidas entre la campana
 * (cliente) y la página. Sin imports de servidor.
 */

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Santiago',
})

/** "hace 5 min", "ayer", o la fecha si ya pasó una semana. */
export function tiempoRelativo(fechaISO: string, ahora = Date.now()): string {
  const fecha = new Date(fechaISO)
  const minutos = Math.floor((ahora - fecha.getTime()) / 60_000)

  if (minutos < 1) return 'recién'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  return FORMATO_FECHA.format(fecha)
}

/**
 * Solo rutas internas: la url viaja en la base de datos y `//otro.com` o
 * `/\otro.com` los navegadores los tratan como externos.
 */
export function rutaSegura(url: string | null | undefined): string | null {
  if (!url || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return null
  return url
}
