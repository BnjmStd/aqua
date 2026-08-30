'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/cn'

type NavLink = { etiqueta: string; url: string }

export function MobileNav({ enlaces }: { enlaces: NavLink[] }) {
  const [abierto, setAbierto] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
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
        </nav>
      ) : null}
    </div>
  )
}
