import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200',
        className,
      )}
      {...props}
    />
  )
}
