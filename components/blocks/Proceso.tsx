import { Container } from '@/components/ui/Container'
import { EsquemaProceso } from '@/components/ui/EsquemaProceso'
import { FondoFoto } from '@/components/ui/FondoFoto'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { TexturaGrilla } from '@/components/ui/TexturaGrilla'
import type { BloqueDeTipo } from './types'

/**
 * Banda a pantalla completa con el esquema de la planta. La seccion se fija
 * (pin, en EsquemaProceso modo="seccion") mientras el scroll dibuja todo el
 * proceso: tanques, tuberias, llenado, y la descarga del efluente tratado.
 */
export function Proceso({ titulo, bajada }: BloqueDeTipo<'proceso'>) {
  return (
    <section
      data-esquema-pin
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-navy-800 py-20 text-white"
    >
      <FondoFoto src="/hero-planta.jpg" opacidad={0.18} />
      <TexturaGrilla oscura />
      <Container className="relative flex flex-col items-center gap-12">
        {(titulo || bajada) && (
          <div className="max-w-2xl text-center">
            {titulo && (
              <Heading level={2} className="text-white">
                {titulo}
              </Heading>
            )}
            {bajada && (
              <Text tone="lead" className="mt-4 text-white/80">
                {bajada}
              </Text>
            )}
          </div>
        )}
        <EsquemaProceso modo="seccion" tono="oscuro" className="max-w-2xl" />
      </Container>
    </section>
  )
}
