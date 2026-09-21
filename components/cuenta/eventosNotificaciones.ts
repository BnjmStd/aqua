/**
 * Aviso entre componentes del cliente: la campana vive en el header (layout) y
 * no se entera de lo que pasa en la página de notificaciones. Cuando algo
 * cambia, quien lo hizo lo anuncia y la campana se vuelve a consultar.
 */
export const EVENTO_NOTIFICACIONES = 'notificaciones:cambio'

export function avisarCambioDeNotificaciones() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_NOTIFICACIONES))
}
