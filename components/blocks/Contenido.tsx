import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container } from '@/components/ui/Container'
import { richTextClassName } from '@/components/ui/richTextClassName'
import { Section } from '@/components/ui/Section'
import type { BloqueDeTipo } from './types'

export function Contenido({ texto }: BloqueDeTipo<'contenido'>) {
  return (
    <Section>
      <Container className={`max-w-3xl ${richTextClassName}`}>
        <RichText data={texto} />
      </Container>
    </Section>
  )
}
