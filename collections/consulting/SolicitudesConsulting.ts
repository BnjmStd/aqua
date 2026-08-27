import type { CollectionConfig } from 'payload'

import { esCuentaAutenticada, esPersonalDelPanel, propiaOStaff, soloAdmins, soloAutenticadosCampo } from '../../access'
import { campoHoneypot } from '../../fields/honeypot'
import { campoHuellaOrigen } from '../../fields/huellaOrigen'
import { limitarEnviosPorIp, rechazarSiHoneypot } from '../../hooks/antiAbuso'

/**
 * SOLICITUD DE CONSULTING = un pedido de contacto de una cuenta, con
 * interes opcional en un servicio puntual. Equivalente a `Inscripciones`
 * pero para Consulting en vez de Academy: mismo patron de "la cuenta crea
 * y lee lo suyo, el panel gestiona el pipeline".
 */
export const SolicitudesConsulting: CollectionConfig = {
  slug: 'solicitudes-consulting',
  labels: { singular: 'Solicitud de consultoría', plural: 'Solicitudes de consultoría' },
  admin: {
    useAsTitle: 'empresa',
    defaultColumns: ['empresa', 'servicio', 'estado', 'createdAt'],
    group: 'Consulting',
    description: 'Pedidos de contacto de cuentas. No se exponen publicamente salvo a su dueño.',
  },
  access: {
    create: esCuentaAutenticada,
    read: propiaOStaff('cuenta'),
    update: esPersonalDelPanel,
    delete: soloAdmins,
  },
  hooks: {
    beforeValidate: [
      rechazarSiHoneypot,
      limitarEnviosPorIp({ maximo: 5, ventanaMinutos: 60 }),
      ({ data, operation, req }) => {
        // La cuenta que crea es la duena, punto — mismo motivo que en
        // Inscripciones: sin esto, una cuenta podria mandar `cuenta: <otro id>`.
        if (operation === 'create' && !esPersonalDelPanel(req.user) && req.user) {
          return { ...data, cuenta: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'cuenta', type: 'relationship', relationTo: 'cuentas', required: true, index: true },
    {
      name: 'servicio',
      type: 'relationship',
      relationTo: 'servicios',
      admin: { description: 'Opcional. Si el interes es en un servicio puntual.' },
    },
    { name: 'empresa', type: 'text', label: 'Empresa donde trabaja' },
    { name: 'mensaje', type: 'textarea', required: true, label: 'Cuéntanos qué necesitas' },
    {
      // EJE OPERATIVO del pipeline comercial. Solo lo mueve el panel.
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'nueva',
      options: [
        { label: 'Nueva', value: 'nueva' },
        { label: 'Contactada', value: 'contactada' },
        { label: 'Cotizando', value: 'cotizando' },
        { label: 'Ganada', value: 'ganada' },
        { label: 'Perdida', value: 'perdida' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notasInternas',
      type: 'textarea',
      access: { read: soloAutenticadosCampo },
      admin: { position: 'sidebar' },
    },
    campoHoneypot,
    campoHuellaOrigen,
  ],
}
