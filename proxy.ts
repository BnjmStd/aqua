import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * proxy.ts — en Next.js 16 es lo que antes se llamaba middleware.ts.
 *
 * QUE HACE Y QUE NO
 *
 * Esto NO es el control de acceso al panel ni a "mi cuenta". La documentacion
 * de Next es explicita: "should not be used as a full session management or
 * authorization solution". Aca solo se mira si EXISTE la cookie de sesion,
 * nunca si es valida ni de que coleccion es (Payload comparte una sola
 * cookie, `payload-token`, entre `Users` y `Cuentas` — ver access/index.ts)
 * — validarla exige consultar la base, que es precisamente lo que este
 * archivo no debe hacer.
 *
 * Quien decide de verdad es Payload, en el servidor, en cada request: cada
 * pagina bajo /cuenta vuelve a comprobar con `obtenerCuentaActual()`
 * (lib/auth.ts) que la sesion sea realmente una cuenta, no personal del
 * panel sin cuenta propia. Esto es una mejora de experiencia (cortar antes
 * de cargar la pagina protegida) y una capa extra, no la muralla.
 *
 * Las cabeceras de seguridad tampoco viven aca sino en next.config.ts: son
 * estaticas y no necesitan ejecutar codigo por visita.
 */

/** Rutas del panel que deben seguir abiertas sin sesion. */
const RUTAS_PUBLICAS_DEL_PANEL = [
  '/admin/login',
  '/admin/logout',
  '/admin/forgot',
  '/admin/reset',
  '/admin/create-first-user',
  '/admin/verify',
  '/admin/unauthorized',
]

/** Rutas de "mi cuenta" que deben seguir abiertas sin sesion. */
const RUTAS_PUBLICAS_DE_CUENTA = ['/cuenta/ingresar', '/cuenta/registro']

function redirigirALogin(request: NextRequest, destinoLogin: string) {
  const login = new URL(destinoLogin, request.url)
  // Para volver a donde iba despues de entrar.
  login.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(login)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const tieneSesion = request.cookies.has('payload-token')

  if (pathname.startsWith('/admin')) {
    if (RUTAS_PUBLICAS_DEL_PANEL.some((ruta) => pathname.startsWith(ruta))) {
      return NextResponse.next()
    }
    if (!tieneSesion) return redirigirALogin(request, '/admin/login')
    return NextResponse.next()
  }

  const rutaProtegidaDeCuenta =
    (pathname.startsWith('/cuenta') && !RUTAS_PUBLICAS_DE_CUENTA.includes(pathname)) ||
    pathname.startsWith('/consulting/solicitud')

  if (rutaProtegidaDeCuenta && !tieneSesion) {
    return redirigirALogin(request, '/cuenta/ingresar')
  }

  return NextResponse.next()
}

export const config = {
  // Deliberadamente NO incluye /api: la API tiene su propio control de
  // acceso por coleccion y por campo, y ahi si se valida de verdad.
  matcher: ['/admin/:path*', '/cuenta/:path*', '/consulting/solicitud'],
}
