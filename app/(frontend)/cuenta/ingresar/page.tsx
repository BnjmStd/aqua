import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Field } from '@/components/ui/Field'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { iniciarSesion } from '../actions'

export default async function IngresarPage(props: PageProps<'/cuenta/ingresar'>) {
  const { error, redirect: redirectTo } = await props.searchParams

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section>
          <Container className="max-w-md">
            <Heading level={2}>Ingresar</Heading>
            <Text tone="muted" className="mt-2">
              Con tu cuenta ves tus inscripciones y solicitudes de consultoría.
            </Text>

            {error ? (
              <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <form action={iniciarSesion} className="mt-8 space-y-5">
              {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
              <Field label="Email" name="email" type="email" required autoComplete="email" />
              <Field
                label="Contraseña"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
              <Button type="submit" size="lg" className="w-full">
                Ingresar
              </Button>
            </form>

            <Text tone="muted" className="mt-6">
              ¿No tienes cuenta?{' '}
              <Link href="/cuenta/registro" className="text-brand-700 underline dark:text-brand-300">
                Regístrate aquí
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
