import type { CollectionConfig } from 'payload'

import type { Access } from 'payload'

import { soloAutenticados, soloAutenticadosCampo } from '../access'
import { campoSlug } from '../fields/slug'
import { traducible } from '../lib/localizacion'

/**
 * Una sola coleccion para equipo, relatores de Academy y autores de Insights.
 * Modelarlas por separado obliga a cargar tres veces a la misma persona y a
 * mantener tres biografias que se desincronizan.
 */
/** El publico solo ve a quienes estan marcados como visibles en el sitio. */
const visiblesOAutenticados: Access = ({ req: { user } }) => {
  if (user) return true
  return { visibleEnSitio: { equals: true } }
}

export const Personas: CollectionConfig = {
  slug: 'personas',
  labels: { singular: 'Persona', plural: 'Personas' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'cargo', 'roles', 'visibleEnSitio'],
    group: 'Transversal',
    description: 'Equipo, relatores y autores. La misma persona puede cumplir varios roles.',
  },
  access: {
    read: visiblesOAutenticados,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    campoSlug('nombre'),
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Equipo', value: 'equipo' },
        { label: 'Relator / docente', value: 'relator' },
        { label: 'Autor', value: 'autor' },
        { label: 'Investigador', value: 'investigador' },
        { label: 'Colaborador externo', value: 'externo' },
      ],
      admin: { position: 'sidebar' },
    },
    traducible({ name: 'cargo', type: 'text', label: 'Cargo o titulo profesional' }),
    traducible({ name: 'bio', type: 'textarea', label: 'Biografia breve' }),
    { name: 'foto', type: 'upload', relationTo: 'media' },
    {
      name: 'email',
      type: 'email',
      // Correo personal: no se expone en la API publica.
      access: { read: soloAutenticadosCampo },
    },
    { name: 'linkedin', type: 'text', label: 'URL de LinkedIn' },
    {
      name: 'visibleEnSitio',
      type: 'checkbox',
      label: 'Mostrar en la pagina de equipo',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'orden',
      type: 'number',
      admin: { position: 'sidebar', description: 'Menor numero aparece primero.' },
    },
  ],
}
