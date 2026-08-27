import path from 'path'
import { fileURLToPath } from 'url'

import type { CollectionConfig } from 'payload'

import { soloAutenticados } from '../access'
import { traducible } from '../lib/localizacion'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Medios' },
  admin: {
    group: 'Configuracion',
    description: 'Imagenes y documentos. El texto alternativo es obligatorio por accesibilidad.',
  },
  access: {
    read: () => true, // los archivos deben ser publicos para renderizar el sitio
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  hooks: {
    /**
     * Payload arma las URLs de archivo como absolutas (con base en
     * `serverURL`). `next/image` trata ese host como remoto y lo rechaza
     * salvo que se declare en `images.remotePatterns` por entorno. Como los
     * archivos se sirven same-origin en `/api/media/file/`, devolvemos rutas
     * relativas: el optimizador las toma sin configuracion y funciona igual
     * en local, preview y produccion.
     */
    afterRead: [
      ({ doc }) => {
        const aRelativa = (u: unknown) =>
          typeof u === 'string' ? u.replace(/^https?:\/\/[^/]+/i, '') : u
        doc.url = aRelativa(doc.url)
        doc.thumbnailURL = aRelativa(doc.thumbnailURL)
        if (doc.sizes && typeof doc.sizes === 'object') {
          for (const tamano of Object.values(doc.sizes)) {
            if (tamano && typeof tamano === 'object') {
              ;(tamano as { url?: unknown }).url = aRelativa((tamano as { url?: unknown }).url)
            }
          }
        }
        return doc
      },
    ],
  },
  fields: [
    traducible({
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
      admin: { description: 'Describe la imagen para lectores de pantalla y buscadores.' },
    }),
    traducible({
      name: 'epigrafe',
      type: 'text',
      label: 'Epigrafe',
      admin: { description: 'Opcional. Se muestra debajo de la imagen.' },
    }),
    {
      name: 'credito',
      type: 'text',
      label: 'Credito / fuente',
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../media'),
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
