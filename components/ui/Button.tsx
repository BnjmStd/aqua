import Link from 'next/link'
import { type VariantProps, cva } from 'class-variance-authority'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primario: 'bg-brand-700 text-white hover:bg-brand-800',
        // El CTA solido de la maqueta es navy, no teal: el teal queda para
        // acentos y enlaces, donde no compite con el peso del navy.
        navy: 'bg-navy-800 text-white hover:bg-navy-950',
        secundario:
          'border border-border bg-transparent text-foreground hover:bg-brand-50',
        ghost: 'text-brand-700 hover:bg-brand-50',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primario',
      size: 'md',
    },
  },
)

type CommonProps = VariantProps<typeof buttonVariants> & {
  className?: string
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button({ className, variant, size, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props as ButtonAsLink
    return <Link href={href} className={classes} {...anchorProps} />
  }

  return <button className={classes} {...(props as ButtonAsButton)} />
}
