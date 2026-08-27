import { headers as obtenerHeaders } from 'next/headers'
import { cache } from 'react'

import type { Cuenta } from '@/payload-types'
import { obtenerPayload } from './payload'

/**
 * Usuario autenticado de la request actual (staff o cuenta), leido desde la
 * cookie via la Local API de Payload. `cache()` para no repetir el trabajo
 * si varios Server Components la piden en el mismo render.
 */
export const obtenerUsuarioActual = cache(async () => {
  const payload = await obtenerPayload()
  const { user } = await payload.auth({ headers: await obtenerHeaders() })
  return user
})

/** Solo la cuenta (audiencia publica); null si quien esta logueado es staff o nadie. */
export async function obtenerCuentaActual(): Promise<Cuenta | null> {
  const user = await obtenerUsuarioActual()
  if (user && (user as { collection?: string }).collection === 'cuentas') {
    return user as unknown as Cuenta
  }
  return null
}
