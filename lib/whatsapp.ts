import { obtenerPayload } from './payload'

const WHATSAPP_URL_BASE = 'https://wa.me'

export type MotivoWhatsapp =
  | 'general'
  | 'asesor'
  | 'consultoria'
  | 'fundador'
  | 'cv'
  | 'academy'
  | 'curso'
  | 'servicio'

export type ConfiguracionWhatsapp = {
  numero: string
  mensajePorDefecto: string
}

const MOTIVOS: readonly MotivoWhatsapp[] = [
  'general',
  'asesor',
  'consultoria',
  'fundador',
  'cv',
  'academy',
  'curso',
  'servicio',
]

export const MENSAJE_WHATSAPP_GENERAL =
  'Hola Dr. Salinas, le escribo desde aquabioprocess.cl. Me gustaría conversar sobre un desafío en tratamiento de aguas o efluentes.'

/** wa.me exige solo digitos (sin '+', espacios ni guiones). */
function normalizarNumero(numero: string): string {
  return numero.replace(/\D/g, '')
}

export function construirUrlWhatsapp(numero: string, mensaje: string): string {
  const parametros = new URLSearchParams({ text: mensaje })
  return `${WHATSAPP_URL_BASE}/${normalizarNumero(numero)}?${parametros.toString()}`
}

export function esMotivoWhatsapp(valor: string | undefined): valor is MotivoWhatsapp {
  return valor != null && (MOTIVOS as readonly string[]).includes(valor)
}

/** Mailto al correo que venga del CMS (`correoParaMotivo`). */
export function rutaContacto(
  email: string,
  motivo: MotivoWhatsapp = 'general',
  extra?: { nombre?: string },
): string {
  return urlMailto(email, motivo, extra)
}

/** Convierte un `/contacto?motivo=` o `/consulting/solicitud` viejo del CMS en mailto. */
export function resolverMailto(href: string, email: string): string {
  if (href.startsWith('/consulting/solicitud')) {
    return urlMailto(email, 'consultoria')
  }
  if (!href.startsWith('/contacto')) return href
  const params = new URL(href, 'http://localhost').searchParams
  const motivo = params.get('motivo') ?? 'general'
  const nombre = params.get('nombre') ?? undefined
  return urlMailto(email, motivo, { nombre })
}

export function asuntoPorMotivo(
  motivo: string | undefined,
  extra?: { nombre?: string },
): string {
  const clave = esMotivoWhatsapp(motivo) ? motivo : 'general'
  if (clave === 'curso' && extra?.nombre) return `Consulta por el curso "${extra.nombre}" — AquaBioProcess`
  if (clave === 'servicio' && extra?.nombre) {
    return `Consulta por el servicio "${extra.nombre}" — AquaBioProcess`
  }
  const asuntos: Record<MotivoWhatsapp, string> = {
    general: 'Consulta desde aquabioprocess.cl',
    asesor: 'Consulta con un asesor — AquaBioProcess',
    consultoria: 'Solicitud de consultoría — AquaBioProcess',
    fundador: 'Contacto al Dr. Salinas — AquaBioProcess',
    cv: 'Solicitud de CV técnico — AquaBioProcess',
    academy: 'Consulta por Academy — AquaBioProcess',
    curso: 'Consulta por un curso — AquaBioProcess',
    servicio: 'Consulta por Consulting — AquaBioProcess',
  }
  return asuntos[clave]
}

export function urlMailto(
  email: string,
  motivo?: string,
  extra?: { nombre?: string },
): string {
  const params = new URLSearchParams({
    subject: asuntoPorMotivo(motivo, extra),
    body: mensajePorMotivo(motivo, extra),
  })
  return `mailto:${email}?${params.toString()}`
}

export const mensajesWhatsapp = {
  general: MENSAJE_WHATSAPP_GENERAL,
  asesor:
    'Hola, me gustaría hablar con un asesor de AquaBioProcess. Tengo una consulta sobre la operación de una planta de tratamiento / efluente industrial.',
  consultoria:
    'Hola Dr. Salinas, quiero solicitar una consultoría. Les cuento el contexto de la planta y coordinamos una conversación inicial.',
  fundador:
    'Hola Dr. Salinas, le contacto desde la web de AquaBioProcess para conversar con usted.',
  cv: 'Hola Dr. Salinas, le escribo desde aquabioprocess.cl. ¿Me podría compartir su CV técnico?',
  academy:
    'Hola, me interesa una capacitación o curso in-company de AquaBioProcess Academy para mi equipo.',
  curso: (nombreCurso: string) =>
    `Hola, me interesa el curso "${nombreCurso}" de AquaBioProcess Academy. ¿Me cuentan próximas fechas y modalidad?`,
  servicio: (nombreServicio: string) =>
    `Hola, quisiera más información sobre el servicio "${nombreServicio}" de AquaBioProcess Consulting.`,
}

export function mensajePorMotivo(
  motivo: string | undefined,
  extra?: { nombre?: string },
): string {
  const clave = esMotivoWhatsapp(motivo) ? motivo : 'general'
  if (clave === 'curso') {
    return extra?.nombre ? mensajesWhatsapp.curso(extra.nombre) : mensajesWhatsapp.academy
  }
  if (clave === 'servicio') {
    return extra?.nombre ? mensajesWhatsapp.servicio(extra.nombre) : mensajesWhatsapp.consultoria
  }
  return mensajesWhatsapp[clave]
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
    mensajePorDefecto: configuracion.whatsapp?.mensajePorDefecto || MENSAJE_WHATSAPP_GENERAL,
  }
}

export async function obtenerUrlWhatsapp(
  motivo?: string,
  extra?: { nombre?: string },
): Promise<string | null> {
  const configuracion = await obtenerConfiguracionWhatsapp()
  if (!configuracion) return null
  return construirUrlWhatsapp(configuracion.numero, mensajePorMotivo(motivo, extra))
}
