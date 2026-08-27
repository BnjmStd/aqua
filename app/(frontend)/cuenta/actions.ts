'use server'

import { generatePayloadCookie } from 'payload'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { obtenerPayload } from '@/lib/payload'

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

export async function registrarCuenta(formData: FormData) {
  const nombre = String(formData.get('nombre') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const telefono = String(formData.get('telefono') ?? '') || undefined

  const payload = await obtenerPayload()

  try {
    await payload.create({ collection: 'cuentas', data: { nombre, email, password, telefono } })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No pudimos crear la cuenta.'
    redirect(`/cuenta/registro?error=${encodeURIComponent(mensaje)}`)
  }

  const { token } = await payload.login({ collection: 'cuentas', data: { email, password } })
  if (token) await fijarCookieDeSesion(token)

  redirect('/cuenta')
}

export async function iniciarSesion(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const redirectTo = String(formData.get('redirect') ?? '/cuenta') || '/cuenta'

  const payload = await obtenerPayload()
  let token: string | undefined

  try {
    const resultado = await payload.login({ collection: 'cuentas', data: { email, password } })
    token = resultado.token
  } catch {
    redirect(`/cuenta/ingresar?error=${encodeURIComponent('Email o contraseña incorrectos.')}&redirect=${encodeURIComponent(redirectTo)}`)
  }

  if (token) await fijarCookieDeSesion(token)
  redirect(redirectTo.startsWith('/') ? redirectTo : '/cuenta')
}

export async function cerrarSesion() {
  const jar = await cookies()
  jar.delete('payload-token')
  redirect('/')
}
