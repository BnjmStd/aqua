import type { AdaptadorCanal, Canal } from '../tipos'
import { canalConsola } from './consola'

/**
 * Registro de canales. Cada uno se resuelve segun lo que haya configurado:
 * sin credenciales del proveedor real, cae al canal consola y el flujo se
 * puede probar igual.
 *
 * Agregar WhatsApp o SMS (fase 3) es sumar su adaptador aca; nada mas del
 * sistema cambia.
 */
export function obtenerCanal(canal: Canal): AdaptadorCanal | null {
  switch (canal) {
    case 'email':
      // Etapa 3: `if (process.env.RESEND_API_KEY) return canalResend()`
      return canalConsola('email')
    case 'whatsapp':
    case 'sms':
      // Fase 3. Sin adaptador, el envío queda "omitido" con su motivo.
      return null
  }
}

/** Canales que hoy se pueden intentar, para no crear envíos que nadie puede entregar. */
export function canalesDisponibles(): Canal[] {
  return (['email', 'whatsapp', 'sms'] as Canal[]).filter((canal) => obtenerCanal(canal) !== null)
}
