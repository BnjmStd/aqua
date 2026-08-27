import type { Pagina } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/**
 * Trae una pagina de bloques por slug. `publicadosOAutenticados` en la
 * coleccion ya filtra borradores para el publico, asi que aca no hace falta
 * repetir el `_status`. `depth: 2` resuelve las relaciones de los bloques
 * (imagen del hero, clientes de logos, personas del equipo).
 */
export async function obtenerPagina(slug: string): Promise<Pagina | null> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'paginas',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  return docs[0] ?? null
}
