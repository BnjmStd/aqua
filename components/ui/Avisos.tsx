'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'

import type { TipoAviso } from '@/lib/avisos'
import { cn } from '@/lib/cn'

/**
 * Toasts que suben desde abajo. Dos formas de disparar uno:
 *
 * - Desde el servidor: `dejarAviso()` (lib/avisos.ts) en una Server Action
 *   antes del `redirect()`. Este componente lee la cookie en cada cambio de
 *   ruta, muestra el aviso y la borra.
 * - Desde el cliente: `mostrarAviso()` directo.
 *
 * El estado vive en un store de modulo (no en el componente) para que
 * `mostrarAviso` se pueda llamar desde cualquier lado sin contexto.
 */

type Aviso = { id: number; tipo: TipoAviso; mensaje: string; saliendo: boolean }

const DURACION_MS = 5000
const SALIDA_MS = 200
const MAXIMO_VISIBLES = 3

let avisos: Aviso[] = []
let siguienteId = 1
const oyentes = new Set<() => void>()
const SIN_AVISOS: Aviso[] = []

function emitir() {
  for (const oyente of oyentes) oyente()
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

export function mostrarAviso(mensaje: string, tipo: TipoAviso = 'exito') {
  const id = siguienteId++
  avisos = [...avisos, { id, tipo, mensaje, saliendo: false }].slice(-MAXIMO_VISIBLES)
  emitir()
  setTimeout(() => cerrarAviso(id), DURACION_MS)
}

function cerrarAviso(id: number) {
  if (!avisos.some((aviso) => aviso.id === id && !aviso.saliendo)) return
  avisos = avisos.map((aviso) => (aviso.id === id ? { ...aviso, saliendo: true } : aviso))
  emitir()
  setTimeout(() => {
    avisos = avisos.filter((aviso) => aviso.id !== id)
    emitir()
  }, SALIDA_MS)
}

function consumirCookieDeAviso() {
  const cruda = document.cookie.split('; ').find((par) => par.startsWith('aviso='))
  if (!cruda) return
  document.cookie = 'aviso=; Max-Age=0; path=/'
  try {
    const { tipo, mensaje } = JSON.parse(decodeURIComponent(cruda.slice('aviso='.length)))
    if (typeof mensaje === 'string' && mensaje) mostrarAviso(mensaje, tipo)
  } catch {
    // Cookie malformada: se descarta en silencio.
  }
}

const ESTILO_TIPO: Record<TipoAviso, string> = {
  exito: 'text-lime',
  error: 'text-red-300',
  info: 'text-brand-300',
}

function IconoTipo({ tipo }: { tipo: TipoAviso }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className={cn('shrink-0', ESTILO_TIPO[tipo])}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      {tipo === 'exito' ? (
        <path d="m8 12.5 2.8 2.8L16.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : tipo === 'error' ? (
        <path d="M12 7.5v5.5M12 16.2v.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M12 11v5.5M12 7.8v.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  )
}

export function Avisos() {
  const lista = useSyncExternalStore(suscribir, () => avisos, () => SIN_AVISOS)
  const pathname = usePathname()

  useEffect(() => {
    consumirCookieDeAviso()
  }, [pathname])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2 sm:bottom-6"
    >
      {lista.map((aviso) => (
        <div
          key={aviso.id}
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg bg-navy-950 py-3 pl-4 pr-2 text-sm text-on-navy shadow-lg',
            aviso.saliendo ? 'animate-aviso-salir' : 'animate-aviso-entrar',
          )}
        >
          <IconoTipo tipo={aviso.tipo} />
          <p className="flex-1">{aviso.mensaje}</p>
          <button
            type="button"
            onClick={() => cerrarAviso(aviso.id)}
            aria-label="Cerrar aviso"
            className="rounded-md p-1.5 text-on-navy/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
