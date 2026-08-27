import type { SolicitudesConsulting } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/** Lee las solicitudes de consultoría de la cuenta logueada. */
export async function obtenerMisSolicitudes(cuentaId: string): Promise<SolicitudesConsulting[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'solicitudes-consulting',
    where: { cuenta: { equals: cuentaId } },
    sort: '-createdAt',
    depth: 1,
    limit: 50,
  })

  return docs
}
