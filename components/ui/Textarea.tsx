import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-slate-300 bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700',
        className,
      )}
      {...props}
    />
  )
}
