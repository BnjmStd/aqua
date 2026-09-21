import crypto from 'crypto'

import type { PayloadRequest } from 'payload'

import { esPersonalDelPanel } from './index'

/**
 * Acceso a la cola de trabajos (Payload Jobs).
 *
 * Payload deja `run`, `queue` y `cancel` abiertos a CUALQUIER usuario con
 * sesion, y desde que existe `Cuentas` (registro publico) eso incluye a
 * cualquiera que se registre en el sitio: podia leer la cola, dispararla y
 * encolar trabajos (p. ej. una publicacion programada). Ademas la cola
 * transporta datos personales de las notificaciones.
 *
 * Aca queda solo para el panel, mas un secreto para el cron de produccion
 * (en serverless `autoRun` no corre: alguien externo tiene que llamar a
 * /api/payload-jobs/run).
 */

/** Comparacion en tiempo constante: no filtrar el secreto por cuanto tarda. */
function coincideSecreto(recibido: string, esperado: string): boolean {
  const a = Buffer.from(recibido)
  const b = Buffer.from(esperado)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function tieneSecretoDeCron(req: PayloadRequest): boolean {
  const esperado = process.env.CRON_SECRET
  if (!esperado) return false
  const cabecera = req.headers?.get('authorization') ?? ''
  const recibido = cabecera.startsWith('Bearer ') ? cabecera.slice('Bearer '.length) : ''
  return Boolean(recibido) && coincideSecreto(recibido, esperado)
}

export const accesoCola = {
  run: ({ req }: { req: PayloadRequest }) => esPersonalDelPanel(req.user) || tieneSecretoDeCron(req),
  queue: ({ req }: { req: PayloadRequest }) => esPersonalDelPanel(req.user),
  cancel: ({ req }: { req: PayloadRequest }) => esPersonalDelPanel(req.user),
}
