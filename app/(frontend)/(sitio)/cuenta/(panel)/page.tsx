import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { exigirCuenta } from '@/lib/auth'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'
import { obtenerMisInscripciones } from '@/queries/cuenta/inscripciones'
import { obtenerMisSolicitudes } from '@/queries/cuenta/solicitudes'
import { ItemInscripcion, ItemSolicitud, inscripcionActiva, proximaInscripcion, solicitudAbierta } from './items'

export default async function ResumenCuentaPage() {
  const cuenta = await exigirCuenta('/cuenta')

  const [inscripciones, solicitudes, sitio] = await Promise.all([
    obtenerMisInscripciones(cuenta.id),
    obtenerMisSolicitudes(cuenta.id),
    obtenerConfiguracionSitio(),
  ])
  const mailtoConsultoria = rutaContacto(correoParaMotivo(sitio), 'consultoria')

  const activas = inscripciones.filter(inscripcionActiva)
  const abiertas = solicitudes.filter(solicitudAbierta)

  const proxima = proximaInscripcion(activas)
  const faltaCompletarDatos = !cuenta.telefono || !cuenta.rut
  const ultimaSolicitud = solicitudes[0]
  // Sale de las inscripciones ya cargadas: no hace falta la query de compras.
  const pagosPendientes = inscripciones.filter(
    (inscripcion) => inscripcion.pago.estadoPago === 'pendiente' || inscripcion.pago.estadoPago === 'parcial',
  ).length

  return (
    <div>
      <Heading level={2}>Hola, {cuenta.nombre.split(' ')[0]}</Heading>
      <Text tone="muted" className="mt-2">
        Aquí ves el estado de tus cursos y solicitudes.
      </Text>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/cuenta/cursos" className="group block">
          <Card className="h-full p-5 group-hover:shadow-md">
            <p className="font-serif text-4xl font-semibold text-navy-800">{activas.length}</p>
            <p className="mt-1 text-sm text-foreground/70">
              {activas.length === 1 ? 'Curso activo' : 'Cursos activos'}
            </p>
          </Card>
        </Link>
        <Link href="/cuenta/solicitudes" className="group block">
          <Card className="h-full p-5 group-hover:shadow-md">
            <p className="font-serif text-4xl font-semibold text-navy-800">{abiertas.length}</p>
            <p className="mt-1 text-sm text-foreground/70">
              {abiertas.length === 1 ? 'Solicitud en curso' : 'Solicitudes en curso'}
            </p>
          </Card>
        </Link>
      </div>

      {pagosPendientes ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            {pagosPendientes === 1 ? 'Tienes 1 pago pendiente.' : `Tienes ${pagosPendientes} pagos pendientes.`}
          </p>
          <Button href="/cuenta/compras" variant="secundario" size="sm" className="shrink-0 bg-surface">
            Ver mis compras
          </Button>
        </div>
      ) : null}

      {faltaCompletarDatos ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-brand-200 bg-brand-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-brand-900">
            Completa tu teléfono y RUT para que inscribirte a un curso sea más rápido.
          </p>
          <Button href="/cuenta/datos" variant="secundario" size="sm" className="shrink-0 bg-surface">
            Completar datos
          </Button>
        </div>
      ) : null}

      <div className="mt-10">
        <Heading level={4} as="h3">
          Tu próximo curso
        </Heading>
        <div className="mt-4">
          {proxima ? (
            <ItemInscripcion inscripcion={proxima} />
          ) : (
            <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground/70">No tienes cursos agendados por ahora.</p>
              <Button href="/academia/cursos" size="sm" className="shrink-0">
                Ver cursos
              </Button>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-10">
        <Heading level={4} as="h3">
          Última solicitud de consultoría
        </Heading>
        <div className="mt-4">
          {ultimaSolicitud ? (
            <ItemSolicitud solicitud={ultimaSolicitud} />
          ) : (
            <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground/70">¿Necesitas una asesoría o auditoría? Cuéntanos qué necesitas.</p>
              <Button href={mailtoConsultoria} size="sm" className="shrink-0">
                Solicitar consultoría
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
