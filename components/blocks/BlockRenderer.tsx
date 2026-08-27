import { Contenido } from './Contenido'
import { Cta } from './Cta'
import { Destacados } from './Destacados'
import { Equipo } from './Equipo'
import { Faq } from './Faq'
import { Hero } from './Hero'
import { Logos } from './Logos'
import { Perfil } from './Perfil'
import { Presencia } from './Presencia'
import { Propuesta } from './Propuesta'
import { Unidades } from './Unidades'
import type { Bloque } from './types'

export function BlockRenderer({ bloques }: { bloques: Bloque[] }) {
  return (
    <>
      {bloques.map((bloque) => {
        switch (bloque.blockType) {
          case 'hero':
            return <Hero key={bloque.id} {...bloque} />
          case 'perfil':
            return <Perfil key={bloque.id} {...bloque} />
          case 'contenido':
            return <Contenido key={bloque.id} {...bloque} />
          case 'destacados':
            return <Destacados key={bloque.id} {...bloque} />
          case 'unidades':
            return <Unidades key={bloque.id} {...bloque} />
          case 'propuesta':
            return <Propuesta key={bloque.id} {...bloque} />
          case 'presencia':
            return <Presencia key={bloque.id} {...bloque} />
          case 'cta':
            return <Cta key={bloque.id} {...bloque} />
          case 'logos':
            return <Logos key={bloque.id} {...bloque} />
          case 'faq':
            return <Faq key={bloque.id} {...bloque} />
          case 'equipo':
            return <Equipo key={bloque.id} {...bloque} />
          default:
            return null
        }
      })}
    </>
  )
}
