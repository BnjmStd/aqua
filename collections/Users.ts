import type { CollectionConfig } from 'payload'

import { puedeEntrarAlPanel, soloAdmins, soloAdminsCampo, soloAutenticados } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'email', 'rol'],
    group: 'Configuracion',
  },
  auth: {
    /**
     * Bloqueo por intentos fallidos: tras 5 errores la cuenta queda
     * bloqueada 10 minutos. Es lo que frena el rastrillado de contrasenas.
     */
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      /**
       * Payload calcula `secure = secureArg || sameSite === 'None'`, asi que
       * sin declararlo la cookie de sesion NO lleva el flag Secure y el token
       * podria viajar por HTTP en claro. En desarrollo queda en false porque
       * localhost no es HTTPS.
       */
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  access: {
    read: soloAutenticados,
    create: soloAdmins,
    update: soloAdmins,
    delete: soloAdmins,
    admin: puedeEntrarAlPanel,
  },
  fields: [
    // El campo email y la contrasena los agrega Payload por `auth: true`.
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'rol',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor de contenido', value: 'editor' },
      ],
      // Un editor no puede auto-promoverse a administrador.
      access: {
        create: soloAdminsCampo,
        update: soloAdminsCampo,
      },
      admin: {
        description: 'El editor gestiona contenido pero no usuarios ni configuracion del sitio.',
      },
    },
  ],
}
