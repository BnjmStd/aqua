import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { grupoSeo } from '../../fields/seo'
import { campoSlug } from '../../fields/slug'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/**
 * CURSO = el producto, estable en el tiempo.
 *
 * Programa, objetivos, horas y publico objetivo viven aca y se escriben UNA vez.
 * Las fechas, el precio, el relator y el cupo NO van aca: cambian en cada
 * dictacion y viven en `convocatorias`.
 */
export const Cursos: CollectionConfig = {
  slug: 'cursos',
  labels: { singular: 'Curso', plural: 'Cursos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'codigo', 'estadoProducto', 'duracionHoras', '_status'],
    group: 'Academy',
    description: 'El programa del curso. Las fechas y precios van en Convocatorias.',
  },
  access: {
    read: publicadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  versions: versionesConBorrador,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Programa',
          fields: [
            traducible({ name: 'titulo', type: 'text', required: true }),
            traducible({
              name: 'resumen',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: { description: 'Un parrafo. Se usa en listados y tarjetas.' },
            }),
            traducible({ name: 'descripcion', type: 'richText' }),
            traducible({
              name: 'dirigidoA',
              type: 'textarea',
              label: 'Dirigido a',
              admin: { description: 'Perfil del participante ideal.' },
            }),
            traducible({ name: 'requisitos', type: 'textarea', label: 'Requisitos previos' }),
            traducible({
              name: 'modulos',
              type: 'array',
              label: 'Contenidos / modulos',
              fields: [
                { name: 'titulo', type: 'text', required: true },
                { name: 'detalle', type: 'textarea' },
                { name: 'horas', type: 'number', admin: { step: 0.5 } },
                {
                  name: 'objetivos',
                  type: 'relationship',
                  relationTo: 'objetivos',
                  hasMany: true,
                  // Solo objetivos de ESTE curso (nunca de otro): sin esto,
                  // el selector mostraria los objetivos de las 30 y tantas
                  // convocatorias de todos los cursos del catalogo.
                  filterOptions: ({ id }) => (id ? { curso: { equals: id } } : false),
                  admin: {
                    description:
                      'Que objetivos de aprendizaje cubre este modulo. Puede ser mas de uno. Guarda el curso primero si la lista sale vacia.',
                  },
                },
              ],
            }),
          ],
        },
        {
          label: 'Ficha tecnica',
          fields: [
            {
              name: 'duracionHoras',
              type: 'number',
              label: 'Duracion total (horas cronologicas)',
              required: true,
              admin: { step: 0.5 },
            },
            {
              name: 'nivel',
              type: 'select',
              options: [
                { label: 'Introductorio', value: 'introductorio' },
                { label: 'Intermedio', value: 'intermedio' },
                { label: 'Avanzado', value: 'avanzado' },
              ],
            },
            {
              name: 'modalidadesDisponibles',
              type: 'select',
              hasMany: true,
              label: 'Modalidades en que se puede dictar',
              options: [
                { label: 'Presencial', value: 'presencial' },
                { label: 'Online en vivo', value: 'online_vivo' },
                { label: 'E-learning asincronico', value: 'elearning' },
                { label: 'Mixta / blended', value: 'mixta' },
                { label: 'Cerrado en empresa', value: 'incompany' },
              ],
            },
            traducible({ name: 'certificacion', type: 'textarea', label: 'Certificacion que entrega' }),
            traducible({ name: 'materialIncluido', type: 'textarea', label: 'Material incluido' }),
            {
              name: 'sence',
              type: 'group',
              label: 'Franquicia SENCE',
              admin: {
                description: 'Solo si el curso esta acreditado ante SENCE. Aplica a Chile.',
              },
              fields: [
                { name: 'acreditado', type: 'checkbox', label: 'Curso acreditado SENCE', defaultValue: false },
                {
                  name: 'codigoSence',
                  type: 'text',
                  label: 'Codigo SENCE',
                  admin: { condition: (_, siblingData) => Boolean(siblingData?.acreditado) },
                },
                {
                  name: 'horasSence',
                  type: 'number',
                  label: 'Horas reconocidas',
                  admin: { condition: (_, siblingData) => Boolean(siblingData?.acreditado) },
                },
              ],
            },
          ],
        },
      ],
    },
    grupoSeo,
    campoSlug(),
    {
      name: 'codigo',
      type: 'text',
      label: 'Codigo interno',
      unique: true,
      admin: { position: 'sidebar', description: 'Ej: ACAD-001. Para uso administrativo.' },
    },
    {
      // EJE DE CICLO DE VIDA — distinto de _status (publicado/borrador).
      // Un curso puede estar publicado en el sitio y discontinuado como producto:
      // se mantiene visible por SEO, pero ya no se le abren convocatorias.
      name: 'estadoProducto',
      type: 'select',
      required: true,
      defaultValue: 'en_desarrollo',
      options: [
        { label: 'En desarrollo', value: 'en_desarrollo' },
        { label: 'Activo', value: 'activo' },
        { label: 'Discontinuado', value: 'discontinuado' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Estado comercial del producto. No confundir con publicado/borrador.',
      },
    },
    { name: 'imagenDestacada', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    {
      name: 'categorias',
      type: 'relationship',
      relationTo: 'categorias',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'relatoresHabituales',
      type: 'relationship',
      relationTo: 'personas',
      hasMany: true,
      filterOptions: { roles: { contains: 'relator' } },
      admin: { position: 'sidebar', description: 'Quien suele dictarlo. El relator de cada fecha se define en la convocatoria.' },
    },
  ],
}
