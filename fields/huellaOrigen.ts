import type { Field } from 'payload'

/**
 * Huella HMAC de la IP de origen, usada para limitar envios repetidos.
 * No es reversible y nunca sale por la API.
 */
export const campoHuellaOrigen: Field = {
  name: 'huellaOrigen',
  type: 'text',
  index: true,
  admin: { hidden: true },
  access: {
    read: () => false,
    update: () => false,
  },
}
