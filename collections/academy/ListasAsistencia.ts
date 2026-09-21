import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { soloAutenticados } from '../../access'

/**
 * LISTA DE ASISTENCIA = quienes estuvieron en UNA sesion de una convocatoria.
 * El relator pasa lista por sesion: abre (o crea) "Corrosion · sesion 2" y
 * marca a los presentes entre los inscritos.
 *
 * Coleccion propia y no un campo en `convocatorias.sesiones` porque las
 * convocatorias tienen borradores: pasar lista obligaria a re-publicar la
 * convocatoria (y gastaria versiones) cada vez. Ademas es privada de
 * entrada: el publico lee convocatorias, pero esto no.
 *
 * El alumno NO lee esta coleccion por la API: el aula la consulta en el
 * servidor y muestra solo lo de su propia inscripcion.
 */
export const ListasAsistencia: CollectionConfig = {
  slug: 'listas-asistencia',
  labels: { singular: 'Lista de asistencia', plural: 'Listas de asistencia' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'convocatoria', 'sesion', 'updatedAt'],
    group: 'Academy',
    description: 'Una lista por sesión. Marca a los presentes; el resto cuenta como ausente.',
  },
  access: {
    read: soloAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          async ({ siblingData, req }) => {
            if (!siblingData.convocatoria) return undefined
            const convocatoria = await req.payload.findByID({
              collection: 'convocatorias',
              id: String(siblingData.convocatoria),
              depth: 0,
              draft: true,
              req,
            })
            return `${convocatoria?.titulo ?? 'Convocatoria'} · sesión ${siblingData.sesion}`
          },
        ],
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'convocatoria',
          type: 'relationship',
          relationTo: 'convocatorias',
          required: true,
          index: true,
          admin: { width: '70%' },
        },
        {
          name: 'sesion',
          type: 'number',
          required: true,
          min: 1,
          admin: { width: '30%', description: 'N° según el orden de fechas.' },
        },
      ],
    },
    {
      name: 'presentes',
      type: 'relationship',
      relationTo: 'inscripciones',
      hasMany: true,
      // Solo inscritos de ESTA convocatoria que siguen vigentes.
      filterOptions: ({ siblingData }) => {
        const convocatoria = (siblingData as { convocatoria?: string })?.convocatoria
        if (!convocatoria) return false
        return {
          convocatoria: { equals: convocatoria },
          estadoInscripcion: { in: ['confirmada', 'asistio', 'no_asistio'] },
        }
      },
      admin: {
        description: 'Elige la convocatoria primero. Solo aparecen inscripciones confirmadas.',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        const convocatoria = data?.convocatoria ?? originalDoc?.convocatoria
        const sesion = data?.sesion ?? originalDoc?.sesion
        if (!convocatoria || !sesion) return data

        // Una sola lista por sesion: dos listas darian asistencias contradictorias.
        const { docs } = await req.payload.find({
          collection: 'listas-asistencia',
          where: {
            and: [
              { convocatoria: { equals: convocatoria } },
              { sesion: { equals: sesion } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
          req,
        })
        if (docs.length) {
          throw new APIError(`Ya existe la lista de la sesión ${sesion} para esta convocatoria. Edítala en vez de crear otra.`, 400, null, true)
        }
        return data
      },
    ],
  },
}
