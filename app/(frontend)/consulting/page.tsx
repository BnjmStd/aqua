import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { CaseCatalog } from '@/components/consulting/CaseCatalog'
import { ServiceCatalog } from '@/components/consulting/ServiceCatalog'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { obtenerPagina } from '@/queries/paginas'
import { obtenerCasosPublicados } from '@/queries/consulting/casos'
import { obtenerServiciosPublicados } from '@/queries/consulting/servicios'

const SLUG = 'consulting'

export async function generateMetadata(): Promise<Metadata> {
  const pagina = await obtenerPagina(SLUG)
  if (!pagina) return {}
  return {
    title: pagina.seo?.titulo ?? `${pagina.titulo} | aquabioprocess.cl`,
    description: pagina.seo?.descripcion ?? undefined,
  }
}

export default async function ConsultingPage() {
  const [pagina, servicios, casos] = await Promise.all([
    obtenerPagina(SLUG),
    obtenerServiciosPublicados(),
    obtenerCasosPublicados(),
  ])
  if (!pagina) notFound()

  const bloques = pagina.bloques ?? []
  // El catalogo de servicios y casos vive en sus colecciones (no son bloques
  // de pagina); el hero y el cierre si vienen del CMS y se intercalan.
  const encabezado = bloques.filter((b) => b.blockType === 'hero')
  const cierre = bloques.filter((b) => b.blockType === 'cta')

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <BlockRenderer bloques={encabezado} />

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

        <BlockRenderer bloques={cierre} />
      </main>
      <Footer />
    </div>
  )
}
