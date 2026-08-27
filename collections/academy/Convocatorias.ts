import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados, soloAutenticadosCampo } from '../../access'
import { campoSlug } from '../../fields/slug'
import { versionesConBorrador } from '../../lib/versiones'

/**
 * CONVOCATORIA = una dictacion concreta del curso.
 *
 * Un mismo curso se dicta en marzo, en agosto y el ano siguiente, cada vez con
 * fecha, precio, relator, modalidad y cupo distintos. Separarlo del curso es lo
 * que permite "proximas fechas" sin duplicar el programa en cada edicion.
 */
export const Convocatorias: CollectionConfig = {
  slug: 'convocatorias',
  labels: { singular: 'Convocatoria', plural: 'Convocatorias' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'fechaInicio', 'modalidad', 'estadoConvocatoria', '_status'],
    group: 'Academy',
    description: 'Cada fecha en que se dicta un curso.',
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
      name: 'curso',
      type: 'relationship',
      relationTo: 'cursos',
      required: true,
      admin: { description: 'El programa se hereda de aqui. No lo repitas.' },
    },
    {
      name: 'titulo',
      type: 'text',
      required: true,
      admin: { description: 'Ej: "Auditoria de procesos acuicolas — Puerto Montt, marzo 2026".' },
    },
    campoSlug(),
    {
      type: 'row',
      fields: [
        { name: 'fechaInicio', type: 'date', required: true, admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'fechaTermino', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'sesiones',
      type: 'array',
      label: 'Sesiones (opcional)',
      admin: { description: 'Solo si el curso se dicta en varias jornadas separadas.' },
      fields: [
        { name: 'fecha', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'duracionHoras', type: 'number', admin: { step: 0.5 } },
        { name: 'tema', type: 'text' },
      ],
    },
    {
      name: 'modalidad',
      type: 'select',
      required: true,
      options: [
        { label: 'Presencial', value: 'presencial' },
        { label: 'Online en vivo', value: 'online_vivo' },
        { label: 'E-learning asincronico', value: 'elearning' },
        { label: 'Mixta / blended', value: 'mixta' },
        { label: 'Cerrado en empresa', value: 'incompany' },
      ],
    },
    {
      name: 'lugar',
      type: 'group',
      fields: [
        { name: 'ciudad', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'direccion', type: 'text' },
        { name: 'sede', type: 'text', label: 'Nombre del recinto' },
        { name: 'plataforma', type: 'text', label: 'Plataforma (si es online)' },
      ],
    },
    {
      name: 'relatores',
      type: 'relationship',
      relationTo: 'personas',
      hasMany: true,
      filterOptions: { roles: { contains: 'relator' } },
    },
    {
      name: 'valor',
      type: 'group',
      label: 'Valor e inscripcion',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'monto', type: 'number', label: 'Valor por participante', admin: { width: '50%' } },
            {
              name: 'moneda',
              type: 'select',
              defaultValue: 'CLP',
              options: [
                { label: 'Peso chileno (CLP)', value: 'CLP' },
                { label: 'Unidad de Fomento (UF)', value: 'UF' },
                { label: 'Dolar (USD)', value: 'USD' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'montoEsNeto',
          type: 'checkbox',
          label: 'El monto es neto (sin IVA)',
          defaultValue: true,
          admin: { description: 'En B2B chileno lo habitual es cotizar neto y agregar IVA.' },
        },
        { name: 'aplicaFranquiciaSence', type: 'checkbox', label: 'Aplica franquicia SENCE', defaultValue: false },
        {
          type: 'row',
          fields: [
            { name: 'cupoMaximo', type: 'number', required: true, admin: { width: '50%' } },
            { name: 'cupoMinimo', type: 'number', label: 'Cupo minimo para dictar', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'inscripcionDesde', type: 'date', admin: { width: '50%' } },
            { name: 'inscripcionHasta', type: 'date', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      /**
       * Campo VIRTUAL: no se guarda en la base, se calcula al leer.
       * Se omite en listados (`findMany`) a proposito: contar por documento
       * en una lista de 20 convocatorias serian 20 queries extra (N+1).
       * En la ficha individual, que es donde importa, si se calcula.
       */
      name: 'inscritosConfirmados',
      type: 'number',
      virtual: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Calculado desde Inscripciones. Visible al abrir la convocatoria.',
      },
      hooks: {
        afterRead: [
          async ({ data, findMany, req }) => {
            if (findMany || !data?.id) return undefined
            const { totalDocs } = await req.payload.count({
              collection: 'inscripciones',
              req,
              where: {
                convocatoria: { equals: data.id },
                estadoInscripcion: { in: ['confirmada', 'asistio'] },
              },
            })
            return totalDocs
          },
        ],
      },
    },
    {
      // EJE OPERATIVO — independiente de publicado/borrador.
      // Una convocatoria cancelada sigue publicada (para avisar), pero no admite inscripciones.
      name: 'estadoConvocatoria',
      type: 'select',
      required: true,
      defaultValue: 'planificada',
      options: [
        { label: 'Planificada', value: 'planificada' },
        { label: 'Inscripciones abiertas', value: 'inscripciones_abiertas' },
        { label: 'Cupo completo', value: 'cupo_completo' },
        { label: 'En curso', value: 'en_curso' },
        { label: 'Finalizada', value: 'finalizada' },
        { label: 'Cancelada', value: 'cancelada' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Estado operativo. Solo "inscripciones abiertas" admite nuevas inscripciones.',
      },
    },
    {
      name: 'notasInternas',
      type: 'textarea',
      // Sin este access.read las notas viajaban en la API publica de toda
      // convocatoria publicada: margenes, telefonos y acuerdos comerciales.
      access: { read: soloAutenticadosCampo },
      admin: { position: 'sidebar' },
    },
  ],
}
