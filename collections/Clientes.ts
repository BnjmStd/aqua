import type { CollectionConfig } from 'payload'

import type { Access } from 'payload'

import { soloAutenticados } from '../access'

/**
 * El publico solo ve los clientes que autorizaron aparecer.
 * Listar por nombre a quien no dio permiso es un problema comercial,
 * aunque nunca se muestre su logo.
 */
const autorizadosOAutenticados: Access = ({ req: { user } }) => {
  if (user) return true
  return { mostrarLogo: { equals: true } }
}

export const Clientes: CollectionConfig = {
  slug: 'clientes',
  labels: { singular: 'Cliente', plural: 'Clientes' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'rubro', 'mostrarLogo'],
    group: 'Transversal',
    description: 'Empresas atendidas. Solo se muestran publicamente las autorizadas.',
  },
  access: {
    read: autorizadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'sitioWeb', type: 'text' },
    {
      name: 'rubro',
      type: 'select',
      options: [
        { label: 'Acuicultura', value: 'acuicultura' },
        { label: 'Pesca', value: 'pesca' },
        { label: 'Alimentos', value: 'alimentos' },
        { label: 'Tratamiento de aguas', value: 'aguas' },
        { label: 'Sector publico', value: 'publico' },
        { label: 'Academia', value: 'academia' },
        { label: 'Otro', value: 'otro' },
      ],
    },
    {
      // Consentimiento explicito: usar el logo de un cliente sin autorizacion
      // es un problema comercial y legal, no un detalle de diseno.
      name: 'mostrarLogo',
      type: 'checkbox',
      label: 'Autorizado a mostrar su logo publicamente',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
