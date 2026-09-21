import type { NewsletterEdicione } from '@/payload-types'
import { obtenerPayload } from '@/lib/payload'

/** Ediciones ya enviadas, para el archivo publico de Insights. */
export async function obtenerNewsletterEnviadas(
  limite = 6,
): Promise<NewsletterEdicione[]> {
  const payload = await obtenerPayload()

  const { docs } = await payload.find({
    collection: 'newsletter-ediciones',
    where: { estadoEnvio: { equals: 'enviada' } },
    sort: '-numero',
    depth: 0,
    limit: limite,
  })

  return docs
}
