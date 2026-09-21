import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { exigirCuenta } from '@/lib/auth'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'
import { obtenerMisSolicitudes } from '@/queries/cuenta/solicitudes'
import { ItemSolicitud } from '../items'

export default async function MisSolicitudesPage() {
  const cuenta = await exigirCuenta('/cuenta/solicitudes')
  const [solicitudes, sitio] = await Promise.all([obtenerMisSolicitudes(cuenta.id), obtenerConfiguracionSitio()])
  const mailtoConsultoria = rutaContacto(correoParaMotivo(sitio), 'consultoria')

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Heading level={2}>Mis solicitudes</Heading>
        <Button href={mailtoConsultoria} variant="secundario" size="sm">
          Nueva solicitud
        </Button>
      </div>

      <div className="mt-8">
        {solicitudes.length ? (
          <div className="space-y-3">
            {solicitudes.map((solicitud) => (
              <ItemSolicitud key={solicitud.id} solicitud={solicitud} />
            ))}
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
    </div>
  )
}
