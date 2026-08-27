import type { Field } from 'payload'

/**
 * Interruptor unico de localizacion.
 *
 * Hoy el sitio es solo espanol. Cuando haga falta ingles:
 *   1. Poner esto en `true`.
 *   2. Descomentar el bloque `localization` en payload.config.ts.
 *   3. Correr `payload migrate:create` (el esquema cambia: las columnas
 *      traducibles se mueven a tablas `_locales`).
 *
 * Todos los campos envueltos en `traducible()` pasan a ser localizados de una vez.
 * No hay que salir a buscarlos por el codebase.
 */
export const LOCALIZACION_ACTIVA = false

export const LOCALES_SOPORTADOS = ['es', 'en'] as const
export const LOCALE_POR_DEFECTO = 'es'

/** Marca un campo como traducible. Hoy es no-op. */
export function traducible<T extends Field>(field: T): T {
  return (LOCALIZACION_ACTIVA ? { ...field, localized: true } : field) as T
}
