import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { FondoFoto } from '@/components/ui/FondoFoto'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { resolverMailto } from '@/lib/whatsapp'
import type { BloqueDeTipo } from './types'

export async function Cta({ titulo, texto, textoBoton, enlace }: BloqueDeTipo<'cta'>) {
  const email = correoParaMotivo(await obtenerConfiguracionSitio())
  const href = resolverMailto(enlace, email)

  return (
    <Section tone="navy" className="overflow-hidden">
      <FondoFoto src="/hero-planta.jpg" opacidad={0.32} />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <Heading level={2} className="max-w-2xl text-white">
          {titulo}
        </Heading>
        {texto ? (
          <Text tone="lead" className="max-w-xl text-white/80">
            {texto}
          </Text>
        ) : null}
        <Button href={href} size="lg" className="bg-brand-400 text-brand-950 hover:bg-brand-300">
          {textoBoton}
        </Button>
      </Container>
    </Section>
  )
}
