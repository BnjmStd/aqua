'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { cerrarSesion } from '@/app/(frontend)/(sitio)/cuenta/actions'
import { Iniciales } from '@/components/cuenta/Iniciales'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type NavLink = { etiqueta: string; url: string }
type CuentaResumida = { nombre: string; email: string; noLeidas: number }

export function MobileNav({ enlaces, cuenta }: { enlaces: NavLink[]; cuenta: CuentaResumida | null }) {
  const [abierto, setAbierto] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 md:hidden">
      {/* Con sesion, el avatar queda a la vista junto a la hamburguesa: es la señal de "estas dentro". */}
      {cuenta ? (
        <Link
          href={cuenta.noLeidas ? '/cuenta/notificaciones' : '/cuenta'}
          aria-label={cuenta.noLeidas ? `Mi cuenta (${cuenta.noLeidas} avisos sin leer)` : 'Mi cuenta'}
          className="relative rounded-full p-1 hover:bg-brand-50"
        >
          <Iniciales nombre={cuenta.nombre} size="sm" />
          {cuenta.noLeidas ? (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[0.625rem] font-semibold text-white">
              {cuenta.noLeidas > 9 ? '9+' : cuenta.noLeidas}
            </span>
          ) : null}
        </Link>
      ) : null}

      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-sm text-navy-800 hover:bg-brand-50"
      >
        <span className="sr-only">Menú</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {abierto ? (
        // `top-20` sigue a la altura del header: si cambia una, cambia la otra.
        <nav className="absolute inset-x-0 top-20 border-t border-border bg-surface px-6 py-4 shadow-soft">
          {cuenta ? (
            <Link
              href="/cuenta"
              onClick={() => setAbierto(false)}
              className="mb-3 flex items-center gap-3 rounded-md border border-border px-3 py-2.5 hover:bg-brand-50"
            >
              <Iniciales nombre={cuenta.nombre} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{cuenta.nombre}</span>
                <span className="block truncate text-xs text-muted">Ver mi cuenta</span>
              </span>
            </Link>
          ) : (
            <Button
              href="/cuenta/ingresar"
              onClick={() => setAbierto(false)}
              variant="secundario"
              size="sm"
              className="mb-3 w-full"
            >
              Ingresar
            </Button>
          )}

          <ul className="flex flex-col gap-1">
            {enlaces.map((enlace) => {
              const activo =
                enlace.url === '/'
                  ? pathname === '/'
                  : pathname === enlace.url || pathname.startsWith(`${enlace.url}/`)

              const clase = cn(
                'block rounded-sm px-3 py-2 text-xs font-medium uppercase tracking-[0.05em]',
                activo
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-muted hover:bg-brand-50 hover:text-brand-700',
              )
              const externo = enlace.url.startsWith('mailto:') || enlace.url.startsWith('http')

              return (
                <li key={enlace.url}>
                  {externo ? (
                    <a
                      href={enlace.url}
                      onClick={() => setAbierto(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clase}
                    >
                      {enlace.etiqueta}
                    </a>
                  ) : (
                    <Link
                      href={enlace.url}
                      onClick={() => setAbierto(false)}
                      aria-current={activo ? 'page' : undefined}
                      className={clase}
                    >
                      {enlace.etiqueta}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          {cuenta ? (
            <form action={cerrarSesion} className="mt-3 border-t border-border pt-3">
              <button
                type="submit"
                className="block w-full rounded-sm px-3 py-2 text-left text-sm text-muted hover:bg-brand-50 hover:text-brand-700"
              >
                Cerrar sesión
              </button>
            </form>
          ) : null}
        </nav>
      ) : null}
    </div>
  )
}
