import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Field } from '@/components/ui/Field'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { registrarCuenta } from '../actions'

export default async function RegistroPage(props: PageProps<'/cuenta/registro'>) {
  const { error } = await props.searchParams

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section>
          <Container className="max-w-md">
            <Heading level={2}>Crear cuenta</Heading>
            <Text tone="muted" className="mt-2">
              La necesitas para inscribirte a cursos y pedir consultoría.
            </Text>

            {error ? (
              <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <form action={registrarCuenta} className="mt-8 space-y-5">
              <Field label="Nombre completo" name="nombre" required autoComplete="name" />
              <Field label="Email" name="email" type="email" required autoComplete="email" />
              <Field label="Teléfono (opcional)" name="telefono" autoComplete="tel" />
              <Field
                label="Contraseña"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <Button type="submit" size="lg" className="w-full">
                Crear cuenta
              </Button>
            </form>

            <Text tone="muted" className="mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/cuenta/ingresar" className="text-brand-700 underline">
                Ingresa aquí
              </Link>
              .
            </Text>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
