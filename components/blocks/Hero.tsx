import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { esPoblado, type BloqueDeTipo } from './types'

export function Hero({ titulo, bajada, imagenFondo, acciones }: BloqueDeTipo<'hero'>) {
  const fondo = esPoblado(imagenFondo) ? imagenFondo : null

  return (
    <section className="relative overflow-hidden bg-navy-800 text-white">
      {fondo?.url ? (
        <Image
          src={fondo.url}
          alt={fondo.alt}
          fill
          priority
          className="object-cover opacity-40"
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-navy-900 via-navy-800/85 to-brand-700/50" />

      <Container className="relative py-28 sm:py-36">
        <div className="max-w-2xl">
          <Heading level={1} as="h1" className="text-white">
            {titulo}
          </Heading>
          {bajada ? (
            <Text tone="lead" className="mt-6 text-white/80">
              {bajada}
            </Text>
          ) : null}

          {acciones?.length ? (
            <div className="mt-10 flex flex-wrap gap-4">
              {acciones.map((accion) => (
                <Button
                  key={accion.id ?? accion.texto}
                  href={accion.enlace}
                  variant={accion.estilo === 'secundario' ? 'secundario' : 'primario'}
                  size="lg"
                  className={
                    accion.estilo === 'secundario'
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : undefined
                  }
                >
                  {accion.texto}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
