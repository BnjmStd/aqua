import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { RevelarLista } from '@/components/ui/RevelarLista'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import type { BloqueDeTipo } from './types'

/** Fotos de /public, en el mismo orden que el seed de sectores. Se ciclan si hay más. */
const FOTOS = [
  { src: '/hero-planta.jpg', alt: 'Planta de tratamiento de efluentes' },
  { src: '/hero-consulting.jpg', alt: 'Reactores biológicos en operación' },
  { src: '/bioindicador-floculo-sano.jpg', alt: 'Flóculo de lodo activado al microscopio' },
  { src: '/bioindicador-rotifero.jpg', alt: 'Microscopía de lodo activado' },
  { src: '/corrosion-estructura-consumida.jpg', alt: 'Estructura industrial en planta' },
  { src: '/hero-academy.jpg', alt: 'Parrilla de aireación en un reactor biológico' },
] as const

export function Sectores({ titulo, bajada, sectores }: BloqueDeTipo<'sectores'>) {
  if (!sectores?.length) return null

  return (
    <Section>
      <Container>
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <Heading level={2}>{titulo}</Heading>
          {bajada ? (
            <Text tone="lead" className="mt-4">
              {bajada}
            </Text>
          ) : null}
        </div>

        <RevelarLista className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sectores.map((sector, i) => {
            const foto = FOTOS[i % FOTOS.length]
            return (
              <article
                key={sector.id ?? i}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-navy-900 shadow-soft"
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-900/55 to-navy-900/10" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="mb-2 h-0.5 w-8 bg-lime" aria-hidden />
                  <Heading level={4} as="h3" className="text-white">
                    {sector.nombre}
                  </Heading>
                  <Text className="mt-2 text-white/80">{sector.descripcion}</Text>
                </div>
              </article>
            )
          })}
        </RevelarLista>
      </Container>
    </Section>
  )
}
