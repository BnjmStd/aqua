import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import type { BloqueDeTipo } from './types'

export function Cta({ titulo, texto, textoBoton, enlace }: BloqueDeTipo<'cta'>) {
  return (
    <Section tone="brand">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Heading level={2} className="max-w-2xl text-white">
          {titulo}
        </Heading>
        {texto ? (
          <Text tone="lead" className="max-w-xl text-white/80">
            {texto}
          </Text>
        ) : null}
        <Button href={enlace} size="lg" className="bg-brand-400 text-brand-950 hover:bg-brand-300">
          {textoBoton}
        </Button>
      </Container>
    </Section>
  )
}
