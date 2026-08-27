import type { CollectionConfig } from 'payload'

import { esPersonalDelPanel, soloAdmins } from '../access'
import { esRutValido } from '../lib/rut'

/**
 * CUENTA = auth publica, de quien se inscribe a cursos o pide consultoria.
 *
 * Deliberadamente separada de `Users` (staff del panel): son audiencias
 * distintas con distintos permisos. Payload comparte una sola cookie entre
 * cualquier coleccion `auth: true` — por eso `access/index.ts` distingue
 * "personal del panel" de "cuenta" mirando `user.collection`, no solo si
 * hay sesion. Ver el comentario ahi para el detalle.
 */
export const Cuentas: CollectionConfig = {
  slug: 'cuentas',
  labels: { singular: 'Cuenta', plural: 'Cuentas' },
  admin: {
    useAsTitle: 'nombre',
    // No es contenido editorial: no aparece como seccion del panel.
    hidden: true,
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  access: {
    // Auto-registro publico.
    create: () => true,
    // Cada cuenta solo ve/edita su propio documento; el panel ve todas.
    read: ({ req: { user }, id }) => {
      if (esPersonalDelPanel(user)) return true
      if (!user) return false
      if (id) return user.id === id
      return { id: { equals: user.id } }
    },
    update: ({ req: { user }, id }) => {
      if (esPersonalDelPanel(user)) return true
      if (!user) return false
      if (id) return user.id === id
      return { id: { equals: user.id } }
    },
    delete: soloAdmins,
  },
  fields: [
    // email y password los agrega Payload solo, por `auth: true`.
    { name: 'nombre', type: 'text', required: true, label: 'Nombre completo' },
    { name: 'telefono', type: 'text' },
    {
      name: 'rut',
      type: 'text',
      label: 'RUT',
      validate: (valor: unknown) => {
        if (!valor) return true // opcional
        if (typeof valor !== 'string') return 'RUT invalido.'
        return esRutValido(valor) || 'El RUT no es valido (revisa el digito verificador).'
      },
    },
  ],
}
