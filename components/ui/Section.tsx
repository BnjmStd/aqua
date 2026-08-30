import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import { TexturaGrilla } from './TexturaGrilla'

const sectionVariants = cva('relative py-16 sm:py-24', {
  variants: {
    tone: {
      default: 'bg-background text-foreground',
      muted: 'bg-brand-50 text-foreground',
      brand: 'bg-brand-700 text-white',
      navy: 'bg-navy-800 text-white',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

type SectionProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
    textura?: boolean
  }

export function Section({ className, tone, textura, children, ...props }: SectionProps) {
  const oscura = tone === 'navy' || tone === 'brand'

  return (
    <section className={cn(sectionVariants({ tone }), className)} {...props}>
      {textura ? <TexturaGrilla oscura={oscura} /> : null}
      {children}
    </section>
  )
}
