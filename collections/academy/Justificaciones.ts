import path from 'path'
import { fileURLToPath } from 'url'

import type { CollectionConfig } from 'payload'

import { propiaOStaff, soloAdmins, soloAutenticados } from '../../access'
import { emitirEvento } from '../../lib/notificaciones/emitir'
import { MOTIVOS_JUSTIFICACION, TIPOS_RESPALDO } from '../../lib/justificaciones'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * JUSTIFICACION = un alumno avisa por que no figura presente en una sesion:
 * hubo un error en la lista ("si asisti") o falto por salud / fuerza mayor.
 * Puede adjuntar un respaldo (certificado medico, constancia).
 *
 * El equipo la revisa aca y decide el `resultado`:
 * - `presente`: la sesion cuenta como asistida (error de registro).
 * - `justificada`: no cuenta en contra; se excluye del % de asistencia.
 *
 * No se escribe nada en la lista de asistencia: el aula superpone la
 * justificacion aprobada al calcular. Asi la lista sigue siendo lo que marco
 * el relator y la correccion queda trazable.
 *
 * El alumno crea por la Server Action del aula (valida dueño, sesion, plazo),
 * nunca por la API: `create` publico esta cerrado.
 */
export const Justificaciones: CollectionConfig = {
  slug: 'justificaciones',
  labels: { singular: 'Justificación de inasistencia', plural: 'Justificaciones de inasistencia' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'motivo', 'estado', 'createdAt'],
    group: 'Academy',
    description:
      'Avisos de alumnos que figuran ausentes. Revisa las pendientes: el resultado se refleja al tiro en su aula.',
  },
  access: {
    // Cada cuenta lee solo las suyas (y sus archivos); el panel, todas.
    read: propiaOStaff('cuenta'),
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAdmins,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../justificaciones'),
    filesRequiredOnCreate: false,
    mimeTypes: TIPOS_RESPALDO,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'create') {
          await emitirEvento('justificacion.creada', { justificacionId: doc.id }, { req })
          return
        }
        // Solo cuando el equipo la resuelve (o cambia su resolucion).
        const cambio = doc.estado !== previousDoc?.estado || doc.resultado !== previousDoc?.resultado
        if (doc.estado !== 'pendiente' && cambio) {
          await emitirEvento(
            'justificacion.revisada',
            { justificacionId: doc.id, estado: doc.estado, resultado: doc.resultado ?? null },
            { req },
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          async ({ siblingData, req }) => {
            if (!siblingData.inscripcion) return undefined
            const inscripcion = await req.payload.findByID({
              collection: 'inscripciones',
              id: String(siblingData.inscripcion),
              depth: 1,
              req,
            })
            const convocatoria = typeof inscripcion?.convocatoria === 'object' ? inscripcion.convocatoria.titulo : ''
            return `${inscripcion?.participanteNombre ?? 'Alumno'} · ${convocatoria} · sesión ${siblingData.sesion}`
          },
        ],
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'estado',
          type: 'select',
          required: true,
          defaultValue: 'pendiente',
          options: [
            { label: 'Pendiente de revisión', value: 'pendiente' },
            { label: 'Aprobada', value: 'aprobada' },
            { label: 'Rechazada', value: 'rechazada' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'resultado',
          type: 'select',
          options: [
            { label: 'Cuenta como presente (error en la lista)', value: 'presente' },
            { label: 'Inasistencia justificada (no cuenta en el %)', value: 'justificada' },
          ],
          admin: {
            width: '50%',
            condition: (data) => data?.estado === 'aprobada',
            description: 'Obligatorio al aprobar.',
          },
          validate: (valor: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
            siblingData?.estado !== 'aprobada' || Boolean(valor) || 'Elige cómo cuenta la sesión al aprobar.',
        },
      ],
    },
    {
      name: 'respuesta',
      type: 'textarea',
      label: 'Respuesta para el alumno',
      admin: {
        description: 'La ve en su aula. Obligatoria al rechazar: explica por qué y qué puede hacer.',
        condition: (data) => data?.estado !== 'pendiente',
      },
      validate: (valor: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.estado !== 'rechazada' || Boolean(valor) || 'Explica al alumno por qué se rechaza.',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'motivo',
          type: 'select',
          required: true,
          options: MOTIVOS_JUSTIFICACION.map(({ value, label }) => ({ value, label })),
          admin: { width: '50%', readOnly: true },
        },
        {
          name: 'sesion',
          type: 'number',
          required: true,
          min: 1,
          admin: { width: '50%', readOnly: true },
        },
      ],
    },
    { name: 'detalle', type: 'textarea', required: true, admin: { readOnly: true } },
    {
      name: 'revisadaEl',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', condition: (data) => Boolean(data?.revisadaEl) },
      hooks: {
        beforeChange: [
          ({ value, siblingData, originalDoc }) => {
            const cambioEstado = siblingData.estado && siblingData.estado !== originalDoc?.estado
            if (cambioEstado && siblingData.estado !== 'pendiente') return new Date().toISOString()
            return value
          },
        ],
      },
    },
    {
      name: 'inscripcion',
      type: 'relationship',
      relationTo: 'inscripciones',
      required: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'convocatoria',
      type: 'relationship',
      relationTo: 'convocatorias',
      required: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'cuenta',
      type: 'relationship',
      relationTo: 'cuentas',
      required: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
