import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { richTextClassName } from '@/components/ui/richTextClassName'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { esPoblado } from '@/lib/relaciones'
import { urlDeMedia } from '@/lib/media'
import { metadataDesdeSeo } from '@/lib/seo'
import type { Articulo } from '@/payload-types'
import { obtenerArticuloPorSlug } from '@/queries/insights/articulos'

const ETIQUETA_TIPO: Record<Articulo['tipo'], string> = {
  articulo: 'Artículo',
  analisis: 'Análisis técnico',
  linkedin: 'LinkedIn',
  noticia: 'Noticia',
  caso_comentado: 'Caso comentado',
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

// Las imágenes embebidas en el rich text del artículo, con aire y esquinas suaves.
const CONTENIDO = `${richTextClassName} [&_img]:my-8 [&_img]:w-full [&_img]:rounded-lg [&_figure]:my-8 [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-foreground/50`

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const articulo = await obtenerArticuloPorSlug(slug)
  if (!articulo) return {}

  return metadataDesdeSeo(articulo.seo, { titulo: articulo.titulo, descripcion: articulo.bajada })
}

export default async function ArticuloPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const articulo = await obtenerArticuloPorSlug(slug)

  if (!articulo) notFound()

  const imagen = urlDeMedia(articulo.imagenDestacada, 'hero')
  const autores = (articulo.autores ?? []).filter(esPoblado).map((persona) => persona.nombre)

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section>
          <Container className="max-w-3xl">
            <nav className="mb-6 flex items-center gap-2 text-sm text-foreground/50">
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
              <span aria-hidden>/</span>
              <Link href="/insights" className="hover:text-foreground">
                Insights
              </Link>
              <span aria-hidden>/</span>
              <span className="text-foreground/80">{articulo.titulo}</span>
            </nav>

            <Badge>{ETIQUETA_TIPO[articulo.tipo]}</Badge>
            <Heading level={1} className="mt-4">
              {articulo.titulo}
            </Heading>
            <Text tone="lead" className="mt-4">
              {articulo.bajada}
            </Text>

            <p className="mt-6 text-sm text-foreground/50">
              {FORMATO_FECHA.format(new Date(articulo.fechaPublicacion))}
              {autores.length ? ` · ${autores.join(', ')}` : ''}
              {articulo.tiempoLecturaMinutos ? ` · ${articulo.tiempoLecturaMinutos} min de lectura` : ''}
            </p>

            {imagen ? (
              <div className="mt-8 aspect-video w-full overflow-hidden rounded-lg bg-navy-950">
                <Image
                  src={imagen}
                  alt={articulo.titulo}
                  width={1200}
                  height={675}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            {articulo.contenido ? (
              <div className={`mt-10 ${CONTENIDO}`}>
                <RichText data={articulo.contenido} />
              </div>
            ) : null}

            <div className="mt-16 border-t border-border pt-8">
              <Link href="/insights" className="text-sm font-medium text-brand-700 hover:underline">
                ← Volver a Insights
              </Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
