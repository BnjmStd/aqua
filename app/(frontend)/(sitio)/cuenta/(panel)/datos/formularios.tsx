'use client'

import { useActionState, useEffect } from 'react'

import { mostrarAviso } from '@/components/ui/Avisos'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { type EstadoFormularioCuenta, actualizarDatos, cambiarPassword } from '../../actions'
import { MensajeFormulario } from '../../MensajeFormulario'

const ESTADO_INICIAL: EstadoFormularioCuenta = {}

/** Estos formularios no navegan al guardar: el exito se avisa con toast desde el cliente. */
function useAvisoDeExito(estado: EstadoFormularioCuenta) {
  const { exito } = estado
  useEffect(() => {
    if (exito) mostrarAviso(exito.mensaje)
  }, [exito])
}

type Datos = { nombre: string; telefono: string; rut: string }

export function FormularioDatos({ email, inicial }: { email: string; inicial: Datos }) {
  const [estado, accion, enviando] = useActionState(actualizarDatos, ESTADO_INICIAL)
  useAvisoDeExito(estado)
  const { errores = {} } = estado
  const valores = { ...inicial, ...estado.valores }

  return (
    <form action={accion} noValidate className="mt-6 space-y-5">
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
        value={email}
        readOnly
        disabled
        ayuda="Por ahora el email no se puede cambiar. Si lo necesitas, escríbenos."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Teléfono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="+56 9 1234 5678"
          defaultValue={valores.telefono}
          error={errores.telefono}
        />
        <Field
          label="RUT"
          name="rut"
          placeholder="12.345.678-9"
          defaultValue={valores.rut}
          error={errores.rut}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export function FormularioPassword({ email }: { email: string }) {
  const [estado, accion, enviando] = useActionState(cambiarPassword, ESTADO_INICIAL)
  useAvisoDeExito(estado)
  const { errores = {} } = estado

  return (
    <form action={accion} noValidate className="mt-6 space-y-5">
      {/* Para que el gestor de contraseñas asocie la nueva clave a la cuenta. */}
      <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
      <MensajeFormulario mensaje={estado.mensaje} />
      <Field
        label="Contraseña actual"
        name="passwordActual"
        type="password"
        required
        autoComplete="current-password"
        error={errores.passwordActual}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nueva contraseña"
          name="passwordNueva"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres."
          error={errores.passwordNueva}
        />
        <Field
          label="Repite la nueva contraseña"
          name="passwordConfirmacion"
          type="password"
          required
          autoComplete="new-password"
          error={errores.passwordConfirmacion}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="secundario" disabled={enviando}>
          {enviando ? 'Cambiando…' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  )
}
