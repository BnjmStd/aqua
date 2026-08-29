import { ArbolCausaRaiz } from '@/components/ui/ArbolCausaRaiz'
import { EsquemaProceso } from '@/components/ui/EsquemaProceso'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { esPoblado, type BloqueDeTipo } from './types'

const ADORNOS = {
  esquema: <EsquemaProceso tono="oscuro" className="mx-auto lg:ml-auto" />,
  causaRaiz: <ArbolCausaRaiz className="mx-auto lg:ml-auto" />,
} as const

export function Hero({ antetitulo, titulo, bajada, imagenFondo, adorno, acciones }: BloqueDeTipo<'hero'>) {
  const fondo = esPoblado(imagenFondo) ? imagenFondo : null

  return (
    <HeroBanner
      antetitulo={antetitulo}
      titulo={titulo}
      bajada={bajada}
      imagen={fondo?.url ? { url: fondo.url, alt: fondo.alt } : null}
      acciones={acciones}
      aside={adorno && adorno !== 'ninguno' ? ADORNOS[adorno] : undefined}
    />
  )
}
