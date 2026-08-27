'use client'

import Link from 'next/link'
import { useState } from 'react'

type NavLink = { etiqueta: string; url: string }

export function MobileNav({ enlaces }: { enlaces: NavLink[] }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-sm text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
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
        <nav className="absolute inset-x-0 top-16 border-t border-slate-200 bg-background px-6 py-4 shadow-soft dark:border-slate-800">
          <ul className="flex flex-col gap-1">
            {enlaces.map((enlace) => (
              <li key={enlace.url}>
                <Link
                  href={enlace.url}
                  onClick={() => setAbierto(false)}
                  className="block rounded-sm px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {enlace.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
