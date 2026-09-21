import type { Where } from 'payload'

import { obtenerPayload } from '@/lib/payload'
import type { Notificacione } from '@/payload-types'

export type Destinatario = { coleccion: 'users' | 'cuentas'; id: string }

/** Filtro de "las mías": la relación es polimórfica, así que se compara id + colección. */
const suyas = ({ coleccion, id }: Destinatario): Where => ({
  and: [{ 'destinatario.value': { equals: id } }, { 'destinatario.relationTo': { equals: coleccion } }],
})

export async function contarNoLeidas(destinatario: Destinatario): Promise<number> {
  const payload = await obtenerPayload()
  const { totalDocs } = await payload.count({
    collection: 'notificaciones',
    where: { and: [suyas(destinatario), { leidaEl: { exists: false } }] },
  })
  return totalDocs
}

export async function obtenerNotificaciones(
  destinatario: Destinatario,
  { limite = 30 }: { limite?: number } = {},
): Promise<Notificacione[]> {
  const payload = await obtenerPayload()
  const { docs } = await payload.find({
    collection: 'notificaciones',
    where: suyas(destinatario),
    sort: '-createdAt',
    depth: 0,
    limit: limite,
  })
  return docs
}

/** Lo que necesita la campana: contador + las últimas, en una sola pasada. */
export async function obtenerResumen(destinatario: Destinatario, limite = 5) {
  const [noLeidas, ultimas] = await Promise.all([
    contarNoLeidas(destinatario),
    obtenerNotificaciones(destinatario, { limite }),
  ])
  return { noLeidas, ultimas }
}
