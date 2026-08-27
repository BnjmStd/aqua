import config from '@payload-config'
import { cache } from 'react'
import { getPayload } from 'payload'

/**
 * Cliente de Payload para Server Components. Envuelto en `cache()` para que
 * varias queries dentro del mismo render reusen la misma instancia en vez
 * de inicializarla de nuevo por cada `await`.
 */
export const obtenerPayload = cache(async () => getPayload({ config }))
