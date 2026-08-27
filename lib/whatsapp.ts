import { obtenerPayload } from './payload'

const WHATSAPP_URL_BASE = 'https://wa.me'

export type ConfiguracionWhatsapp = {
  numero: string
  mensajePorDefecto: string
}

/** wa.me exige solo digitos (sin '+', espacios ni guiones). */
function normalizarNumero(numero: string): string {
  return numero.replace(/\D/g, '')
}

export function construirUrlWhatsapp(numero: string, mensaje: string): string {
  const parametros = new URLSearchParams({ text: mensaje })
  return `${WHATSAPP_URL_BASE}/${normalizarNumero(numero)}?${parametros.toString()}`
}

/**
 * Numero y mensaje base vienen de Configuracion del sitio (admin), asi el
 * usuario los cambia sin tocar codigo. Devuelve null si no hay numero
 * cargado, para que los componentes puedan ocultar el boton flotante.
 */
export async function obtenerConfiguracionWhatsapp(): Promise<ConfiguracionWhatsapp | null> {
  const payload = await obtenerPayload()
  const configuracion = await payload.findGlobal({ slug: 'configuracion-sitio' })
  const numero = configuracion.whatsapp?.numero

  if (!numero) return null

  return {
    numero,
    mensajePorDefecto: configuracion.whatsapp?.mensajePorDefecto || 'Hola, quisiera más información.',
  }
}

/**
 * Mensajes por contexto, centralizados aca para que ningun componente
 * arme texto de WhatsApp a mano. Agregar uno nuevo cuando aparezca un
 * flujo de contacto especifico (ej: un curso, un servicio).
 */
export const mensajesWhatsapp = {
  curso: (nombreCurso: string) => `Hola, quisiera más información sobre el curso "${nombreCurso}".`,
  servicio: (nombreServicio: string) =>
    `Hola, quisiera más información sobre el servicio "${nombreServicio}".`,
}
