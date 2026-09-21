'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'
import { ENLACES_CUENTA, esEnlaceCuentaActivo } from './enlaces'

/**
 * Navegacion interna de /cuenta: columna en escritorio, fila de pestañas con
 * scroll horizontal en movil (mismos enlaces, solo cambia el flex).
 */
export function NavCuenta() {
  const pathname = usePathname()

  return (
    <nav aria-label="Secciones de la cuenta" className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex gap-1 border-b border-border md:flex-col md:border-b-0">
        {ENLACES_CUENTA.map((enlace) => {
          const activo = esEnlaceCuentaActivo(enlace.url, pathname)
          return (
            <li key={enlace.url} className="shrink-0">
              <Link
                href={enlace.url}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'block whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors',
                  // Movil: pestaña con subrayado. Escritorio: item con fondo y barra lateral.
                  '-mb-px border-b-2 md:mb-0 md:rounded-md md:border-b-0 md:border-l-2 md:rounded-l-none',
                  activo
                    ? 'border-brand-500 text-brand-700 md:bg-brand-50'
                    : 'border-transparent text-muted hover:text-brand-700 md:hover:bg-brand-50',
                )}
              >
                {enlace.etiqueta}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
