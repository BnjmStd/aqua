import { Container } from '@/components/ui/Container'
import { EsquemaProceso } from '@/components/ui/EsquemaProceso'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
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
      className="flex min-h-screen flex-col justify-center overflow-hidden bg-navy-800 py-20 text-white"
    >
      <Container className="flex flex-col items-center gap-12">
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
