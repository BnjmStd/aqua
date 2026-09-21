import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import { Input } from './Input'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  /** Mensaje de error del campo (validacion del servidor). */
  error?: string
  /** Texto de ayuda bajo el campo; se oculta mientras haya error. */
  ayuda?: string
}

export function Field({ label, name, error, ayuda, className, ...props }: FieldProps) {
  const idDescripcion = error || ayuda ? `${name}-descripcion` : undefined

  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={idDescripcion}
        className={cn('mt-1.5', error && 'border-red-500 focus-visible:ring-red-500', className)}
        {...props}
      />
      {error ? (
        <p id={idDescripcion} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : ayuda ? (
        <p id={idDescripcion} className="mt-1.5 text-sm text-foreground/60">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
