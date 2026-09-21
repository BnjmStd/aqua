import type { Inscripcione } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/**
 * "Compras" de la cuenta logueada. Hoy no existe una coleccion de pedidos:
 * lo unico que se paga son inscripciones, y el pago vive en su grupo `pago`.
 * Quedan fuera las `sin_costo` (siguen visibles en Mis inscripciones).
 *
 * Si algun dia hay pasarela o pedidos con varios participantes, se cambia
 * esta query y la pantalla sigue igual.
 */
export async function obtenerMisCompras(cuentaId: string): Promise<Inscripcione[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'inscripciones',
    where: {
      and: [{ cuenta: { equals: cuentaId } }, { 'pago.estadoPago': { not_equals: 'sin_costo' } }],
    },
    sort: '-createdAt',
    // 2 niveles: inscripcion -> convocatoria -> curso (titulo y slug).
    depth: 2,
    limit: 100,
  })

  return docs
}
