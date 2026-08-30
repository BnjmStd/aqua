import type { Metadata } from 'next'

import { ConvocatoriaCard } from '@/components/academy/ConvocatoriaCard'
import { CourseCatalog } from '@/components/academy/CourseCatalog'
import { Cta } from '@/components/blocks/Cta'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { RutaAprendizaje } from '@/components/ui/RutaAprendizaje'
import { Section } from '@/components/ui/Section'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { obtenerCursosPublicados } from '@/queries/academy/cursos'
import { obtenerProximasConvocatorias } from '@/queries/academy/convocatorias'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Academy | aquabioprocess.cl',
  description:
    'Capacitación técnica en tratamiento de aguas, procesos biológicos y operación de plantas.',
}

export default async function AcademyPage() {
  const [convocatorias, cursos, sitio] = await Promise.all([
    obtenerProximasConvocatorias(3),
    obtenerCursosPublicados(),
    obtenerConfiguracionSitio(),
  ])
  const email = correoParaMotivo(sitio)

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <HeroBanner
          titulo="Academy"
          bajada="Cursos in-company, talleres y coaching para operadores, técnicos, ingenieros y supervisores. Transferencia de conocimiento como parte de cada intervención."
          imagen={{
            url: '/hero-academy.jpg',
            alt: 'Vista cenital de una parrilla de difusores en operación en un reactor biológico de lodos activados.',
          }}
          acciones={[
            { texto: 'Ver cursos', enlace: '/academy/cursos', estilo: 'primario' },
            { texto: 'Hablar con un asesor', enlace: rutaContacto(email, 'asesor'), estilo: 'secundario' },
          ]}
          aside={<RutaAprendizaje className="mx-auto lg:ml-auto" />}
        />

        <Section textura>
          <Container className="relative">
            <div className="flex items-end justify-between gap-4">
              <Heading level={2}>Próximas convocatorias</Heading>
              <Button href="/academy/cursos" variant="ghost" size="sm">
                Ver todos los cursos →
              </Button>
            </div>

            <div className="mt-10">
              {convocatorias.length ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {convocatorias.map((convocatoria) => (
                    <ConvocatoriaCard key={convocatoria.id} convocatoria={convocatoria} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  titulo="Sin convocatorias abiertas por ahora"
                  descripcion="Revisa el catálogo completo o conversa con nosotros sobre un curso cerrado para tu equipo."
                  accion={
                    <Button href="/academy/cursos" variant="secundario" size="sm">
                      Ver catálogo de cursos
                    </Button>
                  }
                />
              )}
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container>
            <Heading level={2}>Catálogo de cursos</Heading>
            <div className="mt-10">
              <CourseCatalog cursos={cursos.slice(0, 3)} />
            </div>
            {cursos.length > 3 ? (
              <div className="mt-10 text-center">
                <Button href="/academy/cursos" variant="secundario">
                  Ver todos los cursos
                </Button>
              </div>
            ) : null}
          </Container>
        </Section>

        <Cta
          blockType="cta"
          titulo="¿Necesitas un curso cerrado para tu equipo?"
          texto="Adaptamos programa, horas y modalidad a la operación de tu empresa."
          textoBoton="Escríbenos"
          enlace={rutaContacto(email, 'academy')}
        />
      </main>
      <Footer />
    </div>
  )
}
