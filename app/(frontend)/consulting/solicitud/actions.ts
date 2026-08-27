'use server'

import { redirect } from 'next/navigation'

import { obtenerCuentaActual } from '@/lib/auth'
import { obtenerPayload } from '@/lib/payload'

export async function crearSolicitud(formData: FormData) {
  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect('/cuenta/ingresar?redirect=/consulting/solicitud')

  const servicio = String(formData.get('servicio') ?? '') || undefined
  const empresa = String(formData.get('empresa') ?? '') || undefined
  const mensaje = String(formData.get('mensaje') ?? '')

  const payload = await obtenerPayload()

  try {
    await payload.create({
      collection: 'solicitudes-consulting',
      data: { cuenta: cuenta.id, servicio, empresa, mensaje, estado: 'nueva' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos enviar la solicitud.'
    redirect(`/consulting/solicitud?error=${encodeURIComponent(message)}`)
  }

  redirect('/cuenta')
}
