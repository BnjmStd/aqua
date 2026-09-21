import { BotonMarcarTodas } from '@/components/cuenta/BotonMarcarTodas'
import { ItemNotificacion } from '@/components/cuenta/ItemNotificacion'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { exigirCuenta } from '@/lib/auth'
import { obtenerNotificaciones } from '@/queries/cuenta/notificaciones'

export default async function NotificacionesPage() {
  const cuenta = await exigirCuenta('/cuenta/notificaciones')
  const notificaciones = await obtenerNotificaciones({ coleccion: 'cuentas', id: cuenta.id })
  const noLeidas = notificaciones.filter((notificacion) => !notificacion.leidaEl).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Heading level={2}>Notificaciones</Heading>
        {noLeidas ? <BotonMarcarTodas /> : null}
      </div>
      <Text tone="muted" className="mt-2">
        Avisos de tus cursos, pagos y solicitudes.
      </Text>

      <div className="mt-8">
        {notificaciones.length ? (
          <ul className="space-y-2">
            {notificaciones.map((notificacion) => (
              <ItemNotificacion key={notificacion.id} notificacion={notificacion} />
            ))}
          </ul>
        ) : (
          <EmptyState
            titulo="No tienes notificaciones"
            descripcion="Aquí te vamos a avisar cuando pase algo con tus cursos, pagos o solicitudes."
          />
        )}
      </div>
    </div>
  )
}
