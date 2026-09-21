import crypto from 'crypto'

/**
 * Token para verificar el correo de una cuenta.
 *
 * En la base se guarda solo el HASH: si alguien llegara a leer la tabla, no
 * puede reconstruir el enlace. El token en claro viaja únicamente en el correo.
 * Mismo criterio que un "recuperar contraseña", aunque este token sea menos
 * sensible (solo marca el correo como verificado, no abre sesión).
 */

export const HORAS_VALIDEZ_VERIFICACION = 48

/** Espera entre reenvíos, para no convertir el botón en un cañón de correos. */
export const MINUTOS_ENTRE_REENVIOS = 2

export const hashearToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

export function generarTokenDeVerificacion() {
  const token = crypto.randomBytes(32).toString('base64url')
  return {
    token,
    hash: hashearToken(token),
    expira: new Date(Date.now() + HORAS_VALIDEZ_VERIFICACION * 3_600_000).toISOString(),
  }
}
