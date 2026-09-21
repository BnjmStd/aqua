'use client'

import { useTransition } from 'react'

import { marcarTodasLeidas } from '@/app/(frontend)/(sitio)/cuenta/notificaciones-actions'
import { avisarCambioDeNotificaciones } from './eventosNotificaciones'

export function BotonMarcarTodas() {
  const [enviando, iniciarTransicion] = useTransition()

  return (
    <button
      type="button"
      disabled={enviando}
      onClick={() =>
        iniciarTransicion(async () => {
          await marcarTodasLeidas()
          avisarCambioDeNotificaciones()
        })
      }
      className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-brand-500 hover:text-brand-700 disabled:opacity-50"
    >
      {enviando ? 'Marcando…' : 'Marcar todo como leído'}
    </button>
  )
}
