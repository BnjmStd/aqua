import type { CollectionConfig } from 'payload'

import { soloAutenticados } from '../../access'
import { traducible } from '../../lib/localizacion'

/**
 * OBJETIVO = un objetivo de aprendizaje de un curso.
 *
 * Es su propia coleccion (no un array dentro de Curso) porque un modulo
 * puede cubrir mas de un objetivo a la vez: la relacion es muchos-a-muchos,
 * y eso lo modela el campo `objetivos` de cada modulo en Cursos.ts, filtrado
 * a los objetivos de ESE curso (ver `filterOptions` alla).
 *
 * Sin `versions`: el objetivo no tiene ciclo editorial propio, su
 * visibilidad la manda el Curso al que pertenece (si el curso esta en
 * borrador, nadie linkea sus objetivos igual que nadie linkea sus modulos).
 * Por eso `read` es publico sin filtrar por estado — igual que Media.
 */
export const Objetivos: CollectionConfig = {
  slug: 'objetivos',
  labels: { singular: 'Objetivo de aprendizaje', plural: 'Objetivos de aprendizaje' },
  admin: {
    useAsTitle: 'objetivo',
    defaultColumns: ['objetivo', 'curso', 'orden'],
    group: 'Academy',
    description: 'Objetivos de aprendizaje de un curso. Los modulos se marcan a estos desde el curso.',
  },
  access: {
    read: () => true,
    create: soloAutenticados,
    update: soloAutenticados,
    delete: soloAutenticados,
  },
  fields: [
    {
      name: 'curso',
      type: 'relationship',
      relationTo: 'cursos',
      required: true,
      index: true,
    },
    traducible({
      name: 'objetivo',
      type: 'text',
      required: true,
      admin: { description: 'El objetivo de aprendizaje, en una frase.' },
    }),
    {
      name: 'videoIntro',
      type: 'text',
      label: 'Video de introduccion (URL)',
      admin: {
        description:
          'Link a un video corto (YouTube, Vimeo, Loom) que presenta este objetivo. Opcional.',
      },
    },
    {
      name: 'orden',
      type: 'number',
      admin: { description: 'Menor numero aparece primero.' },
    },
  ],
}
