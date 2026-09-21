'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { cerrarSesion } from '@/app/(frontend)/(sitio)/cuenta/actions'
import { cn } from '@/lib/cn'
import { ENLACES_CUENTA, esEnlaceCuentaActivo } from './enlaces'
import { Iniciales } from './Iniciales'

type Props = { nombre: string; email: string }

/** Menu de la cuenta en el header (escritorio): avatar + nombre, abre un desplegable. */
export function MenuCuenta({ nombre, email }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [rutaAlAbrir, setRutaAlAbrir] = useState<string | null>(null)
  const contenedor = useRef<HTMLDivElement>(null)
  const idMenu = useId()
  const pathname = usePathname()

  // Al navegar se cierra solo: el menu queda abierto solo en la ruta donde se abrio.
  const visible = abierto && rutaAlAbrir === pathname

  useEffect(() => {
    if (!visible) return

    function alClickFuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('mousedown', alClickFuera)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alClickFuera)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [visible])

  const primerNombre = nombre.trim().split(/\s+/)[0]

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => {
          setRutaAlAbrir(pathname)
          setAbierto(!visible)
        }}
        aria-expanded={visible}
        aria-controls={idMenu}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-foreground transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Iniciales nombre={nombre} size="sm" />
        <span className="max-w-32 truncate">{primerNombre}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden
          className={cn('text-muted transition-transform', visible && 'rotate-180')}
        >
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">Abrir menú de la cuenta</span>
      </button>

      {visible ? (
        <div
          id={idMenu}
          className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-lg border border-border bg-surface shadow-soft"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Iniciales nombre={nombre} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{nombre}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>

          <ul className="py-1">
            {ENLACES_CUENTA.map((enlace) => {
              const activo = esEnlaceCuentaActivo(enlace.url, pathname)
              return (
                <li key={enlace.url}>
                  <Link
                    href={enlace.url}
                    onClick={() => setAbierto(false)}
                    aria-current={activo ? 'page' : undefined}
                    className={cn(
                      'block px-4 py-2 text-sm transition-colors hover:bg-brand-50 hover:text-brand-700',
                      activo ? 'text-brand-700' : 'text-foreground',
                    )}
                  >
                    {enlace.etiqueta}
                  </Link>
                </li>
              )
            })}
          </ul>

          <form action={cerrarSesion} className="border-t border-border py-1">
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm text-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
