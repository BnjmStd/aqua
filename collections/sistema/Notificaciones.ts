import type { CollectionConfig, Where } from 'payload'

import { esPersonalDelPanel, soloAdmins, soloAutenticados } from '../../access'
import { CATEGORIAS } from '../../lib/notificaciones/tipos'

/**
 * NOTIFICACION = un aviso para UN destinatario. Es la bandeja in-app (la
 * campana) y a la vez el registro de que se avisó.
 *
 * No se crea por la API: la escribe `lib/notificaciones/emitir.ts` con la
 * Local API, siempre a partir de un evento del negocio.
 * Ver docs/plan-notificaciones.md.
 */
export const Notificaciones: CollectionConfig = {
  slug: 'notificaciones',
  labels: { singular: 'Notificación', plural: 'Notificaciones' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'destinatario', 'categoria', 'leidaEl', 'createdAt'],
    group: 'Sistema',
    description: 'Avisos enviados. Se generan solos desde los eventos del sitio.',
  },
  access: {
    // El panel ve todo (soporte); una cuenta, solo lo suyo.
    read: ({ req: { user } }) => {
      if (esPersonalDelPanel(user)) return true
      if (!user) return false
      const suyas: Where = {
        and: [
          { 'destinatario.value': { equals: user.id } },
          { 'destinatario.relationTo': { equals: (user as { collection?: string }).collection ?? '' } },
        ],
      }
      return suyas
    },
    // Marcar como leída pasa por Server Actions (Local API), no por la API publica.
    create: () => false,
    update: soloAutenticados,
    delete: soloAdmins,
  },
  fields: [
    {
      name: 'destinatario',
      type: 'relationship',
      relationTo: ['users', 'cuentas'],
      required: true,
      index: true,
    },
    { name: 'titulo', type: 'text', required: true },
    { name: 'cuerpo', type: 'textarea' },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Ruta interna a la que lleva el aviso.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'categoria',
          type: 'select',
          required: true,
          options: CATEGORIAS.map(({ value, label }) => ({ value, label })),
          admin: { width: '50%' },
        },
        { name: 'leidaEl', type: 'date', admin: { width: '50%', readOnly: true } },
      ],
    },
    {
      name: 'receta',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true, description: 'Qué receta la generó (lib/notificaciones/recetas).' },
    },
    {
      name: 'datos',
      type: 'json',
      admin: { readOnly: true, description: 'Datos del evento: con esto el envío reconstruye el contenido.' },
    },
    {
      name: 'claveUnica',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Evita duplicados si un hook corre dos veces.' },
    },
  ],
}
