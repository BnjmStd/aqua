import type { CollectionConfig } from 'payload'

import { soloAutenticados } from '../access'
import { campoSlug } from '../fields/slug'
import { campoUnidades } from '../fields/unidad'
import { traducible } from '../lib/localizacion'

/**
 * Taxonomia unica y transversal. Una sola coleccion sirve a articulos,
 * cursos, casos y proyectos: asi "Acuicultura" es el mismo termino en todo
 * el sitio y no tres etiquetas parecidas que no se cruzan.
 */
export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoria', plural: 'Categorias' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'unidades'],
    group: 'Configuracion',
  },
  access: {
    read: () => true,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  fields: [
    traducible({ name: 'titulo', type: 'text', required: true }),
    campoSlug(),
    traducible({ name: 'descripcion', type: 'textarea' }),
    campoUnidades(),
  ],
}
