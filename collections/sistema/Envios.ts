import type { CollectionConfig } from 'payload'

import { soloAdmins, soloAutenticados } from '../../access'

/**
 * ENVIO = la entrega de una o varias notificaciones por un canal externo
 * (correo, WhatsApp, SMS). In-app no genera envío: la notificación ya es el
 * mensaje.
 *
 * Es el registro para responder "¿le llegó el correo?" y para ver qué falló.
 * Lo escribe la tarea `enviarNotificacion` (jobs/enviar-notificacion.ts).
 */
export const Envios: CollectionConfig = {
  slug: 'envios',
  labels: { singular: 'Envío', plural: 'Envíos' },
  admin: {
    useAsTitle: 'destino',
    defaultColumns: ['destino', 'canal', 'estado', 'intentos', 'createdAt'],
    group: 'Sistema',
    description: 'Entregas por correo, WhatsApp o SMS. Solo lectura: las genera el sistema.',
  },
  access: {
    read: soloAutenticados,
    create: () => false,
    update: () => false,
    delete: soloAdmins,
  },
  fields: [
    {
      name: 'notificaciones',
      type: 'relationship',
      relationTo: 'notificaciones',
      hasMany: true,
      required: true,
      admin: { description: 'Más de una cuando el envío agrupa avisos (resumen).' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'canal',
          type: 'select',
          required: true,
          options: [
            { label: 'Correo', value: 'email' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'SMS', value: 'sms' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'estado',
          type: 'select',
          required: true,
          defaultValue: 'pendiente',
          options: [
            { label: 'Pendiente', value: 'pendiente' },
            { label: 'Enviado', value: 'enviado' },
            { label: 'Falló', value: 'fallido' },
            { label: 'Omitido', value: 'omitido' },
          ],
          admin: { width: '33%' },
        },
        { name: 'intentos', type: 'number', defaultValue: 0, admin: { width: '33%' } },
      ],
    },
    {
      name: 'destino',
      type: 'text',
      required: true,
      admin: { description: 'Correo o teléfono al que se envió, tal como estaba en ese momento.' },
    },
    { name: 'enviadoEl', type: 'date' },
    {
      name: 'claveAgrupacion',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Los avisos con la misma clave se juntan en un solo mensaje mientras la ventana sigue abierta.',
      },
    },
    { name: 'idProveedor', type: 'text', admin: { description: 'Id de Resend / Meta / Twilio, para rastrear rebotes.' } },
    { name: 'ultimoError', type: 'textarea' },
    { name: 'motivoOmision', type: 'text' },
  ],
}
