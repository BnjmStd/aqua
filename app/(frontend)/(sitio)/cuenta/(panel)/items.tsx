import Link from 'next/link'

import { ETIQUETA_MODALIDAD } from '@/components/academy/etiquetas'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { esPoblado } from '@/lib/relaciones'
import type { Inscripcione, SolicitudesConsulting } from '@/payload-types'

export const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

const ETIQUETA_ESTADO_INSCRIPCION: Record<Inscripcione['estadoInscripcion'], string> = {
  pendiente: 'Pendiente de confirmación',
  confirmada: 'Confirmada',
  lista_espera: 'En lista de espera',
  asistio: 'Asistió',
  no_asistio: 'No asistió',
  cancelada: 'Cancelada',
}

const ETIQUETA_ESTADO_SOLICITUD: Record<SolicitudesConsulting['estado'], string> = {
  nueva: 'Recibida',
  contactada: 'Te contactamos',
  cotizando: 'Cotizando',
  ganada: 'Aceptada',
  perdida: 'Cerrada',
}

/** Estados que ya no requieren nada del usuario: van en gris. */
const INSCRIPCION_CERRADA = new Set<Inscripcione['estadoInscripcion']>(['asistio', 'no_asistio', 'cancelada'])
const SOLICITUD_CERRADA = new Set<SolicitudesConsulting['estado']>(['ganada', 'perdida'])

export const inscripcionActiva = (inscripcion: Inscripcione) => !INSCRIPCION_CERRADA.has(inscripcion.estadoInscripcion)
export const solicitudAbierta = (solicitud: SolicitudesConsulting) => !SOLICITUD_CERRADA.has(solicitud.estado)

const inicioConvocatoria = (inscripcion: Inscripcione) =>
  esPoblado(inscripcion.convocatoria) ? new Date(inscripcion.convocatoria.fechaInicio).getTime() : null

/** La inscripcion cuya convocatoria empieza antes, contando desde ahora. */
export function proximaInscripcion(inscripciones: Inscripcione[]) {
  const ahora = Date.now()
  return inscripciones
    .filter((inscripcion) => (inicioConvocatoria(inscripcion) ?? -1) >= ahora)
    .sort((a, b) => inicioConvocatoria(a)! - inicioConvocatoria(b)!)[0]
}

const BADGE_CERRADO ='bg-slate-100 text-slate-600'

export function ItemInscripcion({ inscripcion }: { inscripcion: Inscripcione }) {
  const convocatoria = esPoblado(inscripcion.convocatoria) ? inscripcion.convocatoria : null
  const curso = convocatoria && esPoblado(convocatoria.curso) ? convocatoria.curso : null
  const titulo = curso?.titulo ?? convocatoria?.titulo ?? 'Convocatoria'
  const detalle = [
    convocatoria ? FORMATO_FECHA.format(new Date(convocatoria.fechaInicio)) : null,
    convocatoria ? ETIQUETA_MODALIDAD[convocatoria.modalidad] : null,
    convocatoria?.lugar?.ciudad ?? convocatoria?.lugar?.plataforma,
  ].filter(Boolean)

  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {curso?.slug ? (
          <Link href={`/academia/cursos/${curso.slug}`} className="font-medium text-foreground hover:text-brand-700">
            {titulo}
          </Link>
        ) : (
          <p className="font-medium text-foreground">{titulo}</p>
        )}
        {detalle.length ? <p className="mt-1 text-sm text-foreground/60">{detalle.join(' · ')}</p> : null}
        <p className="mt-1 text-xs text-foreground/50">Participante: {inscripcion.participanteNombre}</p>
      </div>
      <Badge className={cn('self-start sm:self-center', !inscripcionActiva(inscripcion) && BADGE_CERRADO)}>
        {ETIQUETA_ESTADO_INSCRIPCION[inscripcion.estadoInscripcion]}
      </Badge>
    </Card>
  )
}

export function ItemSolicitud({ solicitud }: { solicitud: SolicitudesConsulting }) {
  const servicio = esPoblado(solicitud.servicio) ? solicitud.servicio : null

  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{servicio?.titulo ?? 'Consulta general'}</p>
        <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{solicitud.mensaje}</p>
        <p className="mt-1 text-xs text-foreground/50">Enviada el {FORMATO_FECHA.format(new Date(solicitud.createdAt))}</p>
      </div>
      <Badge className={cn('self-start sm:self-center', !solicitudAbierta(solicitud) && BADGE_CERRADO)}>
        {ETIQUETA_ESTADO_SOLICITUD[solicitud.estado]}
      </Badge>
    </Card>
  )
}
