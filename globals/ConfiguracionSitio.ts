import type { GlobalConfig } from 'payload'

import { soloAdmins } from '../access'
import { traducible } from '../lib/localizacion'

export const ConfiguracionSitio: GlobalConfig = {
  slug: 'configuracion-sitio',
  label: 'Configuracion del sitio',
  admin: { group: 'Configuracion' },
  access: {
    read: () => true,
    update: soloAdmins,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad',
          fields: [
            { name: 'nombreComercial', type: 'text', required: true, defaultValue: 'aquabioprocess.cl' },
            {
              name: 'razonSocial',
              type: 'text',
              required: true,
              defaultValue: 'SALINAS AQUABIOPROCESS EXPERT CONSULTING SpA',
              admin: { description: 'Nombre legal. Se usa en documentos y pie de pagina.' },
            },
            { name: 'rut', type: 'text', label: 'RUT de la empresa' },
            { name: 'giro', type: 'text' },
            traducible({ name: 'descripcionBreve', type: 'textarea', maxLength: 200 }),
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'logoOscuro', type: 'upload', relationTo: 'media', label: 'Logo para fondo oscuro' },
            { name: 'favicon', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Contacto',
          fields: [
            { name: 'email', type: 'email' },
            { name: 'telefono', type: 'text' },
            { name: 'direccion', type: 'text' },
            { name: 'comuna', type: 'text' },
            { name: 'region', type: 'text' },
            {
              name: 'whatsapp',
              type: 'group',
              label: 'WhatsApp',
              fields: [
                {
                  name: 'numero',
                  type: 'text',
                  admin: {
                    description:
                      'Numero con codigo de pais, ej: +56912345678. Si se deja vacio, el boton flotante no se muestra.',
                  },
                },
                {
                  name: 'mensajePorDefecto',
                  type: 'text',
                  defaultValue: 'Hola, quisiera más información.',
                  admin: {
                    description: 'Mensaje precargado cuando alguien abre el boton flotante de WhatsApp.',
                  },
                },
              ],
            },
            {
              name: 'redes',
              type: 'array',
              label: 'Redes sociales',
              fields: [
                { name: 'plataforma', type: 'select', required: true, options: [
                  { label: 'LinkedIn', value: 'linkedin' },
                  { label: 'YouTube', value: 'youtube' },
                  { label: 'Instagram', value: 'instagram' },
                  { label: 'X / Twitter', value: 'x' },
                ] },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Legal',
          fields: [
            {
              name: 'versionPoliticaPrivacidad',
              type: 'text',
              admin: {
                description: 'Se guarda junto a cada consentimiento de newsletter. Subila cuando cambies la politica.',
              },
            },
            traducible({
              name: 'textoConsentimientoNewsletter',
              type: 'textarea',
              label: 'Texto de consentimiento del newsletter',
              admin: {
                description: 'Se copia literalmente en cada suscripcion como prueba de consentimiento.',
              },
            }),
          ],
        },
        {
          label: 'SEO por defecto',
          fields: [
            traducible({ name: 'tituloPorDefecto', type: 'text', maxLength: 60 }),
            traducible({ name: 'descripcionPorDefecto', type: 'textarea', maxLength: 160 }),
            { name: 'imagenCompartir', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
