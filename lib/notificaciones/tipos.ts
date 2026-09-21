import type { PayloadRequest } from 'payload'

/**
 * Piezas del sistema de notificaciones. Ver docs/plan-notificaciones.md.
 *
 * Tres cosas separadas: el EVENTO (qué pasó), la RECETA (a quién y qué se le
 * dice) y el CANAL (por dónde se entrega).
 */

/** Categorías para las preferencias por persona (fase 2). */
export const CATEGORIAS = [
  { value: 'academia', label: 'Academia (cursos, sesiones, certificados)' },
  { value: 'pagos', label: 'Pagos y facturación' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'cuenta', label: 'Mi cuenta' },
  { value: 'equipo', label: 'Trabajo interno del equipo' },
] as const

export type Categoria = (typeof CATEGORIAS)[number]['value']

/** Canales externos. `inApp` no es un canal: es la notificación misma. */
export type Canal = 'email' | 'whatsapp' | 'sms'

/**
 * Catálogo de eventos: nombre -> forma de sus datos. Los datos son ids y
 * valores simples, nunca documentos: la receta los vuelve a cargar cuando le
 * toca, así el contenido nunca sale de información vieja.
 */
export type CatalogoEventos = {
  'justificacion.creada': { justificacionId: string }
  'justificacion.revisada': { justificacionId: string; estado: string; resultado: string | null }
  'inscripcion.creada': { inscripcionId: string }
  'inscripcion.confirmada': { inscripcionId: string }
  'solicitud-consultoria.creada': { solicitudId: string }
  'cuenta.verificar-correo': { cuentaId: string; token: string }
}

export type NombreEvento = keyof CatalogoEventos

export type Destinatario = {
  coleccion: 'users' | 'cuentas'
  id: string
  nombre: string
  email: string | null
}

export type ContenidoCorreo = {
  asunto: string
  titulo: string
  parrafos: string[]
  accion?: { texto: string; url: string }
}

export type Contenido = {
  inApp: { titulo: string; cuerpo?: string; url?: string }
  email?: ContenidoCorreo
}

export type Receta<Ctx = unknown> = {
  /** Identificador estable: viaja en la notificación para reconstruir el contenido al enviar. */
  id: string
  evento: NombreEvento
  categoria: Categoria
  /** Ignora las preferencias del destinatario (recuperar contraseña y similares). */
  obligatoria?: boolean
  /**
   * Los datos del evento llevan algo que no debe quedar guardado (un token):
   * el envío los borra apenas sale el mensaje.
   */
  datosSensibles?: boolean
  /** No aparece en la campana: solo se entrega por canales externos. */
  soloExterno?: boolean
  /** Carga el contexto desde los datos del evento. `null` = ya no aplica. */
  cargar: (datos: never, req: PayloadRequest) => Promise<Ctx | null>
  /** Sigue teniendo sentido avisar (se revisa otra vez justo antes de enviar). */
  vigente?: (ctx: Ctx) => boolean
  destinatarios: (ctx: Ctx, req: PayloadRequest) => Promise<Destinatario[]>
  /** Parte variable de la clave anti-duplicados (la receta y el destinatario se agregan solos). */
  clave: (ctx: Ctx) => string
  /**
   * Junta varios avisos en un solo mensaje externo mientras la ventana sigue
   * abierta: 5 justificaciones en una hora = un correo, no cinco. La bandeja
   * in-app siempre recibe los avisos uno por uno.
   */
  agrupar?: { clave: string; ventanaMinutos: number }
  contenido: (ctx: Ctx, destinatario: Destinatario) => Contenido
}

/**
 * Da tipos dentro de la receta (`cargar` recibe los datos de SU evento y el
 * resto del contexto sale inferido) y los borra hacia afuera: el registro
 * guarda recetas de contextos distintos y el emisor las trata igual.
 */
export function definirReceta<E extends NombreEvento, Ctx>(
  receta: Omit<Receta<Ctx>, 'evento' | 'cargar'> & {
    evento: E
    cargar: (datos: CatalogoEventos[E], req: PayloadRequest) => Promise<Ctx | null>
  },
): Receta {
  return receta as unknown as Receta
}

/** Un canal sabe entregar un contenido a un destino. Cambiar de proveedor = otro adaptador. */
export type AdaptadorCanal = {
  id: Canal
  /** Nombre visible en logs y en el registro de envíos. */
  nombre: string
  enviar: (args: { destino: string; contenido: Contenido; req: PayloadRequest }) => Promise<{ idProveedor?: string }>
}
