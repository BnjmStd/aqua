'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { type EstadoFormularioCuenta, registrarCuenta } from '../actions'
import { MensajeFormulario } from '../MensajeFormulario'

const ESTADO_INICIAL: EstadoFormularioCuenta = {}

export function FormularioRegistro() {
  const [estado, accion, enviando] = useActionState(registrarCuenta, ESTADO_INICIAL)
  const { errores = {}, valores = {} } = estado

  return (
    <form action={accion} noValidate className="mt-8 space-y-5">
      <MensajeFormulario mensaje={estado.mensaje} />
      <Field
        label="Nombre completo"
        name="nombre"
        required
        autoComplete="name"
        defaultValue={valores.nombre}
        error={errores.nombre}
      />
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
        label="Teléfono (opcional)"
        name="telefono"
        type="tel"
        autoComplete="tel"
        defaultValue={valores.telefono}
        error={errores.telefono}
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        ayuda="Mínimo 8 caracteres."
        error={errores.password}
      />
      <Button type="submit" size="lg" className="w-full" disabled={enviando}>
        {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
