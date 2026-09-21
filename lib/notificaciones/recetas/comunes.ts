import type { PayloadRequest } from 'payload'

import type { Destinatario } from '../tipos'

const SERVIDOR = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** Los correos necesitan URL completa; la bandeja in-app usa rutas internas. */
export const rutaAbsoluta = (ruta: string) => `${SERVIDOR}${ruta}`

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Santiago',
})

export const formatearFecha = (fechaISO: string) => FORMATO_FECHA.format(new Date(fechaISO))

/** Recorta textos largos del usuario para que no desborden un correo. */
export const recorte = (texto: string, largo = 300) =>
  texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto

/**
 * Equipo que recibe los avisos internos: por ahora todos los usuarios del
 * panel. En la fase 2 de preferencias, cada uno elige qué le llega.
 */
export async function destinatariosDelEquipo(req: PayloadRequest): Promise<Destinatario[]> {
  const { docs } = await req.payload.find({ collection: 'users', depth: 0, limit: 100, pagination: false, req })
  return docs.map((usuario) => ({
    coleccion: 'users',
    id: usuario.id,
    nombre: usuario.nombre ?? usuario.email,
    email: usuario.email,
  }))
}
