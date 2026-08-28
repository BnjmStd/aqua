import type { CollectionConfig } from 'payload'

import { publicadosOAutenticados, soloAutenticados } from '../../access'
import { campoSlug } from '../../fields/slug'
import { traducible } from '../../lib/localizacion'
import { versionesConBorrador } from '../../lib/versiones'

/**
 * Catalogo de bioindicadores del lodo activado: los organismos que se observan
 * al microscopio y que dicen algo del estado del proceso biologico. Alimenta el
 * bloque de la pagina de Consulting. El articulo de Insights usa las mismas
 * imagenes pero con su propio texto, no esta coleccion.
 */
export const Bioindicadores: CollectionConfig = {
  slug: 'bioindicadores',
  labels: { singular: 'Bioindicador', plural: 'Bioindicadores' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'grupo', 'condicion', 'orden', '_status'],
    group: 'Consulting',
    description:
      'Organismos de la microscopia de lodos activados y que indica cada uno sobre la planta.',
  },
  access: {
    read: publicadosOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  versions: versionesConBorrador,
  defaultSort: 'orden',
  fields: [
    traducible({
      name: 'nombre',
      type: 'text',
      required: true,
      admin: { description: 'Nombre comun. Ej: Ciliados pedunculados.' },
    }),
    {
      name: 'nombreCientifico',
      type: 'text',
      label: 'Nombre cientifico',
      admin: { description: 'Genero o grupo. Ej: Opercularia sp.' },
    },
    campoSlug('nombre'),
    {
      name: 'imagen',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Microscopia del organismo. La descripcion accesible va en el propio archivo.' },
    },
    {
      name: 'grupo',
      type: 'select',
      required: true,
      options: [
        { label: 'Estructura del floculo', value: 'floculo' },
        { label: 'Ciliados', value: 'ciliado' },
        { label: 'Amebas y flagelados', value: 'ameba' },
        { label: 'Metazoos', value: 'metazoo' },
        { label: 'Bacterias filamentosas', value: 'filamentosa' },
      ],
    },
    {
      name: 'condicion',
      type: 'select',
      required: true,
      defaultValue: 'buena',
      admin: { description: 'Que senala su presencia (o su exceso) para la operacion.' },
      options: [
        { label: 'Senal favorable', value: 'buena' },
        { label: 'Senal de alerta', value: 'alerta' },
        { label: 'Senal de problema', value: 'problema' },
      ],
    },
    traducible({
      name: 'queIndica',
      type: 'textarea',
      required: true,
      label: 'Que indica',
      admin: { description: 'Interpretacion operacional, 1 a 3 frases.' },
    }),
    {
      name: 'orden',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Orden de aparicion en la galeria (menor primero).',
      },
    },
  ],
}
