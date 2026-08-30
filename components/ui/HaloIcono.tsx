import type { NombreIcono } from '@/fields/iconos'

import { cn } from '@/lib/cn'
import { Icono } from './iconos'

const VARIANTE = {
  brand: 'bg-brand-100 text-brand-700',
  navy: 'bg-navy-800 text-brand-300',
  lime: 'bg-lime/30 text-navy-800',
} as const

export function HaloIcono({
  nombre,
  variante = 'brand',
  className,
}: {
  nombre: NombreIcono
  variante?: keyof typeof VARIANTE
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex size-12 items-center justify-center rounded-full',
        VARIANTE[variante],
        className,
      )}
    >
      <Icono nombre={nombre} size={24} />
    </span>
  )
}
