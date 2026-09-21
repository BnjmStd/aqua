'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { marcarLeida } from '@/app/(frontend)/(sitio)/cuenta/notificaciones-actions'
import { cn } from '@/lib/cn'
import { rutaSegura, tiempoRelativo } from '@/lib/notificaciones/formato'
import type { Notificacione } from '@/payload-types'
import { avisarCambioDeNotificaciones } from './eventosNotificaciones'

/**
 * Fila de la página de notificaciones. Es cliente solo para marcarla como
 * leída al abrirla sin esperar la navegación.
 */
export function ItemNotificacion({ notificacion }: { notificacion: Notificacione }) {
  const [leida, setLeida] = useState(Boolean(notificacion.leidaEl))
  const [, iniciarTransicion] = useTransition()
  const router = useRouter()
  const destino = rutaSegura(notificacion.url)

  const abrir = () => {
    if (!leida) {
      setLeida(true)
      iniciarTransicion(async () => {
        await marcarLeida(notificacion.id)
        avisarCambioDeNotificaciones()
      })
    }
    if (destino) router.push(destino)
  }

  return (
    <li>
      <button
        type="button"
        onClick={abrir}
        className={cn(
          'flex w-full gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors',
          leida ? 'border-border bg-surface hover:bg-brand-50/50' : 'border-brand-200 bg-brand-50/60 hover:bg-brand-50',
        )}
      >
        <span aria-hidden className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', leida ? 'bg-transparent' : 'bg-brand-500')} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className={cn('text-sm', leida ? 'text-foreground' : 'font-medium text-foreground')}>
              {notificacion.titulo}
            </span>
            <span className="text-xs text-foreground/40">{tiempoRelativo(notificacion.createdAt)}</span>
          </span>
          {notificacion.cuerpo ? <span className="mt-1 block text-sm text-foreground/60">{notificacion.cuerpo}</span> : null}
          {destino ? <span className="mt-1.5 block text-xs text-brand-700">Ver más →</span> : null}
        </span>
      </button>
    </li>
  )
}
