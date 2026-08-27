import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Icono } from '@/components/ui/iconos'
import { Text } from '@/components/ui/Text'
import { esPoblado, type BloqueDeTipo } from './types'

/**
 * Hero de persona: texto a la izquierda, foto enmarcada a la derecha con un
 * overlay de datos. Es el tratamiento de la maqueta del fundador, sobre fondo
 * claro (a diferencia del bloque `hero`, que va full-bleed sobre navy).
 */
export function Perfil({
  antetitulo,
  nombre,
  subtitulo,
  texto,
  foto,
  acciones,
  estadisticas,
}: BloqueDeTipo<'perfil'>) {
  const retrato = esPoblado(foto) ? foto : null

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Grilla tecnica de fondo, muy tenue. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.4] [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <Container className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {antetitulo ? (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-lime motion-safe:animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                {antetitulo}
              </span>
            </div>
          ) : null}

          <Heading level={1} as="h1">
            {nombre}
          </Heading>

          {subtitulo ? (
            <Text tone="lead" className="mt-3 text-brand-700">
              {subtitulo}
            </Text>
          ) : null}

          {texto ? (
            <Text className="mt-6 border-l-2 border-brand-500 pl-4">{texto}</Text>
          ) : null}

          {acciones?.length ? (
            <div className="mt-10 flex flex-wrap gap-4">
              {acciones.map((accion) => (
                <Button
                  key={accion.id ?? accion.texto}
                  href={accion.enlace}
                  variant={accion.estilo === 'secundario' ? 'secundario' : 'primario'}
                  size="lg"
                >
                  {accion.texto}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        {retrato?.url ? (
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-surface p-2 shadow-soft">
              <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-1 bg-lime" />
              <div className="relative h-full w-full overflow-hidden rounded">
                <Image
                  src={retrato.url}
                  alt={retrato.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-center"
                />
              </div>

              {estadisticas?.length ? (
                <div className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-between gap-3 rounded border border-white/15 bg-navy-900/90 p-4 backdrop-blur-md">
                  {estadisticas.map((dato, i) => (
                    <div key={dato.id ?? i} className="flex items-center gap-3">
                      {i > 0 ? <span aria-hidden className="h-8 w-px bg-white/20" /> : null}
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-brand-300">
                          {dato.etiqueta}
                        </p>
                        <p className="mt-0.5 font-semibold text-white">{dato.valor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Circulo decorativo, como en la maqueta. */}
            <div
              aria-hidden
              className="pointer-events-none -mt-8 ml-auto hidden h-20 w-20 translate-x-2 items-center justify-center rounded-full border border-dashed border-border bg-background text-brand-700 lg:flex"
            >
              <Icono nombre="matraz" size={22} />
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  )
}
