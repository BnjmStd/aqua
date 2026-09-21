import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { richTextClassName } from '@/components/ui/richTextClassName'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { ETIQUETA_TIPO_SERVICIO } from '@/components/consulting/etiquetas'
import { urlDeMedia } from '@/lib/media'
import { metadataDesdeSeo } from '@/lib/seo'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'
import { obtenerServicioPorSlug } from '@/queries/consulting/servicios'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const servicio = await obtenerServicioPorSlug(slug)
  if (!servicio) return {}
  return metadataDesdeSeo(servicio.seo, {
    titulo: servicio.titulo,
    descripcion: servicio.resumen,
  })
}

export default async function ServicioPage({ params }: Props) {
  const { slug } = await params
  const [servicio, sitio] = await Promise.all([
    obtenerServicioPorSlug(slug),
    obtenerConfiguracionSitio(),
  ])
  if (!servicio) notFound()

  const imagen = urlDeMedia(servicio.imagenDestacada, 'hero')
  const entregables =
    servicio.entregables?.map((item) => item.entregable).filter(Boolean) ?? []
  const beneficios =
    servicio.beneficios?.map((item) => item.beneficio).filter(Boolean) ?? []
  const mailto = rutaContacto(correoParaMotivo(sitio), 'servicio', {
    nombre: servicio.titulo,
  })

  return (
    <Section textura>
      <Container className="relative max-w-3xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-foreground/50">
          <Link href="/" className="hover:text-foreground">
            Inicio
          </Link>
          <span aria-hidden>/</span>
          <Link href="/consultoria" className="hover:text-foreground">
            Consultoría
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground/80">{servicio.titulo}</span>
        </nav>

        {servicio.tipo ? (
          <Badge>{ETIQUETA_TIPO_SERVICIO[servicio.tipo] ?? servicio.tipo}</Badge>
        ) : null}

        <Heading level={1} className="mt-4">
          {servicio.titulo}
        </Heading>
        <Text tone="lead" className="mt-4">
          {servicio.resumen}
        </Text>

        {imagen ? (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg bg-navy-950">
            <Image
              src={imagen}
              alt={servicio.titulo}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 48rem, 100vw"
            />
          </div>
        ) : null}

        {servicio.descripcion ? (
          <div className={`mt-10 ${richTextClassName}`}>
            <RichText data={servicio.descripcion} />
          </div>
        ) : null}

        {entregables.length ? (
          <div className="mt-10">
            <Heading level={2}>Entregables</Heading>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/75">
              {entregables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {beneficios.length ? (
          <div className="mt-10">
            <Heading level={2}>Beneficios</Heading>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/75">
              {beneficios.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-12 flex flex-wrap gap-3">
          <Button href={mailto} variant="navy">
            Solicitar información
          </Button>
          <Button href="/consultoria" variant="secundario">
            Volver a consultoría
          </Button>
        </div>
      </Container>
    </Section>
  )
}
