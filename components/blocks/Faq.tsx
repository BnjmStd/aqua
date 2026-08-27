import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import type { BloqueDeTipo } from './types'

export function Faq({ titulo, preguntas }: BloqueDeTipo<'faq'>) {
  if (!preguntas?.length) return null

  return (
    <Section tone="muted">
      <Container className="max-w-3xl">
        {titulo ? (
          <Heading level={2} className="mb-10 text-center">
            {titulo}
          </Heading>
        ) : null}

        <div className="divide-y divide-slate-200">
          {preguntas.map((item) => (
            <details key={item.id ?? item.pregunta} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {item.pregunta}
                <span
                  aria-hidden
                  className="shrink-0 text-brand-700 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="mt-3 text-foreground/80 [&_p]:mt-2 [&_p]:leading-relaxed">
                <RichText data={item.respuesta} />
              </div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  )
}
