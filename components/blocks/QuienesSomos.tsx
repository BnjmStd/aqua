import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { HaloIcono } from '@/components/ui/HaloIcono'
import { Heading } from '@/components/ui/Heading'
import { MoleculaTitulo } from '@/components/ui/MoleculaTitulo'
import { RevelarLista } from '@/components/ui/RevelarLista'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { urlDeMedia } from '@/lib/media'
import { esPoblado, type BloqueDeTipo } from './types'

const HALO: Array<'brand' | 'navy' | 'lime'> = ['brand', 'navy', 'lime', 'brand']

export function QuienesSomos({
  antetitulo,
  titulo,
  bajada,
  texto,
  cierre,
  imagen,
  bases,
}: BloqueDeTipo<'quienesSomos'>) {
  const foto = esPoblado(imagen) ? imagen : null
  const src = urlDeMedia(foto, 'hero')

  return (
    <Section textura>
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {antetitulo ? (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-brand-700">
                {antetitulo}
              </p>
            ) : null}
            <MoleculaTitulo className="mb-3" />
            <Heading level={2}>{titulo}</Heading>
            {bajada ? (
              <Text tone="lead" className="mt-4">
                {bajada}
              </Text>
            ) : null}
            <Text className="mt-6 whitespace-pre-line">{texto}</Text>
          </div>

          {src ? (
            <div className="group lg:col-span-5">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -right-3 -bottom-3 hidden h-full w-full rounded-lg bg-brand-500/35 sm:block"
                />
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
                  <Image
                    src={src}
                    alt={foto?.alt ?? titulo}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {bases?.length ? (
          <RevelarLista className="mt-14 grid gap-6 sm:grid-cols-2">
            {bases.map((base, i) => (
              <div
                key={base.id ?? i}
                className="rounded-lg border border-border bg-surface/90 p-6 shadow-soft backdrop-blur-sm transition-shadow hover:shadow-md"
              >
                <HaloIcono nombre={base.icono} variante={HALO[i % HALO.length]} />
                <Heading level={4} as="h3" className="mt-4">
                  {base.titulo}
                </Heading>
                <Text className="mt-2">{base.descripcion}</Text>
              </div>
            ))}
          </RevelarLista>
        ) : null}

        {cierre ? (
          <Text tone="lead" className="mx-auto mt-14 max-w-3xl text-center">
            {cierre}
          </Text>
        ) : null}
      </Container>
    </Section>
  )
}
