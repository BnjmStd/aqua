import Image from 'next/image'

import { cn } from '@/lib/cn'

/**
 * Foto a sangre detrás de una sección. El velo navy evita que compita con el texto.
 */
export function FondoFoto({
  src,
  opacidad = 0.35,
  className,
}: {
  src: string
  opacidad?: number
  className?: string
}) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <Image src={src} alt="" fill sizes="100vw" className="object-cover" style={{ opacity: opacidad }} />
      <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-800/80 to-navy-900/55" />
    </div>
  )
}
