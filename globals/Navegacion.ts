import type { Field, GlobalConfig } from 'payload'

import { soloAutenticados } from '../access'
import { traducible } from '../lib/localizacion'

const enlace: Field[] = [
  traducible({ name: 'etiqueta', type: 'text', required: true }),
  { name: 'url', type: 'text', required: true },
  { name: 'nuevaPestana', type: 'checkbox', label: 'Abrir en pestana nueva', defaultValue: false },
]

export const Navegacion: GlobalConfig = {
  slug: 'navegacion',
  label: 'Navegacion',
  admin: { group: 'Configuracion' },
  access: {
    read: () => true,
    update: soloAutenticados,
  },
  fields: [
    {
      name: 'principal',
      type: 'array',
      label: 'Menu principal',
      fields: [
        ...enlace,
        {
          name: 'submenu',
          type: 'array',
          label: 'Submenu',
          fields: enlace,
        },
      ],
    },
    {
      name: 'pie',
      type: 'array',
      label: 'Pie de pagina',
      fields: [
        traducible({ name: 'titulo', type: 'text', required: true }),
        { name: 'enlaces', type: 'array', fields: enlace },
      ],
    },
  ],
}
