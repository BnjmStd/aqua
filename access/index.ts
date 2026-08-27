import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Control de acceso.
 *
 * Hoy hay un solo operador (rol `admin`), pero la estructura ya distingue
 * admin de editor. Endurecerlo mas adelante es cambiar estas funciones,
 * no recorrer las 19 colecciones.
 *
 * Desde que existe `Cuentas` (auth publica, ver collections/Cuentas.ts),
 * `req.user` YA NO implica "es alguien del panel": Payload usa una sola
 * cookie para cualquier coleccion con `auth: true`, y anota
 * `user.collection` con el slug que autentico la sesion. `Boolean(user)`
 * sola confundiria una cuenta de cliente con personal del panel — hay que
 * mirar `collection`, no solo si hay alguien logueado.
 */

type UsuarioConRol = { rol?: string | null }
type UsuarioConColeccion = { collection?: string }

const tieneRol = (user: unknown, rol: string): boolean =>
  Boolean(user && (user as UsuarioConRol).rol === rol)

const esDeColeccion = (user: unknown, coleccion: string): boolean =>
  Boolean(user) && (user as UsuarioConColeccion).collection === coleccion

/** Es alguien del panel (coleccion `users`), sin importar su rol. */
export const esPersonalDelPanel = (user: unknown): boolean => esDeColeccion(user, 'users')

/** Es una cuenta publica (coleccion `cuentas`) autenticada. */
export const esCuentaAutenticada: Access = ({ req: { user } }) => esDeColeccion(user, 'cuentas')

/** Cualquiera autenticado en el panel. */
export const soloAutenticados: Access = ({ req: { user } }) => esPersonalDelPanel(user)

/**
 * Acceso al panel. Firma distinta de `Access`: aqui Payload solo admite
 * boolean, no un filtro `Where`.
 */
export const puedeEntrarAlPanel = ({ req: { user } }: { req: PayloadRequest }): boolean =>
  esPersonalDelPanel(user)

/** Solo administradores. */
export const soloAdmins: Access = ({ req: { user } }) => tieneRol(user, 'admin')

/** Idem, para permisos a nivel de campo. */
export const soloAdminsCampo: FieldAccess = ({ req: { user } }) => tieneRol(user, 'admin')

/**
 * Campo visible solo para usuarios del panel.
 *
 * Sirve para datos internos que viven en documentos publicos: notas de
 * negocio, correos personales, margenes. Sin esto el campo VIAJA en la
 * respuesta de la API aunque el panel no lo muestre.
 *
 * Ojo con la confusion clasica: `admin.condition` oculta en la interfaz,
 * NO restringe la API. Para no exponer un dato hace falta `access.read`.
 */
export const soloAutenticadosCampo: FieldAccess = ({ req: { user } }) => esPersonalDelPanel(user)

/**
 * Lectura publica limitada a lo publicado.
 *
 * PRECONDICION: la coleccion DEBE tener `versions.drafts` habilitado.
 * Sin eso la columna `_status` no existe y la consulta falla con 500.
 * Para colecciones sin borradores, escribi un filtro sobre su propio
 * campo de estado (ver NewsletterEdiciones).
 * Los usuarios del panel ven tambien los borradores; el publico
 * (incluidas las cuentas de cliente), no.
 * Sin esto, la REST API filtraria borradores en el listado pero los
 * expondria al pedirlos por ID.
 */
export const publicadosOAutenticados: Access = ({ req: { user } }) => {
  if (esPersonalDelPanel(user)) return true
  return {
    _status: {
      equals: 'published',
    },
  }
}

/**
 * Lectura restringida al dueno del documento (via `campoRelacion`, una
 * relationship a `cuentas`) o a personal del panel.
 *
 * Uso: Inscripciones, SolicitudesConsulting — datos personales que la
 * propia cuenta necesita ver en "mi cuenta", pero nadie mas.
 */
export const propiaOStaff =
  (campoRelacion: string): Access =>
  ({ req: { user } }) => {
    if (esPersonalDelPanel(user)) return true
    if (esDeColeccion(user, 'cuentas')) {
      return { [campoRelacion]: { equals: (user as { id: string }).id } }
    }
    return false
  }
