import { cn } from '@/lib/cn'

/** Primer nombre + primer apellido: "Ana María Pérez" -> "AP". */
function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  const primera = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primera + ultima).toUpperCase()
}

const TAMANO = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const

/** Avatar de la cuenta. No hay foto de perfil: van las iniciales sobre teal. */
export function Iniciales({ nombre, size = 'md', className }: { nombre: string; size?: keyof typeof TAMANO; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-700 font-semibold text-white',
        TAMANO[size],
        className,
      )}
    >
      {iniciales(nombre)}
    </span>
  )
}
