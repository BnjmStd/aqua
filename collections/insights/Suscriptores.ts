import type { CollectionConfig } from 'payload'

import { soloAdmins, soloAutenticados } from '../../access'
import { campoHoneypot } from '../../fields/honeypot'
import { campoHuellaOrigen } from '../../fields/huellaOrigen'
import { UNIDADES } from '../../fields/unidad'
import {
  forzarValoresSeguros,
  limitarEnviosPorIp,
  rechazarSiHoneypot,
} from '../../hooks/antiAbuso'

/**
 * SUSCRIPTORES — Payload es la fuente de verdad.
 *
 * Datos personales: `read` nunca es publico.
 *
 * El registro de consentimiento (fecha, IP y el TEXTO EXACTO que la persona
 * acepto) no es burocracia: ante un reclamo por Ley 19.628, "tengo su email"
 * no prueba nada; "aceto este texto, este dia, desde esta IP" si.
 * Por eso tambien se versiona el texto aceptado: si manana cambias la
 * politica de privacidad, los consentimientos viejos siguen siendo auditables.
 */
export const Suscriptores: CollectionConfig = {
  slug: 'suscriptores',
  labels: { singular: 'Suscriptor', plural: 'Suscriptores' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'nombre', 'estado', 'createdAt'],
    group: 'Insights',
    description: 'Datos personales. No se exponen publicamente.',
  },
  access: {
    read: soloAutenticados,
    create: () => true, // el formulario publico se suscribe
    update: soloAutenticados,
    delete: soloAdmins,
  },
  hooks: {
    beforeValidate: [
      rechazarSiHoneypot,
      /**
       * Nadie se auto-confirma. Sin esto, un POST directo podia darse de
       * alta como "confirmado" y saltarse el doble opt-in — que es
       * justamente lo que respalda el consentimiento.
       */
      forzarValoresSeguros({
        estado: 'pendiente_confirmacion',
        origen: 'web',
        fechaConfirmacion: null,
      }),
      limitarEnviosPorIp({ maximo: 3, ventanaMinutos: 60 }),
    ],
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'nombre', type: 'text' },
    { name: 'empresa', type: 'text' },
    { name: 'cargo', type: 'text' },
    {
      /**
       * Doble opt-in. Nadie recibe correo hasta estar en `confirmado`.
       * `rebotado` lo escribe el proveedor de envio via webhook: seguir
       * mandando a direcciones que rebotan destruye la reputacion del dominio.
       */
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'pendiente_confirmacion',
      options: [
        { label: 'Pendiente de confirmar', value: 'pendiente_confirmacion' },
        { label: 'Confirmado', value: 'confirmado' },
        { label: 'Dado de baja', value: 'baja' },
        { label: 'Rebotado', value: 'rebotado' },
      ],
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'intereses',
      type: 'select',
      hasMany: true,
      options: [...UNIDADES],
      admin: { position: 'sidebar', description: 'Permite segmentar los envios.' },
    },
    {
      name: 'consentimiento',
      type: 'group',
      label: 'Registro de consentimiento',
      admin: { description: 'Prueba de aceptacion. No editar a mano salvo correccion justificada.' },
      fields: [
        { name: 'aceptado', type: 'checkbox', defaultValue: false },
        { name: 'fechaAceptacion', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'ip', type: 'text', label: 'IP de origen' },
        {
          name: 'textoAceptado',
          type: 'textarea',
          label: 'Texto exacto que acepto',
          admin: { description: 'Se guarda una copia literal, no una referencia.' },
        },
        { name: 'versionPolitica', type: 'text', label: 'Version de la politica de privacidad' },
      ],
    },
    {
      name: 'tokenConfirmacion',
      type: 'text',
      index: true,
      admin: { hidden: true },
      access: { read: () => false }, // nunca sale por la API
    },
    { name: 'fechaConfirmacion', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    { name: 'fechaBaja', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'origen',
      type: 'select',
      options: [
        { label: 'Formulario del sitio', value: 'web' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Evento', value: 'evento' },
        { label: 'Carga manual', value: 'manual' },
      ],
      defaultValue: 'web',
      admin: { position: 'sidebar' },
    },
    campoHoneypot,
    campoHuellaOrigen,
  ],
}
