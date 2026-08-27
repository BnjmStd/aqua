import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Icono } from '@/components/ui/iconos'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { cn } from '@/lib/cn'
import type { BloqueDeTipo } from './types'

/**
 * El bento de la maqueta: dos tarjetas anchas y dos angostas alternadas
 * (2-1 / 1-2). El ancho y el acento salen de la POSICION, no del CMS: son
 * decisiones de composicion, y dejarlas editables solo permite romper la
 * grilla. Por eso el bloque limita a cuatro pilares.
 */
const PRESENTACION = [
  { ancha: true, tarjeta: 'bg-surface', icono: 'text-brand-700' },
  { ancha: false, tarjeta: 'bg-surface border-t-4 border-t-brand-500', icono: 'text-navy-800' },
  // El acento lime va en el borde, no en el icono: sobre el fondo claro el
  // #a2d49f del template da 1.61:1 y el icono queda invisible.
  { ancha: false, tarjeta: 'bg-surface border-t-4 border-t-lime', icono: 'text-navy-800' },
  { ancha: true, tarjeta: 'bg-navy-800 text-white', icono: 'text-brand-300' },
] as const

export function Propuesta({ titulo, bajada, pilares }: BloqueDeTipo<'propuesta'>) {
  if (!pilares?.length) return null

  return (
    <Section tone="muted">
      <Container>
        {(titulo || bajada) && (
          <div className="mx-auto mb-16 max-w-3xl text-center">
            {titulo && <Heading level={2}>{titulo}</Heading>}
            {bajada && (
              <Text tone="lead" className="mt-4">
                {bajada}
              </Text>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {pilares.map((pilar, i) => {
            const { ancha, tarjeta, icono } = PRESENTACION[i % PRESENTACION.length]
            const enNavy = i % PRESENTACION.length === 3

            return (
              <div
                key={pilar.id ?? i}
                className={cn(
                  'relative flex flex-col justify-center overflow-hidden rounded-lg border border-border p-8',
                  ancha && 'md:col-span-2',
                  tarjeta,
                )}
              >
                {i % PRESENTACION.length === 0 && (
                  // El circulo decorativo de la esquina, recortado por el
                  // overflow-hidden de la tarjeta.
                  <div
                    aria-hidden
                    className="absolute -top-16 -right-16 h-32 w-32 rounded-bl-full bg-brand-300/20"
                  />
                )}
                <span className={cn('relative', icono)}>
                  <Icono nombre={pilar.icono} />
                </span>
                <Heading
                  level={4}
                  as="h3"
                  className={cn('relative mt-4', enNavy && 'text-white')}
                >
                  {pilar.titulo}
                </Heading>
                <Text className={cn('relative mt-2', enNavy && 'text-white/90')}>
                  {pilar.descripcion}
                </Text>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
