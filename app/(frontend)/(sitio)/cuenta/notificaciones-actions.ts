'use server'

import { revalidatePath } from 'next/cache'

import { obtenerUsuarioActual } from '@/lib/auth'
import { obtenerPayload } from '@/lib/payload'
import { type Destinatario, obtenerResumen } from '@/queries/cuenta/notificaciones'

/** Quién está mirando: sirve para cuentas del sitio y para personal del panel. */
async function destinatarioActual(): Promise<Destinatario | null> {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) return null
  const coleccion = (usuario as { collection?: string }).collection
  if (coleccion !== 'users' && coleccion !== 'cuentas') return null
  return { coleccion, id: String(usuario.id) }
}

/**
 * Marca como leída. El filtro incluye al destinatario a propósito: aunque
 * alguien mande el id de otra persona, no cambia nada.
 */
export async function marcarLeida(id: string) {
  const destinatario = await destinatarioActual()
  if (!destinatario) return

  const payload = await obtenerPayload()
  await payload.update({
    collection: 'notificaciones',
    where: {
      and: [
        { id: { equals: id } },
        { 'destinatario.value': { equals: destinatario.id } },
        { 'destinatario.relationTo': { equals: destinatario.coleccion } },
        { leidaEl: { exists: false } },
      ],
    },
    data: { leidaEl: new Date().toISOString() },
  })
  revalidatePath('/cuenta/notificaciones')
}

export async function marcarTodasLeidas() {
  const destinatario = await destinatarioActual()
  if (!destinatario) return

  const payload = await obtenerPayload()
  await payload.update({
    collection: 'notificaciones',
    where: {
      and: [
        { 'destinatario.value': { equals: destinatario.id } },
        { 'destinatario.relationTo': { equals: destinatario.coleccion } },
        { leidaEl: { exists: false } },
      ],
    },
    data: { leidaEl: new Date().toISOString() },
  })
  revalidatePath('/cuenta/notificaciones')
}

/**
 * Para que la campana se actualice sin recargar: el Header vive en el layout
 * y no se vuelve a renderizar al navegar entre páginas.
 */
export async function resumenNotificaciones() {
  const destinatario = await destinatarioActual()
  if (!destinatario) return { noLeidas: 0, ultimas: [] }
  return obtenerResumen(destinatario)
}
