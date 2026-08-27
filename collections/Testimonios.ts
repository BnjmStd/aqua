import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../access'
import { campoUnidad } from '../fields/unidad'
import { versionesConBorrador } from '../lib/versiones'
import { traducible } from '../lib/localizacion'

export const Testimonios: CollectionConfig = {
  slug: 'testimonios',
  labels: { singular: 'Testimonio', plural: 'Testimonios' },
  admin: {
    useAsTitle: 'autorNombre',
    defaultColumns: ['autorNombre', 'autorEmpresa', 'unidad', '_status'],
    group: 'Transversal',
  },
  access: {
    read: publicadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  versions: versionesConBorrador,
  fields: [
    traducible({ name: 'cita', type: 'textarea', required: true, label: 'Testimonio' }),
    { name: 'autorNombre', type: 'text', required: true, label: 'Nombre de quien lo dice' },
    traducible({ name: 'autorCargo', type: 'text', label: 'Cargo' }),
    { name: 'autorEmpresa', type: 'text', label: 'Empresa' },
    { name: 'cliente', type: 'relationship', relationTo: 'clientes' },
    { name: 'foto', type: 'upload', relationTo: 'media' },
    campoUnidad(false),
  ],
}
