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
        secundario:
          'border border-slate-300 bg-transparent text-foreground hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
        ghost: 'text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950',
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
