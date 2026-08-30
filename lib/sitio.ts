import { cache } from 'react'

import type { ConfiguracionSitio } from '@/payload-types'

import { obtenerPayload } from './payload'

export type CorreoPublico = { email: string; etiqueta?: string | null }

/** Solo si el CMS no tiene correo. Debe coincidir con el default de Configuracion del sitio. */
const CORREO_POR_DEFECTO = 'msalinas@aquabioprocess.cl'

/** Buzon de mensajeria automatica: no se muestra ni se usa en los CTA. */
function esCorreoAutomatico(email: string) {
  return /^contacto@/i.test(email)
}

/** Correos del pie. Si la lista del CMS esta vacia, usa el correo principal. */
export function correosPublicos(sitio: ConfiguracionSitio): CorreoPublico[] {
  const lista = (sitio.correos ?? []).filter(
    (correo): correo is CorreoPublico =>
      Boolean(correo.email) && !esCorreoAutomatico(correo.email),
  )
  if (lista.length) return lista
  if (sitio.email && !esCorreoAutomatico(sitio.email)) return [{ email: sitio.email }]
  return [{ email: CORREO_POR_DEFECTO }]
}

/** Primer correo publico, o el del CMS. */
export function correoPrincipal(sitio: ConfiguracionSitio): string | null {
  return correosPublicos(sitio)[0]?.email ?? CORREO_POR_DEFECTO
}

/** Destinatario de los CTA: el correo principal del CMS. */
export function correoParaMotivo(sitio: ConfiguracionSitio): string {
  if (sitio.email && !esCorreoAutomatico(sitio.email)) return sitio.email
  return correosPublicos(sitio)[0]?.email ?? CORREO_POR_DEFECTO
}

/**
 * Configuracion del sitio (global de Payload). `cache()` para que el header,
 * el footer y cualquier otro consumidor del mismo render compartan una sola
 * lectura.
 *
 * La razon social vive SOLO aca: es un dato legal y tenerlo repetido en
 * componentes es como terminan divergiendo entre paginas.
 */
export const obtenerConfiguracionSitio = cache(async () => {
  const payload = await obtenerPayload()
  return payload.findGlobal({ slug: 'configuracion-sitio' })
})
