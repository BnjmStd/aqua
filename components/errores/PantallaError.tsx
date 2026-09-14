import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'

type PantallaErrorProps = {
  /** Numero grande de fondo: "404", "500". */
  codigo: string
  /** Rotulo corto sobre el titulo. */
  etiqueta: string
  titulo: string
  descripcion: string
  /** Botones de salida. */
  acciones: ReactNode
  /** Identificador para cruzar con los logs del servidor (`error.digest`). */
  referencia?: string
}

/**
 * Pantalla comun a todas las paginas de error. Es presentacional y sin hooks
 * para que la usen por igual not-found (Server Component) y error /
 * global-error (Client Components).
 */
export function PantallaError({
  codigo,
  etiqueta,
  titulo,
  descripcion,
  acciones,
  referencia,
}: PantallaErrorProps) {
  return (
    <Section textura className="flex flex-1 items-center overflow-hidden">
      <Container className="relative text-center">
        <p
          aria-hidden
          className="pointer-events-none font-serif text-[9rem] leading-none font-semibold text-navy-100 select-none sm:text-[13rem]"
        >
          {codigo}
        </p>
        <p className="-mt-6 font-mono text-xs tracking-[0.2em] text-brand-600 uppercase sm:-mt-10">
          {etiqueta}
        </p>
        <Heading level={2} as="h1" className="mt-4">
          {titulo}
        </Heading>
        <Text tone="lead" className="mx-auto mt-4 max-w-xl">
          {descripcion}
        </Text>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">{acciones}</div>
        {referencia ? (
          <p className="mt-8 font-mono text-xs text-foreground/50">Referencia: {referencia}</p>
        ) : null}
      </Container>
    </Section>
  )
}
