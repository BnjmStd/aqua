import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Icono } from '@/components/ui/iconos'
import type { NombreIcono } from '@/fields/iconos'
import { UNIDADES, type Unidad } from '@/fields/unidad'
import type { BloqueDeTipo } from './types'

const ICONO_UNIDAD: Record<Unidad, NombreIcono> = {
  consulting: 'lupa',
  academy: 'birrete',
  technologies: 'chip',
  insights: 'documento',
  rnd: 'matraz',
}

/** Los labels de UNIDADES traen el descriptor tras un guion largo: lo cortamos. */
const NOMBRE_UNIDAD = Object.fromEntries(
  UNIDADES.map(({ label, value }) => [value, label.split(' — ')[0]]),
) as Record<Unidad, string>

export function Unidades({ titulo, bajada, tarjetas }: BloqueDeTipo<'unidades'>) {
  if (!tarjetas?.length) return null

  return (
    <Section>
      <Container>
        {(titulo || bajada) && (
          <div className="mx-auto mb-16 max-w-3xl text-center">
            {titulo && <Heading level={2}>{titulo}</Heading>}
            {bajada && (
              <Text tone="lead" className="mt-4">
                {bajada}
              </Text>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tarjetas.map((tarjeta) => {
            const unidad = tarjeta.unidad

            return (
              // La tarjeta entera es el enlace a la pagina de la unidad: la
              // maqueta no lo hace, pero cada tarjeta ya nombra una seccion que
              // existe en el sitio y dejarla muerta seria peor.
              <Link
                key={tarjeta.id ?? unidad}
                href={`/${unidad}`}
                className="group rounded-lg border border-border bg-surface p-8 shadow-soft transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="text-brand-700">
                  <Icono nombre={ICONO_UNIDAD[unidad]} />
                </span>
                <Heading level={4} as="h3" className="mt-4">
                  {NOMBRE_UNIDAD[unidad]}
                </Heading>
                <Text className="mt-3">{tarjeta.descripcion}</Text>
              </Link>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
