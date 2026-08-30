import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import type { BloqueDeTipo } from './types'

/**
 * "Huella geografica" de la maqueta del fundador: una columna por pais, cada
 * una con una lista de plantas donde hubo trabajo. Un proyecto marcado como
 * insignia lleva el acento lime en el borde.
 */
export function Presencia({ antetitulo, titulo, bajada, paises }: BloqueDeTipo<'presencia'>) {
  if (!paises?.length) return null

  return (
    <Section tone="muted" textura>
      <Container className="relative">
        {(antetitulo || titulo || bajada) && (
          <div className="max-w-2xl">
            {antetitulo && (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-brand-700">
                {antetitulo}
              </p>
            )}
            {titulo && <Heading level={2}>{titulo}</Heading>}
            {bajada && (
              <Text tone="lead" className="mt-4">
                {bajada}
              </Text>
            )}
          </div>
        )}

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          {paises.map((columna, i) => (
            <div key={columna.id ?? i}>
              <Heading level={3} as="h3">
                {columna.pais}
              </Heading>
              <div className="mt-6 space-y-4">
                {columna.plantas?.map((planta, j) => (
                  <Card
                    key={planta.id ?? j}
                    className={
                      planta.insignia
                        ? 'border-l-4 border-l-lime'
                        : 'border-l-4 border-l-brand-500/40'
                    }
                  >
                    <Heading level={4} as="h4" className="text-xl">
                      {planta.nombre}
                    </Heading>
                    <Text className="mt-2">{planta.descripcion}</Text>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
