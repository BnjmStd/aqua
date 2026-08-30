import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { RevelarLista } from '@/components/ui/RevelarLista'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { cn } from '@/lib/cn'
import type { BloqueDeTipo } from './types'

export function Pasos({ antetitulo, titulo, bajada, pasos, cierre }: BloqueDeTipo<'pasos'>) {
  if (!pasos?.length) return null

  const compacto = pasos.length <= 4

  return (
    <Section tone="navy" textura className="overflow-hidden">
      <Container className="relative">
        <div className={cn('max-w-3xl', compacto && 'mx-auto text-center')}>
          {antetitulo ? (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-brand-300">
              {antetitulo}
            </p>
          ) : null}
          <Heading level={2} className="text-white">
            {titulo}
          </Heading>
          {bajada ? (
            <Text tone="lead" className="mt-4 text-white/80">
              {bajada}
            </Text>
          ) : null}
        </div>

        {compacto ? (
          <div className="relative mt-14">
            <div
              aria-hidden
              className="absolute top-5 right-10 left-10 hidden h-px bg-brand-400/35 lg:block"
            />
            <RevelarLista className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {pasos.map((paso, i) => (
                <div key={paso.id ?? i} className="text-center lg:text-left">
                  <p className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand-400 font-mono text-sm font-semibold text-navy-950 lg:mx-0">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <Heading level={4} as="h3" className="mt-5 text-white">
                    {paso.titulo}
                  </Heading>
                  <Text className="mt-2 text-white/75">{paso.descripcion}</Text>
                </div>
              ))}
            </RevelarLista>
          </div>
        ) : (
          <RevelarLista className="relative mt-14 grid gap-4 md:grid-cols-2">
            {pasos.map((paso, i) => (
              <div
                key={paso.id ?? i}
                className="flex gap-4 rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <p className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-400 font-mono text-sm font-semibold text-navy-950">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <div>
                  <Heading level={4} as="h3" className="text-white">
                    {paso.titulo}
                  </Heading>
                  <Text className="mt-1 text-white/75">{paso.descripcion}</Text>
                </div>
              </div>
            ))}
          </RevelarLista>
        )}

        {cierre ? (
          <Text tone="lead" className="mx-auto mt-12 max-w-3xl text-center text-white/80">
            {cierre}
          </Text>
        ) : null}
      </Container>
    </Section>
  )
}
