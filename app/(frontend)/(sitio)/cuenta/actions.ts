'use server'

import { AuthenticationError, LockedAuth, ValidationError, generatePayloadCookie } from 'payload'
import { refresh } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { obtenerCuentaActual } from '@/lib/auth'
import { dejarAviso } from '@/lib/avisos'
import { emitirEvento } from '@/lib/notificaciones/emitir'
import { obtenerPayload } from '@/lib/payload'
import { esRutValido, formatearRut } from '@/lib/rut'
import { MINUTOS_ENTRE_REENVIOS, generarTokenDeVerificacion, hashearToken } from '@/lib/verificacion'

/**
 * Estado que devuelven las acciones a `useActionState`. `valores` repone lo
 * que se escribio (menos la contraseña), porque React resetea el formulario
 * al terminar la accion.
 */
export type EstadoFormularioCuenta = {
  errores?: Partial<Record<string, string>>
  mensaje?: string
  valores?: Record<string, string>
  /**
   * Para formularios que no navegan al terminar (Mis datos): el cliente lo
   * muestra como toast. `enviadoEn` distingue dos guardados seguidos con el
   * mismo mensaje.
   */
  exito?: { mensaje: string; enviadoEn: number }
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LARGO_MINIMO_PASSWORD = 8

async function fijarCookieDeSesion(token: string) {
  const payload = await obtenerPayload()
  const cuentas = payload.collections.cuentas.config

  const cookie = generatePayloadCookie({
    collectionAuthConfig: cuentas.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  })

  const jar = await cookies()
  jar.set(cookie.name, cookie.value ?? '', {
    domain: cookie.domain,
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
    httpOnly: cookie.httpOnly,
    path: cookie.path,
    sameSite: cookie.sameSite ? (cookie.sameSite.toLowerCase() as 'lax' | 'none' | 'strict') : undefined,
    secure: cookie.secure,
  })
}

/** Solo rutas internas: `//otro.com` o `/\otro.com` los navegadores los tratan como externos. */
function destinoSeguro(valor: string) {
  return valor.startsWith('/') && !valor.startsWith('//') && !valor.startsWith('/\\') ? valor : '/cuenta'
}

function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0] ?? ''
}

/**
 * Genera un token nuevo y manda el correo de verificación. Devuelve false si
 * la cuenta ya está verificada o si se pidió hace menos de unos minutos.
 */
async function enviarVerificacion(cuentaId: string): Promise<boolean> {
  const payload = await obtenerPayload()
  const cuenta = await payload.findByID({ collection: 'cuentas', id: cuentaId, depth: 0 }).catch(() => null)
  if (!cuenta || cuenta.correoVerificadoEl) return false

  const ultimo = cuenta.verificacionEnviadaEl ? Date.parse(cuenta.verificacionEnviadaEl) : 0
  if (Date.now() - ultimo < MINUTOS_ENTRE_REENVIOS * 60_000) return false

  const { token, hash, expira } = generarTokenDeVerificacion()
  await payload.update({
    collection: 'cuentas',
    id: cuentaId,
    data: { tokenVerificacion: hash, tokenVerificacionExpira: expira, verificacionEnviadaEl: new Date().toISOString() },
  })

  const req = { payload, headers: new Headers(), context: {} } as never
  await emitirEvento('cuenta.verificar-correo', { cuentaId, token }, { req })
  return true
}

/** Botón "reenviar" del aviso de correo sin verificar. */
export async function reenviarVerificacion(): Promise<{ mensaje: string; enviadoEn: number }> {
  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect('/cuenta/ingresar?redirect=/cuenta')

  const enviado = await enviarVerificacion(cuenta.id)
  return {
    mensaje: enviado
      ? `Te enviamos el correo a ${cuenta.email}.`
      : `Ya te habíamos enviado uno hace poco. Revisa tu correo y el spam, y vuelve a intentar en ${MINUTOS_ENTRE_REENVIOS} minutos.`,
    enviadoEn: Date.now(),
  }
}

/** Valida el enlace del correo. Devuelve por qué falló, si falla. */
export async function verificarCorreoConToken(token: string): Promise<'ok' | 'invalido' | 'vencido'> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'cuentas',
    where: { tokenVerificacion: { equals: hashearToken(token) } },
    depth: 0,
    limit: 1,
    // El token es el permiso: quien abre el enlace todavía no tiene sesión.
    overrideAccess: true,
  })
  const cuenta = docs[0]
  if (!cuenta) return 'invalido'
  if (cuenta.correoVerificadoEl) return 'ok'
  if (!cuenta.tokenVerificacionExpira || Date.parse(cuenta.tokenVerificacionExpira) < Date.now()) return 'vencido'

  await payload.update({
    collection: 'cuentas',
    id: cuenta.id,
    data: { correoVerificadoEl: new Date().toISOString(), tokenVerificacion: null, tokenVerificacionExpira: null },
  })
  return 'ok'
}

export async function registrarCuenta(
  _estado: EstadoFormularioCuenta,
  formData: FormData,
): Promise<EstadoFormularioCuenta> {
  const nombre = String(formData.get('nombre') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const telefono = String(formData.get('telefono') ?? '').trim()
  const valores = { nombre, email, telefono }

  const errores: EstadoFormularioCuenta['errores'] = {}
  if (!nombre) errores.nombre = 'Ingresa tu nombre.'
  if (!email) errores.email = 'Ingresa tu email.'
  else if (!EMAIL_VALIDO.test(email)) errores.email = 'Ese email no parece válido.'
  if (password.length < LARGO_MINIMO_PASSWORD) {
    errores.password = `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`
  }
  if (Object.keys(errores).length) return { errores, valores }

  const payload = await obtenerPayload()

  let cuentaCreada
  try {
    cuentaCreada = await payload.create({
      collection: 'cuentas',
      data: { nombre, email, password, telefono: telefono || undefined },
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      const erroresPayload: EstadoFormularioCuenta['errores'] = {}
      for (const { path } of error.data.errors) {
        if (path === 'email') erroresPayload.email = 'Ya existe una cuenta con ese email. ¿Quieres ingresar?'
        else if (path === 'nombre' || path === 'password' || path === 'telefono') {
          erroresPayload[path] = 'Revisa este campo.'
        }
      }
      if (Object.keys(erroresPayload).length) return { errores: erroresPayload, valores }
    }
    console.error('registrarCuenta:', error)
    return { mensaje: 'No pudimos crear la cuenta. Inténtalo de nuevo en unos minutos.', valores }
  }

  await enviarVerificacion(cuentaCreada.id)

  // La cuenta ya existe: si el login automatico falla, que ingrese a mano.
  try {
    const { token } = await payload.login({ collection: 'cuentas', data: { email, password } })
    if (token) await fijarCookieDeSesion(token)
  } catch (error) {
    console.error('registrarCuenta (login automatico):', error)
    await dejarAviso('Tu cuenta quedó creada. Ingresa con tu email y contraseña.', 'info')
    redirect('/cuenta/ingresar')
  }

  await dejarAviso(`¡Listo, ${primerNombre(nombre)}! Te enviamos un correo para confirmar tu dirección.`)
  redirect('/cuenta')
}

export async function iniciarSesion(
  _estado: EstadoFormularioCuenta,
  formData: FormData,
): Promise<EstadoFormularioCuenta> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const destino = destinoSeguro(String(formData.get('redirect') ?? ''))
  const valores = { email }

  const errores: EstadoFormularioCuenta['errores'] = {}
  if (!email) errores.email = 'Ingresa tu email.'
  if (!password) errores.password = 'Ingresa tu contraseña.'
  if (Object.keys(errores).length) return { errores, valores }

  const payload = await obtenerPayload()
  let token: string | undefined
  let nombre = ''

  try {
    const resultado = await payload.login({ collection: 'cuentas', data: { email, password } })
    token = resultado.token
    nombre = primerNombre(resultado.user?.nombre ?? '')
  } catch (error) {
    if (error instanceof LockedAuth) {
      return {
        mensaje: 'Bloqueamos la cuenta por demasiados intentos fallidos. Vuelve a intentar en 10 minutos.',
        valores,
      }
    }
    if (error instanceof AuthenticationError) {
      return { mensaje: 'Email o contraseña incorrectos.', valores }
    }
    console.error('iniciarSesion:', error)
    return { mensaje: 'No pudimos iniciar sesión. Inténtalo de nuevo en unos minutos.', valores }
  }

  if (token) await fijarCookieDeSesion(token)
  await dejarAviso(nombre ? `Hola de nuevo, ${nombre}.` : 'Sesión iniciada.')
  redirect(destino)
}

export async function actualizarDatos(
  _estado: EstadoFormularioCuenta,
  formData: FormData,
): Promise<EstadoFormularioCuenta> {
  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect('/cuenta/ingresar?redirect=/cuenta/datos')

  const nombre = String(formData.get('nombre') ?? '').trim()
  const telefono = String(formData.get('telefono') ?? '').trim()
  const rutIngresado = String(formData.get('rut') ?? '').trim()
  const valores = { nombre, telefono, rut: rutIngresado }

  const errores: EstadoFormularioCuenta['errores'] = {}
  if (!nombre) errores.nombre = 'Ingresa tu nombre.'
  if (rutIngresado && !esRutValido(rutIngresado)) {
    errores.rut = 'El RUT no es válido. Revisa el dígito verificador.'
  }
  if (Object.keys(errores).length) return { errores, valores }

  const rut = rutIngresado ? formatearRut(rutIngresado) : ''
  const payload = await obtenerPayload()

  try {
    // Local API con overrideAccess (default): el `id` sale de la sesion, no del formulario.
    await payload.update({
      collection: 'cuentas',
      id: cuenta.id,
      data: { nombre, telefono: telefono || null, rut: rut || null },
    })
  } catch (error) {
    console.error('actualizarDatos:', error)
    return { mensaje: 'No pudimos guardar los cambios. Inténtalo de nuevo en unos minutos.', valores }
  }

  // El nombre sale en el header y en la sidebar: que se repinten.
  refresh()
  return { valores: { nombre, telefono, rut }, exito: { mensaje: 'Guardamos tus datos.', enviadoEn: Date.now() } }
}

export async function cambiarPassword(
  _estado: EstadoFormularioCuenta,
  formData: FormData,
): Promise<EstadoFormularioCuenta> {
  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect('/cuenta/ingresar?redirect=/cuenta/datos')

  const actual = String(formData.get('passwordActual') ?? '')
  const nueva = String(formData.get('passwordNueva') ?? '')
  const confirmacion = String(formData.get('passwordConfirmacion') ?? '')

  const errores: EstadoFormularioCuenta['errores'] = {}
  if (!actual) errores.passwordActual = 'Ingresa tu contraseña actual.'
  if (nueva.length < LARGO_MINIMO_PASSWORD) {
    errores.passwordNueva = `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`
  } else if (nueva === actual) {
    errores.passwordNueva = 'La nueva contraseña tiene que ser distinta de la actual.'
  }
  if (!errores.passwordNueva && confirmacion !== nueva) {
    errores.passwordConfirmacion = 'Las contraseñas no coinciden.'
  }
  if (Object.keys(errores).length) return { errores }

  const payload = await obtenerPayload()

  // Payload no pide la contraseña actual para cambiarla: se verifica con un login.
  try {
    await payload.login({ collection: 'cuentas', data: { email: cuenta.email, password: actual } })
  } catch (error) {
    if (error instanceof LockedAuth) {
      return { mensaje: 'Bloqueamos la cuenta por demasiados intentos fallidos. Vuelve a intentar en 10 minutos.' }
    }
    if (error instanceof AuthenticationError) {
      return { errores: { passwordActual: 'La contraseña actual no es correcta.' } }
    }
    console.error('cambiarPassword (verificacion):', error)
    return { mensaje: 'No pudimos cambiar la contraseña. Inténtalo de nuevo en unos minutos.' }
  }

  try {
    await payload.update({ collection: 'cuentas', id: cuenta.id, data: { password: nueva } })
    // Sesion nueva con la contraseña nueva, por si el cambio invalida la anterior.
    const { token } = await payload.login({ collection: 'cuentas', data: { email: cuenta.email, password: nueva } })
    if (token) await fijarCookieDeSesion(token)
  } catch (error) {
    console.error('cambiarPassword:', error)
    return { mensaje: 'No pudimos cambiar la contraseña. Inténtalo de nuevo en unos minutos.' }
  }

  return { exito: { mensaje: 'Cambiamos tu contraseña.', enviadoEn: Date.now() } }
}

export async function cerrarSesion() {
  const jar = await cookies()
  jar.delete('payload-token')
  await dejarAviso('Cerraste sesión.', 'info')
  redirect('/')
}
