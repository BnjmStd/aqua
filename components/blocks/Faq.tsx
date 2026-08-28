import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container } from '@/components/ui/Container'
import { FaqLista } from '@/components/ui/FaqLista'
import { Heading } from '@/components/ui/Heading'
import { MicrobioAmbiente } from '@/components/ui/MicrobioAmbiente'
import { Section } from '@/components/ui/Section'
import type { BloqueDeTipo } from './types'

export function Faq({ titulo, preguntas }: BloqueDeTipo<'faq'>) {
  if (!preguntas?.length) return null

  return (
    <Section tone="muted" className="relative overflow-hidden">
      <MicrobioAmbiente />
      <Container className="relative z-10 max-w-3xl">
        {titulo ? (
          <Heading level={2} className="mb-10 text-center">
            {titulo}
          </Heading>
        ) : null}

        <FaqLista
          items={preguntas.map((item) => ({
            id: item.id ?? item.pregunta,
            pregunta: item.pregunta,
            // RichText se renderiza en el servidor y viaja como nodo ya listo:
            // asi no entra al bundle del cliente.
            respuesta: <RichText data={item.respuesta} />,
          }))}
        />
      </Container>
    </Section>
  )
}
