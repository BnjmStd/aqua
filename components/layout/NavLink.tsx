'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'

/**
 * Enlace del nav principal. Vive en cliente solo por `usePathname`: el estado
 * activo de la maqueta (teal + subrayado fijo) no se puede resolver en el
 * servidor porque el Header es compartido por todas las rutas.
 */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  // Activo tambien en las subrutas: /academy/cursos marca "Academia".
  const activo =
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={activo ? 'page' : undefined}
      className={cn(
        // El subrayado es un ::after que crece de 0 a 100%: animar `width`
        // en vez de `scaleX` lo hace nacer desde la izquierda, como el template.
        'relative text-xs font-medium uppercase tracking-[0.05em] transition-colors',
        'after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-brand-500',
        'after:transition-[width] after:duration-200 hover:after:w-full',
        activo ? 'text-brand-700 after:w-full' : 'text-muted after:w-0 hover:text-brand-700',
      )}
    >
      {children}
    </Link>
  )
}
