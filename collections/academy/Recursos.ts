import path from 'path'
import { fileURLToPath } from 'url'

import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { leerRecursos } from '../../access/aula'
import { soloAutenticados } from '../../access'

/**
 * RECURSO = algo del aula de un curso: material, lectura, grabacion o el
 * enlace para entrar a la clase. Es un enlace O un archivo.
 *
 * Privado por defecto, a diferencia de cursos y convocatorias (que son
 * publicas: si el Zoom o las grabaciones fueran campos de la convocatoria,
 * saldrian en /api/convocatorias). Solo lo leen el panel y las cuentas con
 * inscripcion confirmada/asistio — ver access/aula.ts.
 *
 * Los archivos NO van a `media` (publica): esta coleccion es su propio upload
 * y Payload aplica `access.read` al servir cada archivo.
 *
 * Videos: no se suben aca (peso, streaming). Se pega la URL de Vimeo o
 * YouTube y el aula muestra el reproductor.
 */
const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Recursos: CollectionConfig = {
  slug: 'recursos',
  labels: { singular: 'Recurso del curso', plural: 'Recursos de cursos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tipo', 'convocatoria', 'curso', 'sesion', 'visibleDesde'],
    group: 'Academy',
    description:
      'Material, grabaciones y enlaces de clase. Solo los ven los inscritos confirmados del curso.',
  },
  access: {
    read: leerRecursos,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  upload: {
    // Fuera de /public: los archivos solo salen por /api/recursos/file/, con control de acceso.
    staticDir: path.resolve(dirname, '../../recursos'),
    filesRequiredOnCreate: false,
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/msword',
      'application/vnd.ms-excel',
      'application/zip',
      'image/*',
    ],
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      defaultValue: 'material',
      options: [
        { label: 'Material (presentación, guía, planilla)', value: 'material' },
        { label: 'Lectura complementaria', value: 'lectura' },
        { label: 'Grabación (Vimeo / YouTube)', value: 'grabacion' },
        { label: 'Enlace para entrar a la clase (Zoom / Meet)', value: 'enlace_clase' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'alcance',
          type: 'select',
          required: true,
          defaultValue: 'convocatoria',
          options: [
            { label: 'Solo esta convocatoria', value: 'convocatoria' },
            { label: 'Todas las convocatorias del curso', value: 'curso' },
          ],
          admin: {
            width: '50%',
            description: 'El material base del programa conviene cargarlo a nivel curso: aparece en cada edición.',
          },
        },
        {
          name: 'sesion',
          type: 'number',
          min: 1,
          admin: {
            width: '50%',
            description: 'N° de sesión (1, 2, 3…) según el orden de fechas. Vacío = recurso general.',
            condition: (data) => data?.alcance === 'convocatoria',
          },
        },
      ],
    },
    {
      name: 'convocatoria',
      type: 'relationship',
      relationTo: 'convocatorias',
      index: true,
      admin: { condition: (data) => data?.alcance === 'convocatoria' },
    },
    {
      name: 'curso',
      type: 'relationship',
      relationTo: 'cursos',
      index: true,
      admin: { condition: (data) => data?.alcance === 'curso' },
    },
    {
      name: 'enlace',
      type: 'text',
      admin: {
        description:
          'URL de Zoom, Meet, YouTube, Vimeo o Drive. Déjalo vacío si subes un archivo. ' +
          'Grabaciones en YouTube: súbelas como "No listado" y deja activado "Permitir inserción", o no se verán en el aula.',
      },
      validate: (valor: unknown) => {
        if (!valor) return true
        try {
          const url = new URL(String(valor))
          return url.protocol === 'https:' || 'El enlace debe empezar con https://'
        } catch {
          return 'No es un enlace válido.'
        }
      },
    },
    { name: 'descripcion', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'visibleDesde',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Opcional. Ej: publicar la grabación al día siguiente.',
          },
        },
        {
          name: 'visibleHasta',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Opcional. Vacío = disponible siempre.',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, req }) => {
        if (!data) return data
        // En un update parcial (API) `data` trae solo lo que cambia: se completa con el documento guardado.
        const alcance = data.alcance ?? originalDoc?.alcance
        const fallar = (mensaje: string) => {
          throw new APIError(mensaje, 400, null, true)
        }

        // Limpia la relacion que no corresponde al alcance, para que el filtro de acceso no se confunda.
        if (alcance === 'curso') {
          data.convocatoria = null
          data.sesion = null
        } else if (alcance === 'convocatoria') {
          data.curso = null
        }

        const enlace = data.enlace ?? originalDoc?.enlace
        const archivo = data.filename ?? originalDoc?.filename ?? req.file
        if (!enlace && !archivo) fallar('Pega un enlace o sube un archivo.')
        if (alcance === 'curso' && !(data.curso ?? originalDoc?.curso)) fallar('Elige el curso.')
        if (alcance === 'convocatoria' && !(data.convocatoria ?? originalDoc?.convocatoria)) {
          fallar('Elige la convocatoria.')
        }
        return data
      },
    ],
  },
}
