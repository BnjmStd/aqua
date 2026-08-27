import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-md border border-slate-300 bg-background px-3.5 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className,
      )}
      {...props}
    />
  )
}
