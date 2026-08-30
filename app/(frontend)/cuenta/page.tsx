import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { obtenerCuentaActual } from '@/lib/auth'
import { esPoblado } from '@/lib/relaciones'
import { obtenerMisInscripciones } from '@/queries/cuenta/inscripciones'
import { obtenerMisSolicitudes } from '@/queries/cuenta/solicitudes'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'
import { cerrarSesion } from './actions'

const ETIQUETA_ESTADO_INSCRIPCION: Record<string, string> = {
  pendiente: 'Pendiente de confirmación',
  confirmada: 'Confirmada',
  lista_espera: 'En lista de espera',
  asistio: 'Asistió',
  no_asistio: 'No asistió',
  cancelada: 'Cancelada',
}

const ETIQUETA_ESTADO_SOLICITUD: Record<string, string> = {
  nueva: 'Nueva',
  contactada: 'Contactada',
  cotizando: 'Cotizando',
  ganada: 'Ganada',
  perdida: 'Perdida',
}

export default async function CuentaPage() {
  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect('/cuenta/ingresar?redirect=/cuenta')

  const [inscripciones, solicitudes, sitio] = await Promise.all([
    obtenerMisInscripciones(cuenta.id),
    obtenerMisSolicitudes(cuenta.id),
    obtenerConfiguracionSitio(),
  ])
  const mailtoConsultoria = rutaContacto(correoParaMotivo(sitio), 'consultoria')

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Section>
          <Container className="max-w-3xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Heading level={2}>Hola, {cuenta.nombre}</Heading>
                <Text tone="muted" className="mt-1">
                  {cuenta.email}
                </Text>
              </div>
              <form action={cerrarSesion}>
                <Button type="submit" variant="secundario" size="sm">
                  Cerrar sesión
                </Button>
              </form>
            </div>

            <div className="mt-12">
              <div className="mb-4 flex items-center justify-between">
                <Heading level={3}>Mis inscripciones</Heading>
                <Button href="/academy/cursos" variant="ghost" size="sm">
                  Ver más cursos
                </Button>
              </div>

              {inscripciones.length ? (
                <div className="space-y-3">
                  {inscripciones.map((inscripcion) => {
                    const convocatoria = esPoblado(inscripcion.convocatoria) ? inscripcion.convocatoria : null
                    return (
                      <Card key={inscripcion.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {convocatoria?.titulo ?? 'Convocatoria'}
                          </p>
                          <p className="mt-1 text-sm text-foreground/60">{inscripcion.participanteNombre}</p>
                        </div>
                        <Badge>{ETIQUETA_ESTADO_INSCRIPCION[inscripcion.estadoInscripcion]}</Badge>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  titulo="Aún no tienes inscripciones"
                  descripcion="Explora el catálogo de cursos y anótate cuando encuentres uno que te sirva."
                  accion={
                    <Button href="/academy/cursos" size="sm">
                      Ver cursos
                    </Button>
                  }
                />
              )}
            </div>

            <div className="mt-12">
              <div className="mb-4 flex items-center justify-between">
                <Heading level={3}>Mis solicitudes de consultoría</Heading>
                <Button href={mailtoConsultoria} variant="ghost" size="sm">
                  Nueva solicitud
                </Button>
              </div>

              {solicitudes.length ? (
                <div className="space-y-3">
                  {solicitudes.map((solicitud) => {
                    const servicio = esPoblado(solicitud.servicio) ? solicitud.servicio : null
                    return (
                      <Card key={solicitud.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{servicio?.titulo ?? 'Consulta general'}</p>
                          <p className="mt-1 line-clamp-1 text-sm text-foreground/60">{solicitud.mensaje}</p>
                        </div>
                        <Badge>{ETIQUETA_ESTADO_SOLICITUD[solicitud.estado]}</Badge>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  titulo="Aún no tienes solicitudes"
                  descripcion="Si necesitas una asesoría o auditoría, cuéntanos qué necesitas."
                  accion={
                    <Button href={mailtoConsultoria} size="sm">
                      Solicitar consultoría
                    </Button>
                  }
                />
              )}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
