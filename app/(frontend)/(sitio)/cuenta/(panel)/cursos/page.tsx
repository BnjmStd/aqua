import Link from 'next/link'

import { ETIQUETA_MODALIDAD } from '@/components/academy/etiquetas'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { tieneAula } from '@/access/aula'
import { exigirCuenta } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { esPoblado } from '@/lib/relaciones'
import type { Convocatoria, Curso, Inscripcione } from '@/payload-types'
import { obtenerMisInscripciones } from '@/queries/cuenta/inscripciones'

// Las fechas se guardan en UTC: sin zona explicita el servidor mostraria la hora mal.
const ZONA = 'America/Santiago'
const FORMATO_DIA = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA })
const FORMATO_DIA_CORTO = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', timeZone: ZONA })
const FORMATO_SESION = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: ZONA,
})

const DIA_MS = 86_400_000

type Etapa = 'en_curso' | 'proximo' | 'finalizado'

type CursoDeCuenta = {
  inscripcion: Inscripcione
  convocatoria: Convocatoria
  curso: Curso | null
  etapa: Etapa
  inicio: number
  fin: number
  sesiones: { fecha: number; duracionHoras?: number | null; tema?: string | null }[]
  sesionesPasadas: number
  ahora: number
}

/**
 * Ordena las inscripciones por etapa segun las fechas de la convocatoria.
 * El fin es `fechaTermino`, o la ultima sesion, o el mismo dia de inicio.
 * Canceladas y con asistencia ya registrada van directo a finalizados.
 */
function clasificar(inscripciones: Inscripcione[]): CursoDeCuenta[] {
  const ahora = Date.now()

  return inscripciones.flatMap((inscripcion) => {
    if (!esPoblado(inscripcion.convocatoria)) return []
    const convocatoria = inscripcion.convocatoria
    const curso = esPoblado(convocatoria.curso) ? convocatoria.curso : null

    const sesiones = (convocatoria.sesiones ?? [])
      .map((sesion) => ({ ...sesion, fecha: new Date(sesion.fecha).getTime() }))
      .sort((a, b) => a.fecha - b.fecha)
    const inicio = new Date(convocatoria.fechaInicio).getTime()
    const ultimaSesion = sesiones.at(-1)
    const fin = convocatoria.fechaTermino
      ? new Date(convocatoria.fechaTermino).getTime()
      : ultimaSesion
        ? ultimaSesion.fecha
        : inicio
    // Se da por terminado al final del dia de la ultima jornada.
    const finDelDia = fin + DIA_MS

    const cerrada = ['cancelada', 'asistio', 'no_asistio'].includes(inscripcion.estadoInscripcion)
    const etapa: Etapa = cerrada || ahora > finDelDia ? 'finalizado' : ahora >= inicio ? 'en_curso' : 'proximo'

    return [
      {
        inscripcion,
        convocatoria,
        curso,
        etapa,
        inicio,
        fin,
        sesiones,
        sesionesPasadas: sesiones.filter((sesion) => sesion.fecha <= ahora).length,
        ahora,
      },
    ]
  })
}

function rangoFechas(inicio: number, fin: number) {
  const mismoDia = FORMATO_DIA.format(inicio) === FORMATO_DIA.format(fin)
  return mismoDia ? FORMATO_DIA.format(inicio) : `${FORMATO_DIA_CORTO.format(inicio)} al ${FORMATO_DIA.format(fin)}`
}

function textoFaltan(desde: number, hasta: number) {
  const diasRestantes = Math.ceil((hasta - desde) / DIA_MS)
  if (diasRestantes <= 1) return 'Empieza mañana'
  return `Empieza en ${diasRestantes} días`
}

const ESTADO_VISIBLE: Partial<Record<Inscripcione['estadoInscripcion'], { texto: string; clase: string }>> = {
  pendiente: { texto: 'Pendiente de confirmación', clase: 'bg-amber-50 text-amber-800' },
  lista_espera: { texto: 'En lista de espera', clase: 'bg-amber-50 text-amber-800' },
  asistio: { texto: 'Completado', clase: 'bg-lime/30 text-navy-800' },
  no_asistio: { texto: 'No asististe', clase: 'bg-slate-100 text-slate-600' },
  cancelada: { texto: 'Cancelada', clase: 'bg-slate-100 text-slate-600' },
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-foreground/50">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  )
}

function TarjetaCurso({ item, nombreCuenta }: { item: CursoDeCuenta; nombreCuenta: string }) {
  const { inscripcion, convocatoria, curso, etapa, inicio, fin, sesiones, sesionesPasadas, ahora } = item
  const titulo = curso?.titulo ?? convocatoria.titulo
  const estado = ESTADO_VISIBLE[inscripcion.estadoInscripcion]
  const lugar = convocatoria.lugar
  const relatores = (convocatoria.relatores ?? []).filter(esPoblado).map((persona) => persona.nombre)
  const proximaSesion = sesiones.find((sesion) => sesion.fecha > ahora)
  const paraOtraPersona = inscripcion.participanteNombre.trim() !== nombreCuenta.trim()
  const pagoPendiente = inscripcion.pago.estadoPago === 'pendiente' || inscripcion.pago.estadoPago === 'parcial'
  const atenuada = etapa === 'finalizado' && inscripcion.estadoInscripcion !== 'asistio'

  const donde =
    convocatoria.modalidad === 'online_vivo' || convocatoria.modalidad === 'elearning'
      ? lugar?.plataforma ?? 'Online'
      : [lugar?.sede, lugar?.direccion, lugar?.ciudad].filter(Boolean).join(', ')

  return (
    <Card className={cn('p-5 hover:shadow-soft sm:p-6', atenuada && 'opacity-75')}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{ETIQUETA_MODALIDAD[convocatoria.modalidad]}</Badge>
        {estado ? <Badge className={estado.clase}>{estado.texto}</Badge> : null}
        {etapa === 'proximo' ? (
          <span className="text-xs font-medium text-brand-700">{textoFaltan(ahora, inicio)}</span>
        ) : null}
      </div>

      <h3 className="mt-3 font-serif text-xl font-semibold text-navy-800">
        {curso?.slug ? (
          <Link href={`/academia/cursos/${curso.slug}`} className="hover:text-brand-700">
            {titulo}
          </Link>
        ) : (
          titulo
        )}
      </h3>
      {paraOtraPersona ? (
        <p className="mt-1 text-sm text-foreground/60">Inscribiste a {inscripcion.participanteNombre}</p>
      ) : null}

      {etapa === 'en_curso' && sesiones.length ? (
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-foreground">
              Sesión {Math.max(sesionesPasadas, 1)} de {sesiones.length}
            </span>
            <span className="text-foreground/50">{Math.round((sesionesPasadas / sesiones.length) * 100)}%</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-brand-50"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={sesiones.length}
            aria-valuenow={sesionesPasadas}
            aria-label="Avance del curso"
          >
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(sesionesPasadas / sesiones.length) * 100}%` }} />
          </div>
        </div>
      ) : null}

      {proximaSesion && etapa !== 'finalizado' ? (
        <div className="mt-5 rounded-md border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-brand-700">
            {etapa === 'en_curso' ? 'Próxima sesión' : 'Primera sesión'}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground first-letter:uppercase">
            {FORMATO_SESION.format(proximaSesion.fecha)}
          </p>
          {proximaSesion.tema ? <p className="text-sm text-foreground/70">{proximaSesion.tema}</p> : null}
        </div>
      ) : null}

      <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Dato etiqueta="Fechas">{rangoFechas(inicio, fin)}</Dato>
        {donde ? <Dato etiqueta={convocatoria.modalidad === 'online_vivo' ? 'Plataforma' : 'Lugar'}>{donde}</Dato> : null}
        {curso?.duracionHoras ? <Dato etiqueta="Duración">{curso.duracionHoras} horas</Dato> : null}
        {relatores.length ? (
          <Dato etiqueta={relatores.length === 1 ? 'Relator' : 'Relatores'}>{relatores.join(', ')}</Dato>
        ) : null}
      </dl>

      {inscripcion.estadoInscripcion === 'asistio' && curso?.certificacion ? (
        <p className="mt-5 rounded-md bg-lime/20 px-4 py-3 text-sm text-navy-800">
          <span className="font-medium">Certificación:</span> {curso.certificacion}
        </p>
      ) : null}

      {pagoPendiente && etapa !== 'finalizado' ? (
        <p className="mt-5 text-sm text-amber-800">
          Tiene un pago pendiente.{' '}
          <Link href="/cuenta/compras" className="font-medium underline">
            Ver en Mis compras
          </Link>
        </p>
      ) : null}

      {/* El calendario completo, el material y la asistencia viven en el aula. */}
      {inscripcion.estadoInscripcion !== 'cancelada' ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-foreground/50">
            {tieneAula(inscripcion)
              ? `${sesiones.length} ${sesiones.length === 1 ? 'sesión' : 'sesiones'} · material, grabaciones y asistencia`
              : 'El aula se habilita al confirmar la inscripción'}
          </p>
          <Button
            href={`/cuenta/cursos/${inscripcion.id}`}
            variant={tieneAula(inscripcion) && etapa !== 'finalizado' ? 'primario' : 'secundario'}
            size="sm"
          >
            {tieneAula(inscripcion) ? 'Entrar al curso' : 'Ver detalle'}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

function Grupo({ titulo, items, nombreCuenta }: { titulo: string; items: CursoDeCuenta[]; nombreCuenta: string }) {
  if (!items.length) return null
  return (
    <section className="mt-10 first:mt-8">
      <Heading level={4} as="h3">
        {titulo}
      </Heading>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <TarjetaCurso key={item.inscripcion.id} item={item} nombreCuenta={nombreCuenta} />
        ))}
      </div>
    </section>
  )
}

export default async function MisCursosPage() {
  const cuenta = await exigirCuenta('/cuenta/cursos')
  const cursos = clasificar(await obtenerMisInscripciones(cuenta.id))

  const enCurso = cursos.filter((item) => item.etapa === 'en_curso').sort((a, b) => a.fin - b.fin)
  const proximos = cursos.filter((item) => item.etapa === 'proximo').sort((a, b) => a.inicio - b.inicio)
  const finalizados = cursos.filter((item) => item.etapa === 'finalizado').sort((a, b) => b.fin - a.fin)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Heading level={2}>Mis cursos</Heading>
        <Button href="/academia/cursos" variant="secundario" size="sm">
          Ver más cursos
        </Button>
      </div>
      <Text tone="muted" className="mt-2">
        Fechas, sesiones y avance de los cursos a los que te inscribiste.
      </Text>

      {cursos.length ? (
        <div>
          <Grupo titulo="En curso" items={enCurso} nombreCuenta={cuenta.nombre} />
          <Grupo titulo="Próximos" items={proximos} nombreCuenta={cuenta.nombre} />
          <Grupo titulo="Finalizados" items={finalizados} nombreCuenta={cuenta.nombre} />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            titulo="Aún no tienes cursos"
            descripcion="Explora el catálogo y anótate cuando encuentres uno que te sirva."
            accion={
              <Button href="/academia/cursos" size="sm">
                Ver cursos
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
