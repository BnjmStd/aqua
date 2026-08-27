import type { Metadata } from 'next'

import { CaseCatalog } from '@/components/consulting/CaseCatalog'
import { ServiceCatalog } from '@/components/consulting/ServiceCatalog'
import { Cta } from '@/components/blocks/Cta'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { obtenerCasosPublicados } from '@/queries/consulting/casos'
import { obtenerServiciosPublicados } from '@/queries/consulting/servicios'

export const metadata: Metadata = {
  title: 'Consulting | aquabioprocess.cl',
  description:
    'Auditorías, diagnósticos y optimización de plantas de tratamiento de aguas y efluentes industriales.',
}

export default async function ConsultingPage() {
  const [servicios, casos] = await Promise.all([obtenerServiciosPublicados(), obtenerCasosPublicados()])

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section tone="brand">
          <Container className="py-12 sm:py-16">
            <div className="max-w-2xl">
              <Heading level={1} as="h1" className="text-white">
                Consulting
              </Heading>
              <Text tone="lead" className="mt-6 text-white/80">
                Auditorías, diagnósticos, causa raíz y optimización de procesos biológicos. Ciencia,
                datos y experiencia operacional para decidir antes de invertir.
              </Text>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button href="/consulting/solicitud" variant="primario" size="lg">
                  Solicitar una consultoría
                </Button>
                <Button
                  href="/contacto"
                  variant="secundario"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Hablar con un asesor
                </Button>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <Heading level={2}>Servicios</Heading>
            <div className="mt-10">
              <ServiceCatalog servicios={servicios} />
            </div>
          </Container>
        </Section>

        {casos.length ? (
          <Section tone="muted">
            <Container>
              <Heading level={2}>Casos de éxito</Heading>
              <div className="mt-10">
                <CaseCatalog casos={casos} />
              </div>
            </Container>
          </Section>
        ) : null}

        <Cta
          blockType="cta"
          titulo="¿Tienes un desafío operacional en mente?"
          texto="Cuéntanos qué necesitas y coordinamos un diagnóstico inicial."
          textoBoton="Solicitar consultoría"
          enlace="/consulting/solicitud"
        />
      </main>
      <Footer />
    </div>
  )
}
