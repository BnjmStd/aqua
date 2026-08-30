import Image from 'next/image'

import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { cn } from '@/lib/cn'
import { obtenerBioindicadores } from '@/queries/consulting/bioindicadores'
import { esPoblado, type BloqueDeTipo } from './types'

const GRUPO: Record<string, string> = {
  floculo: 'Estructura del flóculo',
  ciliado: 'Ciliados',
  ameba: 'Amebas y flagelados',
  metazoo: 'Metazoos',
  filamentosa: 'Bacterias filamentosas',
}

const SENAL: Record<string, { borde: string; punto: string; etiqueta: string }> = {
  buena: { borde: 'border-t-lime', punto: 'bg-lime', etiqueta: 'Señal favorable' },
  alerta: { borde: 'border-t-amber-500', punto: 'bg-amber-500', etiqueta: 'Señal de alerta' },
  problema: { borde: 'border-t-red-500', punto: 'bg-red-500', etiqueta: 'Señal de problema' },
}

export async function Bioindicadores({ titulo, bajada }: BloqueDeTipo<'bioindicadores'>) {
  const items = await obtenerBioindicadores()
  if (!items.length) return null

  return (
    <Section tone="muted">
      <Container>
        {(titulo || bajada) && (
          <div className="mx-auto mb-14 max-w-2xl text-center">
            {titulo && <Heading level={2}>{titulo}</Heading>}
            {bajada && (
              <Text tone="lead" className="mt-4">
                {bajada}
              </Text>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const imagen = esPoblado(item.imagen) ? item.imagen : null
            const senal = SENAL[item.condicion] ?? SENAL.buena

            return (
              <Card key={item.id} className="group flex flex-col overflow-hidden p-0">
                {imagen?.url ? (
                  <div className="relative aspect-4/3 bg-navy-950">
                    <Image
                      src={imagen.url}
                      alt={imagen.alt}
                      fill
                      className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
                    />
                  </div>
                ) : null}

                <div className={cn('flex flex-1 flex-col border-t-4 p-6', senal.borde)}>
                  <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                    {GRUPO[item.grupo] ?? item.grupo}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">
                    {item.nombre}
                    {item.nombreCientifico ? (
                      <span className="ml-1.5 text-sm font-normal italic text-foreground/60">
                        {item.nombreCientifico}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">
                    {item.queIndica}
                  </p>
                  <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-foreground/60">
                    <span className={cn('size-1.5 rounded-full', senal.punto)} aria-hidden />
                    {senal.etiqueta}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
