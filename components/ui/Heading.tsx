import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

const sizeByLevel = {
  1: 'text-4xl sm:text-5xl lg:text-6xl tracking-tight',
  2: 'text-3xl sm:text-4xl tracking-tight',
  3: 'text-2xl sm:text-3xl',
  4: 'text-xl sm:text-2xl',
} as const

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export function Heading({ level = 2, as, className, ...props }: HeadingProps) {
  const Tag = as ?? (`h${level}` as const)

  return (
    <Tag
      className={cn(
        // Navy para titulares: es la jerarquia que usa el brochure. Va antes
        // que `className` para que un `text-white` (secciones tone="brand")
        // lo pise via tailwind-merge.
        'font-serif font-semibold text-balance text-navy-800',
        sizeByLevel[level],
        className,
      )}
      {...props}
    />
  )
}
