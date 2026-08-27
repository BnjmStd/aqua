import type { Field } from 'payload'

/**
 * Campo trampa para bots.
 *
 * El formulario lo renderiza oculto por CSS y una persona nunca lo completa.
 * Los bots que rellenan todos los inputs del DOM si. Si viene con contenido,
 * el envio se rechaza.
 *
 * No se guarda nunca (`virtual: true`) y no sale por la API.
 */
export const campoHoneypot: Field = {
  name: 'sitioWebContacto',
  type: 'text',
  virtual: true,
  admin: { hidden: true },
  access: {
    read: () => false,
  },
}
