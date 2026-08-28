import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EsquemaProceso } from '@/components/ui/EsquemaProceso'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { cn } from '@/lib/cn'
import { esPoblado, type BloqueDeTipo } from './types'

export function Hero({ antetitulo, titulo, bajada, imagenFondo, esquema, acciones }: BloqueDeTipo<'hero'>) {
  const fondo = esPoblado(imagenFondo) ? imagenFondo : null

  return (
    <section className="group relative overflow-hidden bg-navy-800 text-white">
      {fondo?.url ? (
        <Image
          src={fondo.url}
          alt={fondo.alt}
          fill
          priority
          // El zoom se apaga solo si el sistema pide menos movimiento.
          className="object-cover opacity-40 transition-transform duration-700 ease-out motion-safe:group-hover:scale-110"
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-navy-900 via-navy-800/85 to-brand-700/50" />

      <Container className="relative py-28 sm:py-36">
        <div
          className={cn(
            esquema && 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-16',
          )}
        >
          <div className="max-w-2xl">
            {antetitulo ? (
              // brand-300 y no el teal del template: sobre el navy este da 6.7:1
              // contra 4.3:1, y es texto chico en mayusculas.
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-brand-300">
                {antetitulo}
              </p>
            ) : null}
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

          {esquema ? (
            <div className="mt-14 w-full lg:mt-0">
              <EsquemaProceso tono="oscuro" className="mx-auto lg:ml-auto" />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
