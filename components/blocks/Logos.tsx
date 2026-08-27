import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { esPoblado, type BloqueDeTipo } from './types'

export function Logos({ titulo, clientes }: BloqueDeTipo<'logos'>) {
  const logos = (clientes ?? []).filter(esPoblado)
  if (!logos.length) return null

  return (
    <Section tone="muted">
      <Container>
        {titulo ? (
          <Heading level={4} as="h2" className="mb-10 text-center text-foreground/60">
            {titulo}
          </Heading>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 grayscale opacity-70">
          {logos.map((cliente) => {
            const logo = esPoblado(cliente.logo) ? cliente.logo : null
            if (!logo?.url) return null

            return (
              <Image
                key={cliente.id}
                src={logo.url}
                alt={cliente.nombre}
                width={140}
                height={48}
                className="h-8 w-auto object-contain sm:h-10"
              />
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
