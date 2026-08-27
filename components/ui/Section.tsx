import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

const sectionVariants = cva('py-16 sm:py-24', {
  variants: {
    tone: {
      default: 'bg-background text-foreground',
      muted: 'bg-brand-50 text-foreground',
      // El petrol del logotipo (#0d6c7a), no el extremo oscuro de la rampa:
      // es el color con el que el brochure firma, y blanco sobre el da 6.1:1.
      brand: 'bg-brand-700 text-white',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

type SectionProps = HTMLAttributes<HTMLElement> & VariantProps<typeof sectionVariants>

export function Section({ className, tone, ...props }: SectionProps) {
  return <section className={cn(sectionVariants({ tone }), className)} {...props} />
}
