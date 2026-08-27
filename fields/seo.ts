import type { Field } from 'payload'

import { traducible } from '../lib/localizacion'

/**
 * SEO por documento. Deliberadamente minimo: si esta vacio, el frontend
 * cae al titulo y resumen del documento. Un editor no deberia tener que
 * llenar esto para publicar.
 */
export const grupoSeo: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    description: 'Opcional. Si lo dejas vacio se usa el titulo y el resumen del documento.',
  },
  fields: [
    traducible({
      name: 'titulo',
      type: 'text',
      label: 'Titulo para buscadores',
      maxLength: 60,
      admin: { description: 'Ideal hasta 60 caracteres.' },
    }),
    traducible({
      name: 'descripcion',
      type: 'textarea',
      label: 'Meta descripcion',
      maxLength: 160,
      admin: { description: 'Ideal hasta 160 caracteres.' },
    }),
    {
      name: 'imagen',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen para compartir (Open Graph)',
    },
    {
      name: 'noIndexar',
      type: 'checkbox',
      label: 'Ocultar de los buscadores',
      defaultValue: false,
    },
  ],
}
