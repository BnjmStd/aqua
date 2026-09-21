'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, useTransition } from 'react'

import {
  marcarLeida,
  resumenNotificaciones,
} from '@/app/(frontend)/(sitio)/cuenta/notificaciones-actions'
import { cn } from '@/lib/cn'
import { rutaSegura, tiempoRelativo } from '@/lib/notificaciones/formato'
import { EVENTO_NOTIFICACIONES } from './eventosNotificaciones'
import type { Notificacione } from '@/payload-types'

const INTERVALO_MS = 60_000

type Props = {
  noLeidas: number
  ultimas: Pick<Notificacione, 'id' | 'titulo' | 'cuerpo' | 'url' | 'leidaEl' | 'createdAt'>[]
}

/**
 * Campana del header. Recibe del servidor lo que hay al cargar la página y
 * despues se refresca sola: el Header vive en el layout y no se vuelve a
 * renderizar al navegar entre paginas.
 */
export function Campana({ noLeidas: inicial, ultimas: iniciales }: Props) {
  const [resumen, setResumen] = useState({ noLeidas: inicial, ultimas: iniciales })
  const [abierta, setAbierta] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const idMenu = useId()
  const pathname = usePathname()
  const router = useRouter()
  const [, iniciarTransicion] = useTransition()

  // Al navegar y cada minuto: el contador no se queda pegado.
  useEffect(() => {
    let vigente = true
    const actualizar = async () => {
      const nuevo = await resumenNotificaciones()
      if (vigente) setResumen(nuevo as Props)
    }
    void actualizar()
    const intervalo = setInterval(actualizar, INTERVALO_MS)
    // Cuando la página de notificaciones marca algo como leído, avisa por acá.
    const alCambiar = () => void actualizar()
    window.addEventListener(EVENTO_NOTIFICACIONES, alCambiar)
    return () => {
      vigente = false
      clearInterval(intervalo)
      window.removeEventListener(EVENTO_NOTIFICACIONES, alCambiar)
    }
  }, [pathname])

  useEffect(() => {
    if (!abierta) return
    const alClickFuera = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierta(false)
    }
    const alTeclear = (evento: KeyboardEvent) => evento.key === 'Escape' && setAbierta(false)
    document.addEventListener('mousedown', alClickFuera)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alClickFuera)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierta])

  const abrir = (notificacion: Props['ultimas'][number]) => {
    setAbierta(false)
    if (!notificacion.leidaEl) {
      setResumen((actual) => ({
        noLeidas: Math.max(0, actual.noLeidas - 1),
        ultimas: actual.ultimas.map((n) => (n.id === notificacion.id ? { ...n, leidaEl: new Date().toISOString() } : n)),
      }))
      iniciarTransicion(() => void marcarLeida(notificacion.id))
    }
    const destino = rutaSegura(notificacion.url)
    if (destino) router.push(destino)
  }

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierta((valor) => !valor)}
        aria-expanded={abierta}
        aria-controls={idMenu}
        aria-label={resumen.noLeidas ? `Notificaciones (${resumen.noLeidas} sin leer)` : 'Notificaciones'}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5M13.7 19a2 2 0 0 1-3.4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {resumen.noLeidas > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[0.625rem] font-semibold text-white">
            {resumen.noLeidas > 9 ? '9+' : resumen.noLeidas}
          </span>
        ) : null}
      </button>

      {abierta ? (
        <div
          id={idMenu}
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-surface shadow-soft"
        >
          <p className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">Notificaciones</p>

          {resumen.ultimas.length ? (
            <ul className="max-h-96 overflow-y-auto">
              {resumen.ultimas.map((notificacion) => (
                <li key={notificacion.id}>
                  <button
                    type="button"
                    onClick={() => abrir(notificacion)}
                    className={cn(
                      'flex w-full gap-2.5 px-4 py-3 text-left transition-colors hover:bg-brand-50',
                      !notificacion.leidaEl && 'bg-brand-50/60',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', notificacion.leidaEl ? 'bg-transparent' : 'bg-brand-500')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{notificacion.titulo}</span>
                      {notificacion.cuerpo ? (
                        <span className="mt-0.5 block line-clamp-2 text-xs text-foreground/60">{notificacion.cuerpo}</span>
                      ) : null}
                      <span className="mt-1 block text-xs text-foreground/40">{tiempoRelativo(notificacion.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-foreground/60">No tienes notificaciones.</p>
          )}

          <Link
            href="/cuenta/notificaciones"
            onClick={() => setAbierta(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-sm text-brand-700 transition-colors hover:bg-brand-50"
          >
            Ver todas
          </Link>
        </div>
      ) : null}
    </div>
  )
}
