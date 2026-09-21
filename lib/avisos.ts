import { cookies } from 'next/headers'

export type TipoAviso = 'exito' | 'error' | 'info'

/** Nombre de la cookie; `components/ui/Avisos.tsx` repite el literal (no puede importar next/headers). */
const COOKIE_AVISO = 'aviso'

/**
 * Deja un aviso "flash" para la proxima pantalla. Pensado para Server Actions
 * que terminan en `redirect()`: el estado del formulario se pierde al navegar,
 * asi que el mensaje viaja en una cookie corta que el cliente muestra como
 * toast y borra apenas la lee.
 *
 * No es httpOnly a proposito — la tiene que leer JS — y no lleva nada sensible.
 */
export async function dejarAviso(mensaje: string, tipo: TipoAviso = 'exito') {
  const jar = await cookies()
  jar.set(COOKIE_AVISO, JSON.stringify({ tipo, mensaje }), {
    path: '/',
    maxAge: 60,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
