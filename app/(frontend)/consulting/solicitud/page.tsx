import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Field } from '@/components/ui/Field'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Textarea } from '@/components/ui/Textarea'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { obtenerCuentaActual } from '@/lib/auth'
import { obtenerServiciosPublicados } from '@/queries/consulting/servicios'
import { crearSolicitud } from './actions'

export default async function SolicitudConsultingPage(props: PageProps<'/consulting/solicitud'>) {
  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect('/cuenta/ingresar?redirect=/consulting/solicitud')

  const { error } = await props.searchParams
  const servicios = await obtenerServiciosPublicados()

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section>
          <Container className="max-w-md">
            <Heading level={2}>Solicitar consultoría</Heading>
            <Text tone="muted" className="mt-2">
              Cuéntanos qué necesitas y te contactamos.
            </Text>

            {error ? (
              <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <form action={crearSolicitud} className="mt-8 space-y-5">
              <div>
                <label htmlFor="servicio" className="text-sm font-medium text-foreground">
                  Servicio de interés (opcional)
                </label>
                <select
                  id="servicio"
                  name="servicio"
                  className="mt-1.5 h-11 w-full rounded-md border border-slate-300 bg-background px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <option value="">No estoy seguro todavía</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <Field label="Empresa donde trabaja (opcional)" name="empresa" autoComplete="organization" />

              <div>
                <label htmlFor="mensaje" className="text-sm font-medium text-foreground">
                  Cuéntanos qué necesitas
                </label>
                <Textarea id="mensaje" name="mensaje" required rows={5} className="mt-1.5" />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Enviar solicitud
              </Button>
            </form>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
