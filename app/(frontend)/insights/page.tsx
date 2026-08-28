import type { Metadata } from 'next'

import { ArticleCard } from '@/components/insights/ArticleCard'
import { FeaturedArticle } from '@/components/insights/FeaturedArticle'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { obtenerArticulosPublicados } from '@/queries/insights/articulos'

export const metadata: Metadata = {
  title: 'Insights | aquabioprocess.cl',
  description:
    'Artículos técnicos y análisis sobre tratamiento de aguas, efluentes industriales y procesos biológicos.',
}

export default async function InsightsPage() {
  const articulos = await obtenerArticulosPublicados()
  // Destacado del equipo: el mas reciente marcado como tal (la query ya viene
  // ordenada por fecha). El resto va en la grilla.
  const destacado = articulos.find((articulo) => articulo.destacado) ?? null
  const resto = articulos.filter((articulo) => articulo.id !== destacado?.id)

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section>
          <Container>
            <div className="mb-12 max-w-2xl">
              <Heading level={1}>Insights</Heading>
              <Text tone="lead" className="mt-4">
                Conocimiento técnico aplicado: lo que aprendemos en planta y en laboratorio,
                puesto por escrito.
              </Text>
            </div>

            {articulos.length ? (
              <>
                {destacado ? <FeaturedArticle articulo={destacado} /> : null}
                {resto.length ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {resto.map((articulo) => (
                      <ArticleCard key={articulo.id} articulo={articulo} />
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState
                titulo="Todavía no hay artículos publicados"
                descripcion="Estamos preparando los primeros contenidos. Vuelve pronto."
              />
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
