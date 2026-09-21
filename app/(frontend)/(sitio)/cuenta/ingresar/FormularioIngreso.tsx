'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { type EstadoFormularioCuenta, iniciarSesion } from '../actions'
import { MensajeFormulario } from '../MensajeFormulario'

const ESTADO_INICIAL: EstadoFormularioCuenta = {}

export function FormularioIngreso({ redirectTo }: { redirectTo?: string }) {
  const [estado, accion, enviando] = useActionState(iniciarSesion, ESTADO_INICIAL)
  const { errores = {}, valores = {} } = estado

  return (
    <form action={accion} noValidate className="mt-8 space-y-5">
      <MensajeFormulario mensaje={estado.mensaje} />
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={valores.email}
        error={errores.email}
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        error={errores.password}
      />
      <Button type="submit" size="lg" className="w-full" disabled={enviando}>
        {enviando ? 'Ingresando…' : 'Ingresar'}
      </Button>
    </form>
  )
}
