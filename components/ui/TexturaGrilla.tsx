import { cn } from '@/lib/cn'

/**
 * Grilla técnica de fondo. En claro usa el borde de la paleta; en navy/brand
 * un blanco muy suave para que se lea como plano de planta, no como ruido.
 */
export function TexturaGrilla({ oscura = false, className }: { oscura?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0',
        oscura
          ? 'opacity-[0.18] [background-image:linear-gradient(to_right,rgb(255_255_255/0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.12)_1px,transparent_1px)]'
          : 'opacity-[0.35] [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)]',
        '[background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]',
        className,
      )}
    />
  )
}
