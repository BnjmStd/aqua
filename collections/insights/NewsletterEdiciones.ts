import { APIError } from 'payload'
import type { Access, CollectionConfig } from 'payload'

import { soloAdmins, soloAutenticados } from '../../access'
import { campoSlug } from '../../fields/slug'
import { UNIDADES } from '../../fields/unidad'

/**
 * EDICIONES DEL NEWSLETTER.
 *
 * `estadoEnvio` es el caso mas claro de por que los estados de negocio NO
 * pueden ser el `_status` de Payload: "enviada" es IRREVERSIBLE. Un correo
 * que salio no vuelve. El hook de abajo congela el contenido una vez enviado,
 * para que nadie edite despues una edicion ya distribuida y quede un archivo
 * publico que no coincide con lo que la gente recibio.
 */

/**
 * El archivo publico muestra solo ediciones YA ENVIADAS.
 *
 * Ojo: no se puede reusar `publicadosOAutenticados` aca, porque esa funcion
 * filtra por `_status`, que solo existe si la coleccion tiene `versions.drafts`.
 * Esta coleccion no los tiene (su ciclo de vida es `estadoEnvio`), asi que
 * filtrar por `_status` reventaba con un 500.
 */
const enviadasOAutenticados: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    estadoEnvio: {
      equals: 'enviada',
    },
  }
}
export const NewsletterEdiciones: CollectionConfig = {
  slug: 'newsletter-ediciones',
  labels: { singular: 'Edicion del newsletter', plural: 'Newsletter' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['numero', 'titulo', 'estadoEnvio', 'fechaEnvio'],
    group: 'Insights',
  },
  access: {
    read: enviadasOAutenticados, // el archivo web de ediciones ya distribuidas
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAdmins,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        if (operation !== 'update' || originalDoc?.estadoEnvio !== 'enviada') return data

        const inmutables = ['asunto', 'preheader', 'contenido', 'segmentacion'] as const
        for (const campo of inmutables) {
          const cambio = JSON.stringify(data?.[campo]) !== JSON.stringify(originalDoc?.[campo])
          if (campo in (data ?? {}) && cambio) {
            throw new APIError(
              'Esta edicion ya fue enviada: su contenido no puede modificarse. ' +
                'Si necesitas corregir algo, crea una fe de erratas como edicion nueva.',
              400,
              null,
              true,
            )
          }
        }

        return data
      },
    ],
  },
  fields: [
    { name: 'numero', type: 'number', label: 'Numero de edicion', required: true, unique: true },
    { name: 'titulo', type: 'text', required: true },
    campoSlug(),
    {
      name: 'asunto',
      type: 'text',
      label: 'Asunto del correo',
      required: true,
      maxLength: 90,
      admin: { description: 'Lo que se ve en la bandeja de entrada. Corto funciona mejor.' },
    },
    {
      name: 'preheader',
      type: 'text',
      maxLength: 140,
      admin: { description: 'Texto de vista previa, despues del asunto.' },
    },
    { name: 'contenido', type: 'richText', required: true },
    {
      name: 'articulosDestacados',
      type: 'relationship',
      relationTo: 'articulos',
      hasMany: true,
      admin: { description: 'Articulos del sitio que se referencian en esta edicion.' },
    },
    {
      name: 'segmentacion',
      type: 'select',
      hasMany: true,
      options: [...UNIDADES],
      admin: {
        position: 'sidebar',
        description: 'Vacio = va a todos los suscriptores confirmados.',
      },
    },
    {
      name: 'estadoEnvio',
      type: 'select',
      required: true,
      defaultValue: 'borrador',
      options: [
        { label: 'Borrador', value: 'borrador' },
        { label: 'Programada', value: 'programada' },
        { label: 'Enviada', value: 'enviada' },
        { label: 'Cancelada', value: 'cancelada' },
      ],
      admin: {
        position: 'sidebar',
        description: '"Enviada" es irreversible: el contenido queda congelado.',
      },
    },
    {
      name: 'fechaProgramada',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => data?.estadoEnvio === 'programada',
      },
    },
    {
      name: 'fechaEnvio',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, description: 'Lo escribe el proceso de envio.' },
    },
    {
      name: 'destinatarios',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true, description: 'Cantidad a la que se envio.' },
    },
  ],
}
