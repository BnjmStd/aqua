import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

const textVariants = cva('', {
  variants: {
    tone: {
      body: 'text-base leading-relaxed text-foreground/90',
      lead: 'text-lg sm:text-xl leading-relaxed text-foreground/80',
      muted: 'text-sm text-foreground/60',
    },
  },
  defaultVariants: {
    tone: 'body',
  },
})

type TextProps = HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof textVariants>

export function Text({ className, tone, ...props }: TextProps) {
  return <p className={cn(textVariants({ tone }), className)} {...props} />
}
