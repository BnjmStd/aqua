import { cache } from 'react'

import { obtenerPayload } from './payload'

/**
 * Configuracion del sitio (global de Payload). `cache()` para que el header,
 * el footer y cualquier otro consumidor del mismo render compartan una sola
 * lectura.
 *
 * La razon social vive SOLO aca: es un dato legal y tenerlo repetido en
 * componentes es como terminan divergiendo entre paginas.
 */
export const obtenerConfiguracionSitio = cache(async () => {
  const payload = await obtenerPayload()
  return payload.findGlobal({ slug: 'configuracion-sitio' })
})
