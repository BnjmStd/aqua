import type { CollectionConfig } from 'payload'

/**
 * Configuracion estandar de versionado para contenido publicable.
 *
 * `_status` de Payload es exactamente draft | published — nada mas.
 * Los estados de negocio (activo, cancelado, enviada...) NO van aca:
 * son un eje distinto y viven en un campo propio de cada coleccion.
 *
 * `schedulePublish` permite publicar Y despublicar con fecha, util para
 * convocatorias que vencen. Corre sobre el jobs queue, por eso payload.config.ts
 * configura `jobs.autoRun`.
 */
export const versionesConBorrador: CollectionConfig['versions'] = {
  drafts: {
    schedulePublish: true,
  },
  maxPerDoc: 25,
}
