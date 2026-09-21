import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { FormularioRegistro } from './FormularioRegistro'

export default function RegistroPage() {
  return (
    <Section>
      <Container className="max-w-md">
        <Heading level={2}>Crear cuenta</Heading>
        <Text tone="muted" className="mt-2">
          La necesitas para inscribirte a cursos y pedir consultoría.
        </Text>

        <FormularioRegistro />

        <Text tone="muted" className="mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/cuenta/ingresar" className="text-brand-700 underline">
            Ingresa aquí
          </Link>
          .
        </Text>
      </Container>
    </Section>
  )
}
