import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CourseSidebar } from '@/components/academy/CourseSidebar'
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
import { obtenerCursoPorSlug } from '@/queries/academy/cursos'
import { obtenerObjetivosDeCurso } from '@/queries/academy/objetivos'

export async function generateMetadata(props: PageProps<'/academy/cursos/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const curso = await obtenerCursoPorSlug(slug)
  if (!curso) return {}

  return metadataDesdeSeo(curso.seo, { titulo: curso.titulo, descripcion: curso.resumen })
}

export default async function CursoPage(props: PageProps<'/academy/cursos/[slug]'>) {
  const { slug } = await props.params
  const curso = await obtenerCursoPorSlug(slug)

  if (!curso) notFound()

  const objetivos = await obtenerObjetivosDeCurso(curso.id)
  const numeroPorObjetivo = new Map(objetivos.map((objetivo, indice) => [objetivo.id, indice + 1]))

  const imagen = urlDeMedia(curso.imagenDestacada, 'hero')

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section>
          <Container className="max-w-6xl">
            <nav className="mb-6 flex items-center gap-2 text-sm text-foreground/50">
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
              <span aria-hidden>/</span>
              <Link href="/academy/cursos" className="hover:text-foreground">
                Cursos
              </Link>
              <span aria-hidden>/</span>
              <span className="text-foreground/80">{curso.titulo}</span>
            </nav>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
              {/* Columna principal: el unico contenido que hace scroll */}
              <div className="min-w-0">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-brand-950">
                  {imagen ? (
                    <Image
                      src={imagen}
                      alt={curso.titulo}
                      width={1200}
                      height={675}
                      priority
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <Heading level={1} className="mt-8">
                  {curso.titulo}
                </Heading>
                <Text tone="lead" className="mt-4">
                  {curso.resumen}
                </Text>

                {curso.descripcion ? (
                  <div className={`mt-10 ${richTextClassName}`}>
                    <RichText data={curso.descripcion} />
                  </div>
                ) : null}

                {objetivos.length ? (
                  <div className="mt-10">
                    <Heading level={3}>Objetivos de aprendizaje</Heading>
                    <ul className="mt-4 space-y-4">
                      {objetivos.map((objetivo, indice) => (
                        <li key={objetivo.id} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                          <span className="mt-0.5 shrink-0 font-serif text-xs text-foreground/40">
                            {String(indice + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p>{objetivo.objetivo}</p>
                            {objetivo.videoIntro ? (
                              <a
                                href={objetivo.videoIntro}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-block text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                              >
                                Ver video introductorio →
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {curso.modulos?.length ? (
                  <div className="mt-10">
                    <Heading level={3}>Contenidos</Heading>
                    <ol className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
                      {curso.modulos.map((modulo, indice) => {
                        const numerosObjetivos = (modulo.objetivos ?? [])
                          .filter(esPoblado)
                          .map((objetivo) => numeroPorObjetivo.get(objetivo.id))
                          .filter((numero): numero is number => numero !== undefined)
                          .sort((a, b) => a - b)

                        return (
                          <li key={modulo.id ?? modulo.titulo} className="flex gap-4 py-4">
                            <span className="font-serif text-sm text-foreground/40">
                              {String(indice + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">
                                {modulo.titulo}
                                {modulo.horas ? (
                                  <span className="ml-2 text-xs font-normal text-foreground/50">
                                    {modulo.horas} h
                                  </span>
                                ) : null}
                              </p>
                              {modulo.detalle ? (
                                <p className="mt-1 text-sm text-foreground/70">{modulo.detalle}</p>
                              ) : null}
                              {numerosObjetivos.length ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {numerosObjetivos.map((numero) => (
                                    <Badge key={numero} className="text-[11px]">
                                      Objetivo {numero}
                                    </Badge>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                ) : null}

                {curso.dirigidoA || curso.requisitos ? (
                  <div className="mt-10 grid gap-8 sm:grid-cols-2">
                    {curso.dirigidoA ? (
                      <div>
                        <Heading level={4} as="h3">
                          Dirigido a
                        </Heading>
                        <Text tone="muted" className="mt-2">
                          {curso.dirigidoA}
                        </Text>
                      </div>
                    ) : null}
                    {curso.requisitos ? (
                      <div>
                        <Heading level={4} as="h3">
                          Requisitos previos
                        </Heading>
                        <Text tone="muted" className="mt-2">
                          {curso.requisitos}
                        </Text>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Columna lateral: fija en pantalla mientras la principal scrollea */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <CourseSidebar curso={curso} />
              </aside>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
