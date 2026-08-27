import type { InputHTMLAttributes } from 'react'

import { Input } from './Input'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
}

export function Field({ label, name, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input id={name} name={name} className="mt-1.5" {...props} />
    </div>
  )
}
