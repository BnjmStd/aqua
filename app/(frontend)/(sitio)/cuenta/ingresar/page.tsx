import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { FormularioIngreso } from './FormularioIngreso'

export default async function IngresarPage(props: PageProps<'/cuenta/ingresar'>) {
  const { redirect: redirectTo } = await props.searchParams

  return (
    <Section>
      <Container className="max-w-md">
        <Heading level={2}>Ingresar</Heading>
        <Text tone="muted" className="mt-2">
          Con tu cuenta ves tus inscripciones y solicitudes de consultoría.
        </Text>

        <FormularioIngreso redirectTo={typeof redirectTo === 'string' ? redirectTo : undefined} />

        <Text tone="muted" className="mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/cuenta/registro" className="text-brand-700 underline">
            Regístrate aquí
          </Link>
          .
        </Text>
      </Container>
    </Section>
  )
}
