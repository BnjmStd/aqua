import type { Metadata } from 'next'

import { CourseCatalog } from '@/components/academy/CourseCatalog'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { obtenerCursosPublicados } from '@/queries/academy/cursos'

export const metadata: Metadata = {
  title: 'Cursos | Academy — aquabioprocess.cl',
  description: 'Capacitación técnica en tratamiento de aguas y procesos biológicos.',
}

export default async function CursosPage() {
  const cursos = await obtenerCursosPublicados()

  return (
    <Section textura>
      <Container className="relative">
        <Heading level={1} className="mb-12">
          Cursos
        </Heading>
        <CourseCatalog cursos={cursos} />
      </Container>
    </Section>
  )
}
