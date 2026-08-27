import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { esCuentaAutenticada, esPersonalDelPanel, propiaOStaff, soloAdmins, soloAutenticados } from '../../access'
import { campoHoneypot } from '../../fields/honeypot'
import { campoHuellaOrigen } from '../../fields/huellaOrigen'
import {
  forzarValoresSeguros,
  limitarEnviosPorIp,
  rechazarSiHoneypot,
} from '../../hooks/antiAbuso'
import { esRutValido } from '../../lib/rut'

/**
 * INSCRIPCION = una persona anotada en una convocatoria, hecha desde una
 * `Cuenta` (auth publica, ver collections/Cuentas.ts).
 *
 * `cuenta` (quien gestiona/paga) y `participante*` (quien asiste) se
 * mantienen separados a proposito: en inscripciones B2B es comun que una
 * jefatura inscriba a alguien de su equipo.
 *
 * Datos personales: `read` NUNCA es publico mas alla de la propia cuenta.
 * El formulario del sitio solo puede CREAR, y solo logueado; nadie mas
 * puede leer, listar ni modificar inscripciones ajenas.
 *
 * El bloque `pago` esta modelado completo pero SIN integracion de pasarela.
 * Cuando se conecte Webpay/Flow/Stripe, el webhook solo tiene que escribir
 * `estadoPago`, `montoPagado`, `fechaPago` y `referenciaExterna`.
 * El esquema no cambia: por eso conviene definirlo ahora y no despues.
 */
export const Inscripciones: CollectionConfig = {
  slug: 'inscripciones',
  labels: { singular: 'Inscripcion', plural: 'Inscripciones' },
  admin: {
    useAsTitle: 'participanteNombre',
    defaultColumns: ['participanteNombre', 'convocatoria', 'estadoInscripcion', 'pago', 'createdAt'],
    group: 'Academy',
    description: 'Datos personales. No se exponen publicamente.',
  },
  access: {
    // Cada cuenta ve solo sus propias inscripciones (para "mi cuenta"); el panel las ve todas.
    read: propiaOStaff('cuenta'),
    // Inscribirse exige sesion de cuenta (no invitado). Protegido ademas
    // con rate limit y honeypot en hooks/antiAbuso.ts.
    create: esCuentaAutenticada,
    update: soloAutenticados,
    delete: soloAdmins,
  },
  hooks: {
    beforeValidate: [
      rechazarSiHoneypot,
      /**
       * El publico no decide su propio estado ni el de su pago.
       * Sin esto, un POST directo a la API podia inscribirse como
       * "confirmada" y con el pago en "pagado": matricula gratis.
       */
      forzarValoresSeguros({
        estadoInscripcion: 'pendiente',
        pago: { estadoPago: 'pendiente' },
        origen: 'web',
      }),
      limitarEnviosPorIp({ maximo: 5, ventanaMinutos: 60 }),
      ({ data, operation, req }) => {
        // La cuenta que crea es la duena, punto. Sin esto, una cuenta
        // podria mandar `cuenta: <id de otra persona>` en el POST y
        // "inscribir" a nombre de otra cuenta.
        if (operation === 'create' && !esPersonalDelPanel(req.user) && req.user) {
          return { ...data, cuenta: req.user.id }
        }
        return data
      },
      async ({ data, operation, req }) => {
        // Solo se valida el envio publico. Un administrador puede inscribir
        // a mano en cualquier estado (ej: cerrar un cupo por telefono).
        if (operation !== 'create' || esPersonalDelPanel(req.user) || !data?.convocatoria) return data

        const convocatoria = await req.payload.findByID({
          collection: 'convocatorias',
          id: String(data.convocatoria),
          depth: 0,
          req,
        })

        if (convocatoria?.estadoConvocatoria !== 'inscripciones_abiertas') {
          throw new APIError('Esta convocatoria no tiene inscripciones abiertas.', 400, null, true)
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'cuenta',
      type: 'relationship',
      relationTo: 'cuentas',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Quien gestiona la inscripcion. Puede no ser quien asiste (ver pestaña Participante).',
      },
    },
    {
      name: 'convocatoria',
      type: 'relationship',
      relationTo: 'convocatorias',
      required: true,
      index: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Participante',
          fields: [
            { name: 'participanteNombre', type: 'text', label: 'Nombre completo', required: true },
            { name: 'participanteEmail', type: 'email', label: 'Email', required: true, index: true },
            { name: 'participanteTelefono', type: 'text', label: 'Telefono' },
            {
              name: 'participanteRut',
              type: 'text',
              label: 'RUT',
              validate: (valor: unknown) => {
                if (!valor) return true // opcional
                if (typeof valor !== 'string') return 'RUT invalido.'
                return esRutValido(valor) || 'El RUT no es valido (revisa el digito verificador).'
              },
              admin: { description: 'Necesario si requiere factura o franquicia SENCE.' },
            },
            { name: 'participanteCargo', type: 'text', label: 'Cargo' },
            { name: 'participanteEmpresa', type: 'text', label: 'Empresa donde trabaja' },
          ],
        },
        {
          label: 'Pago',
          description: 'Modelo de datos listo. La pasarela se integra despues sin cambiar el esquema.',
          fields: [
            {
              name: 'pago',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'estadoPago',
                  type: 'select',
                  required: true,
                  defaultValue: 'pendiente',
                  options: [
                    { label: 'Pendiente', value: 'pendiente' },
                    { label: 'Pagado', value: 'pagado' },
                    { label: 'Pago parcial', value: 'parcial' },
                    { label: 'Reembolsado', value: 'reembolsado' },
                    { label: 'Sin costo', value: 'sin_costo' },
                  ],
                },
                {
                  name: 'medioPago',
                  type: 'select',
                  options: [
                    { label: 'Transferencia bancaria', value: 'transferencia' },
                    { label: 'Webpay', value: 'webpay' },
                    { label: 'Flow', value: 'flow' },
                    { label: 'Tarjeta (Stripe)', value: 'stripe' },
                    { label: 'Orden de compra', value: 'orden_compra' },
                    { label: 'Franquicia SENCE', value: 'sence' },
                    { label: 'Otro', value: 'otro' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'montoPagado', type: 'number', admin: { width: '50%' } },
                    {
                      name: 'moneda',
                      type: 'select',
                      defaultValue: 'CLP',
                      options: [
                        { label: 'CLP', value: 'CLP' },
                        { label: 'UF', value: 'UF' },
                        { label: 'USD', value: 'USD' },
                      ],
                      admin: { width: '50%' },
                    },
                  ],
                },
                { name: 'fechaPago', type: 'date' },
                {
                  name: 'referenciaExterna',
                  type: 'text',
                  label: 'ID de transaccion',
                  index: true,
                  admin: {
                    description: 'Lo escribira el webhook de la pasarela. Indexado para conciliar pagos.',
                  },
                },
              ],
            },
            {
              name: 'requiereFactura',
              type: 'checkbox',
              label: 'Requiere factura',
              defaultValue: false,
            },
            {
              name: 'facturacion',
              type: 'group',
              label: 'Datos de facturacion',
              admin: {
                condition: (data) => Boolean(data?.requiereFactura),
              },
              fields: [
                { name: 'razonSocial', type: 'text' },
                {
                  name: 'rut',
                  type: 'text',
                  label: 'RUT de la empresa',
                  validate: (valor: unknown) => {
                    if (!valor) return true
                    if (typeof valor !== 'string') return 'RUT invalido.'
                    return esRutValido(valor) || 'El RUT no es valido.'
                  },
                },
                { name: 'giro', type: 'text' },
                { name: 'direccion', type: 'text' },
                { name: 'comuna', type: 'text' },
                { name: 'emailFacturacion', type: 'email', label: 'Email para envio de la factura' },
                { name: 'ordenCompra', type: 'text', label: 'N de orden de compra' },
              ],
            },
          ],
        },
      ],
    },
    {
      // EJE OPERATIVO de la inscripcion. Nada que ver con publicado/borrador
      // (esta coleccion ni siquiera tiene borradores: es dato transaccional).
      name: 'estadoInscripcion',
      type: 'select',
      required: true,
      defaultValue: 'pendiente',
      options: [
        { label: 'Pendiente de confirmacion', value: 'pendiente' },
        { label: 'Confirmada', value: 'confirmada' },
        { label: 'En lista de espera', value: 'lista_espera' },
        { label: 'Asistio', value: 'asistio' },
        { label: 'No asistio', value: 'no_asistio' },
        { label: 'Cancelada', value: 'cancelada' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'origen',
      type: 'select',
      options: [
        { label: 'Formulario del sitio', value: 'web' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Newsletter', value: 'newsletter' },
        { label: 'Referido', value: 'referido' },
        { label: 'Contacto directo', value: 'directo' },
      ],
      defaultValue: 'web',
      admin: { position: 'sidebar' },
    },
    { name: 'notasInternas', type: 'textarea', admin: { position: 'sidebar' } },
    campoHoneypot,
    campoHuellaOrigen,
  ],
}
