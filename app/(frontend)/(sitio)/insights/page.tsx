import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@/components/insights/ArticleCard'
import { FeaturedArticle } from '@/components/insights/FeaturedArticle'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { obtenerArticulosPublicados } from '@/queries/insights/articulos'
import { obtenerNewsletterEnviadas } from '@/queries/insights/newsletter'

export const metadata: Metadata = {
  title: 'Insights | aquabioprocess.cl',
  description:
    'Artículos técnicos y análisis sobre tratamiento de aguas, efluentes industriales y procesos biológicos.',
}

export default async function InsightsPage() {
  const [articulos, newsletters] = await Promise.all([
    obtenerArticulosPublicados(),
    obtenerNewsletterEnviadas(),
  ])
  // Destacado del equipo: el mas reciente marcado como tal (la query ya viene
  // ordenada por fecha). El resto va en la grilla.
  const destacado = articulos.find((articulo) => articulo.destacado) ?? null
  const resto = articulos.filter((articulo) => articulo.id !== destacado?.id)

  return (
    <>
      <Section textura>
        <Container className="relative">
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
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {newsletters.length ? (
        <Section tone="muted" id="newsletter">
          <Container>
            <Heading level={2}>Newsletter</Heading>
            <Text tone="lead" className="mt-3 max-w-2xl">
              Ediciones técnicas enviadas a la comunidad AquaBioProcess.
            </Text>
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {newsletters.map((edicion) => (
                <li key={edicion.id} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                      Edición {edicion.numero}
                      {edicion.fechaEnvio
                        ? ` · ${new Date(edicion.fechaEnvio).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                          })}`
                        : null}
                    </p>
                    <p className="mt-1 font-serif text-xl font-semibold text-foreground">
                      {edicion.titulo}
                    </p>
                    {edicion.preheader ? (
                      <p className="mt-1 text-sm text-foreground/70">{edicion.preheader}</p>
                    ) : null}
                  </div>
                  {edicion.slug ? (
                    <Link
                      href={`/insights/newsletter/${edicion.slug}`}
                      className="shrink-0 text-sm font-medium text-brand-700 hover:underline"
                    >
                      Leer edición →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </>
  )
}
