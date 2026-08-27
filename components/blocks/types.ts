import type { Pagina } from '@/payload-types'

export type Bloque = NonNullable<Pagina['bloques']>[number]

export type BloqueDeTipo<T extends Bloque['blockType']> = Extract<Bloque, { blockType: T }>

export { esPoblado } from '@/lib/relaciones'
