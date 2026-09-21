import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ETIQUETA_MODALIDAD } from '@/components/academy/etiquetas'
import { BotonUnirse } from '@/components/cuenta/BotonUnirse'
import { FormularioJustificacion } from '@/components/cuenta/FormularioJustificacion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { exigirCuenta } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { esPoblado } from '@/lib/relaciones'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { urlEmbebible } from '@/lib/video'
import type { Recurso } from '@/payload-types'
import { type Aula, type EstadoAsistencia, type SesionDelAula, obtenerAula } from '@/queries/cuenta/aula'

const ZONA = 'America/Santiago'
const FORMATO_SESION = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: ZONA })
const FORMATO_HORA = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: ZONA })
const FORMATO_DIA = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA })

/** Hora de la request. Fuera del componente: la regla de pureza de React no deja llamar Date.now() en el render. */
const ahoraDeLaRequest = () => Date.now()

// ---------------------------------------------------------------------------
// Piezas

function SeccionAula({ id, titulo, children, accion }: { id: string; titulo: string; children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-28">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Heading level={4} as="h2">
          {titulo}
        </Heading>
        {accion}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

const ESTILO_ASISTENCIA: Record<EstadoAsistencia, { clase: string; simbolo: string; texto: string }> = {
  presente: { clase: 'bg-brand-600 text-white', simbolo: '✓', texto: 'Presente' },
  ausente: { clase: 'bg-red-100 text-red-700', simbolo: '✕', texto: 'Ausente' },
  justificada: { clase: 'bg-slate-200 text-slate-700', simbolo: 'J', texto: 'Inasistencia justificada' },
  sin_registro: { clase: 'border border-border text-foreground/50', simbolo: '–', texto: 'Asistencia sin registrar' },
  futura: { clase: 'border border-border text-foreground/60', simbolo: '', texto: 'Próxima' },
}

/** Los archivos de Recursos vienen con URL absoluta (serverURL): se sirven same-origin. */
const rutaArchivo = (recurso: Recurso) => recurso.url?.replace(/^https?:\/\/[^/]+/i, '') ?? null

function pesoLegible(bytes?: number | null) {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

function extension(recurso: Recurso) {
  return recurso.filename?.split('.').pop()?.toUpperCase() ?? null
}

function IconoRecurso({ tipo }: { tipo: 'archivo' | 'enlace' | 'video' }) {
  const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0 text-brand-700">
      {tipo === 'archivo' ? (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...trazo} />
          <path d="M14 3v5h5M9 13h6M9 17h4" {...trazo} />
        </>
      ) : tipo === 'video' ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" {...trazo} />
          <path d="m10 9 5 3-5 3z" {...trazo} />
        </>
      ) : (
        <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" {...trazo} />
      )}
    </svg>
  )
}

/** Fila de material o lectura: descarga el archivo o abre el enlace. */
function ItemRecurso({ recurso }: { recurso: Recurso }) {
  const archivo = rutaArchivo(recurso)
  const href = archivo ?? recurso.enlace
  if (!href) return null
  const detalle = archivo ? [extension(recurso), pesoLegible(recurso.filesize)].filter(Boolean).join(' · ') : new URL(href).hostname.replace(/^www\./, '')

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...(archivo ? { download: recurso.filename ?? true } : {})}
      className="group flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-brand-50"
    >
      <IconoRecurso tipo={archivo ? 'archivo' : 'enlace'} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground group-hover:text-brand-700">
          {recurso.titulo}
          {recurso.tipo === 'lectura' ? <span className="ml-2 text-xs font-normal text-foreground/50">Lectura</span> : null}
        </span>
        {recurso.descripcion ? <span className="block text-xs text-foreground/60">{recurso.descripcion}</span> : null}
      </span>
      <span className="shrink-0 text-xs text-foreground/50">{detalle}</span>
    </a>
  )
}

/** Grabacion: reproductor embebido si es Vimeo/YouTube; si no, enlace. */
function Grabacion({ recurso }: { recurso: Recurso }) {
  if (!recurso.enlace) return <ItemRecurso recurso={recurso} />
  const embebible = urlEmbebible(recurso.enlace)

  if (!embebible) {
    return (
      <a href={recurso.enlace} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-brand-50">
        <IconoRecurso tipo="video" />
        <span className="text-sm font-medium text-foreground group-hover:text-brand-700">{recurso.titulo}</span>
      </a>
    )
  }

  return (
    <details className="group rounded-md">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-2.5 hover:bg-brand-50 [&::-webkit-details-marker]:hidden">
        <IconoRecurso tipo="video" />
        <span className="flex-1 text-sm font-medium text-foreground">{recurso.titulo}</span>
        <span className="text-xs text-brand-700 group-open:hidden">Ver grabación</span>
        <span className="hidden text-xs text-brand-700 group-open:inline">Cerrar</span>
      </summary>
      <div className="mt-2 aspect-video overflow-hidden rounded-md bg-navy-950">
        {/* loading="lazy": el iframe solo carga cuando se abre el desplegable. */}
        <iframe
          src={embebible}
          title={recurso.titulo}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </details>
  )
}

const FORMATO_PLAZO = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: ZONA })

/** Estado de asistencia de la sesion + lo que el alumno puede hacer si figura ausente. */
function AvisoAsistencia({ sesion, inscripcionId }: { sesion: SesionDelAula; inscripcionId: string }) {
  const { asistencia, justificacion, puedeJustificar, plazoJustificacion } = sesion
  const plazo = FORMATO_PLAZO.format(plazoJustificacion)
  const formulario = puedeJustificar ? (
    <FormularioJustificacion
      inscripcionId={inscripcionId}
      sesion={sesion.numero}
      plazo={plazo}
      reintento={justificacion?.estado === 'rechazada'}
    />
  ) : null

  if (asistencia === 'justificada') {
    return <p className="mt-0.5 text-xs text-slate-600">Inasistencia justificada: esta sesión no cuenta en tu porcentaje.</p>
  }
  if (asistencia === 'presente' && justificacion?.estado === 'aprobada') {
    return <p className="mt-0.5 text-xs text-brand-700">Corregimos tu asistencia después de revisar tu justificación.</p>
  }
  if (asistencia !== 'ausente') return null

  if (justificacion?.estado === 'pendiente') {
    return (
      <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
        Justificación en revisión · enviada el {FORMATO_DIA.format(new Date(justificacion.createdAt))}
      </p>
    )
  }

  return (
    <div>
      <p className="mt-0.5 text-xs text-red-700">No registramos tu asistencia en esta sesión.</p>
      {justificacion?.estado === 'rechazada' ? (
        <p className="mt-1.5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
          <span className="font-medium">Tu justificación no fue aceptada.</span>
          {justificacion.respuesta ? ` ${justificacion.respuesta}` : null}
        </p>
      ) : null}
      {formulario ??
        (justificacion?.estado !== 'rechazada' ? (
          <p className="mt-1 text-xs text-foreground/50">El plazo para justificar venció el {plazo}.</p>
        ) : null)}
    </div>
  )
}

function FilaSesion({ sesion, habilitada, inscripcionId }: { sesion: SesionDelAula; habilitada: boolean; inscripcionId: string }) {
  const estilo = ESTILO_ASISTENCIA[sesion.asistencia]
  const recursos = sesion.grabaciones.length + sesion.materiales.length

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span
          className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold', estilo.clase)}
          title={estilo.texto}
        >
          {estilo.simbolo || sesion.numero}
          <span className="sr-only">{estilo.texto}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="font-medium text-foreground">
              Sesión {sesion.numero}
              {sesion.tema ? <span className="font-normal text-foreground/70"> · {sesion.tema}</span> : null}
            </p>
            <p className="text-sm text-foreground/60 first-letter:uppercase">
              {FORMATO_SESION.format(sesion.inicio)}, {FORMATO_HORA.format(sesion.inicio)}
            </p>
          </div>
          <AvisoAsistencia sesion={sesion} inscripcionId={inscripcionId} />

          {habilitada && recursos ? (
            <div className="-mx-3 mt-2">
              {sesion.grabaciones.map((recurso) => (
                <Grabacion key={recurso.id} recurso={recurso} />
              ))}
              {sesion.materiales.map((recurso) => (
                <ItemRecurso key={recurso.id} recurso={recurso} />
              ))}
            </div>
          ) : habilitada && sesion.asistencia !== 'futura' ? (
            <p className="mt-1 text-xs text-foreground/50">Sin grabación ni material publicados para esta sesión.</p>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function BloqueAhora({ aula, lugar }: { aula: Aula; lugar: string | null }) {
  const { sesiones, ahora, convocatoria, habilitada } = aula
  const actualOProxima = sesiones.find((sesion) => sesion.fin >= ahora)
  if (!actualOProxima || !habilitada) return null

  const enVivo = ahora >= actualOProxima.inicio && ahora <= actualOProxima.fin
  const online = convocatoria.modalidad === 'online_vivo' || convocatoria.modalidad === 'mixta'
  const enlace = actualOProxima.enlaceClase?.enlace ?? null

  return (
    <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-brand-700">
            {enVivo ? 'En curso ahora' : 'Próxima sesión'}
          </p>
          <p className="mt-1 font-medium text-foreground">
            Sesión {actualOProxima.numero}
            {actualOProxima.tema ? ` · ${actualOProxima.tema}` : ''}
          </p>
          <p className="text-sm text-foreground/70 first-letter:uppercase">
            {FORMATO_SESION.format(actualOProxima.inicio)}, {FORMATO_HORA.format(actualOProxima.inicio)} a{' '}
            {FORMATO_HORA.format(actualOProxima.fin)}
          </p>
          {!online && lugar ? <p className="mt-1 text-sm text-foreground/70">{lugar}</p> : null}
        </div>

        {online ? (
          enlace ? (
            <BotonUnirse href={enlace} inicio={actualOProxima.inicio} fin={actualOProxima.fin} ahoraServidor={ahora} />
          ) : (
            <p className="text-sm text-foreground/60 sm:max-w-48 sm:text-right">Publicaremos el enlace de la clase antes de que empiece.</p>
          )
        ) : lugar ? (
          <Button
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`}
            variant="secundario"
            size="sm"
            className="bg-surface"
          >
            Cómo llegar
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function BloqueAsistencia({ aula }: { aula: Aula }) {
  const { presentes, registradas, justificadas, porcentaje, minima } = aula.asistencia
  const total = aula.sesiones.length
  const restantes = aula.sesiones.filter((sesion) => sesion.asistencia === 'futura').length
  const hayJustificables = aula.sesiones.some((sesion) => sesion.puedeJustificar)

  if (!registradas) {
    return (
      <p className="text-sm text-foreground/60">
        Aún no hay asistencia registrada. Necesitas al menos {minima} % para obtener el certificado.
      </p>
    )
  }

  // Mejor caso: asiste a todas las que quedan.
  const maximoPosible = Math.round(((presentes + restantes) / (registradas + restantes)) * 100)
  const cumple = (porcentaje ?? 0) >= minima

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">
          {presentes} de {registradas} {registradas === 1 ? 'sesión registrada' : 'sesiones registradas'}
          {total > registradas ? <span className="font-normal text-foreground/50"> (de {total})</span> : null}
          {justificadas ? (
            <span className="block text-xs font-normal text-foreground/50">
              {justificadas === 1 ? '1 inasistencia justificada no cuenta' : `${justificadas} inasistencias justificadas no cuentan`}
            </span>
          ) : null}
        </span>
        <span className={cn('font-serif text-2xl font-semibold', cumple ? 'text-navy-800' : 'text-amber-700')}>{porcentaje} %</span>
      </div>
      <div className="relative mt-3 h-2.5 rounded-full bg-brand-50">
        <div className={cn('h-full rounded-full', cumple ? 'bg-brand-500' : 'bg-amber-500')} style={{ width: `${porcentaje}%` }} />
        {/* Marca del minimo */}
        <div className="absolute -top-1 h-4.5 w-0.5 bg-navy-800" style={{ left: `${minima}%` }} aria-hidden />
      </div>
      <div className="relative mt-1 h-4 text-xs text-foreground/50">
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `clamp(2.5rem, ${minima}%, calc(100% - 2.5rem))` }}>
          mínimo {minima} %
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground/70">
        {cumple
          ? restantes
            ? 'Vas bien: mantén tu asistencia hasta el final para certificar.'
            : 'Cumples la asistencia mínima para certificar.'
          : !restantes
            ? `No alcanzaste la asistencia mínima para certificar.${hayJustificables ? ' Si faltaste por salud o fuerza mayor, justifica la inasistencia en la sesión.' : ''}`
            : maximoPosible >= minima
              ? `Si asistes ${restantes === 1 ? 'a la sesión que queda' : `a las ${restantes} sesiones que quedan`}, llegas a ${maximoPosible} %.`
              : `Con las sesiones que quedan ya no alcanzas el mínimo.${hayJustificables ? ' Si faltaste por salud o fuerza mayor, justifica la inasistencia en la sesión.' : ''}`}
      </p>
    </div>
  )
}

function BloqueCertificado({ aula, mailto }: { aula: Aula; mailto: string }) {
  const { terminado, asistencia, curso, inscripcion } = aula
  // Si hay listas cargadas mandan las listas; el estado "asistio" solo cuenta cuando el curso no usa listas.
  const cumple = asistencia.registradas
    ? (asistencia.porcentaje ?? 0) >= asistencia.minima
    : inscripcion.estadoInscripcion === 'asistio'

  let titulo: string
  let texto: string
  let tono: 'neutro' | 'bien' | 'alerta' = 'neutro'

  if (!terminado) {
    titulo = 'Se habilita al terminar el curso'
    texto = `Para obtenerlo necesitas al menos ${asistencia.minima} % de asistencia.`
  } else if (cumple) {
    titulo = 'Tu certificado se está preparando'
    texto = 'Cumpliste la asistencia. Cuando el equipo lo emita, vas a poder descargarlo desde aquí.'
    tono = 'bien'
  } else if (!asistencia.registradas) {
    titulo = 'Esperando el registro de asistencia'
    texto = 'El curso terminó y el equipo aún no carga la asistencia.'
  } else {
    titulo = 'No alcanzaste la asistencia mínima'
    texto = `Registramos ${asistencia.porcentaje} % y el mínimo es ${asistencia.minima} %. Si faltaste por fuerza mayor, escríbenos.`
    tono = 'alerta'
  }

  return (
    <Card className={cn('p-5 hover:shadow-soft', tono === 'bien' && 'border-lime bg-lime/10', tono === 'alerta' && 'border-amber-200 bg-amber-50')}>
      <p className="font-medium text-foreground">{titulo}</p>
      <p className="mt-1 text-sm text-foreground/70">{texto}</p>
      {curso?.certificacion ? <p className="mt-3 text-xs text-foreground/50">{curso.certificacion}</p> : null}
      {tono === 'alerta' ? (
        <Button href={mailto} variant="secundario" size="sm" className="mt-4 bg-surface">
          Escribir al equipo
        </Button>
      ) : null}
    </Card>
  )
}

const MENSAJE_BLOQUEO: Partial<Record<string, { titulo: string; texto: string }>> = {
  pendiente: {
    titulo: 'Tu inscripción está pendiente de confirmación',
    texto: 'Cuando la confirmemos, aquí vas a encontrar el enlace de la clase, el material y las grabaciones.',
  },
  lista_espera: {
    titulo: 'Estás en lista de espera',
    texto: 'Si se libera un cupo te avisamos, y el aula se habilita al confirmar tu inscripción.',
  },
  no_asistio: {
    titulo: 'El aula ya no está disponible',
    texto: 'No registramos tu asistencia a este curso. Si crees que es un error, escríbenos.',
  },
  cancelada: {
    titulo: 'Esta inscripción fue cancelada',
    texto: 'El material y las grabaciones solo están disponibles para inscripciones vigentes.',
  },
}

// ---------------------------------------------------------------------------
// Pagina

export default async function AulaPage(props: PageProps<'/cuenta/cursos/[inscripcionId]'>) {
  const { inscripcionId } = await props.params
  const cuenta = await exigirCuenta(`/cuenta/cursos/${inscripcionId}`)
  const [aula, sitio] = await Promise.all([obtenerAula(cuenta.id, inscripcionId, ahoraDeLaRequest()), obtenerConfiguracionSitio()])
  if (!aula) notFound()

  const { inscripcion, convocatoria, curso, habilitada, sesiones, materialGeneral } = aula
  const titulo = curso?.titulo ?? convocatoria.titulo
  const relatores = (convocatoria.relatores ?? []).filter(esPoblado).map((persona) => persona.nombre)
  const lugarTexto = [convocatoria.lugar?.sede, convocatoria.lugar?.direccion, convocatoria.lugar?.ciudad].filter(Boolean).join(', ') || null
  const primera = sesiones[0]
  const ultima = sesiones.at(-1)
  const bloqueo = habilitada ? null : MENSAJE_BLOQUEO[inscripcion.estadoInscripcion]
  const pagoPendiente = inscripcion.pago.estadoPago === 'pendiente' || inscripcion.pago.estadoPago === 'parcial'
  const paraOtraPersona = inscripcion.participanteNombre.trim() !== cuenta.nombre.trim()

  const correo = correoParaMotivo(sitio)
  const mailto = `mailto:${correo}?${new URLSearchParams({
    subject: `Consulta sobre el curso ${titulo}`,
    body: `Hola, les escribo por el curso "${titulo}". Participante: ${inscripcion.participanteNombre}.`,
  })}`

  const meta = [
    primera && ultima ? `${FORMATO_DIA.format(primera.inicio)}${ultima !== primera ? ` al ${FORMATO_DIA.format(ultima.inicio)}` : ''}` : null,
    curso?.duracionHoras ? `${curso.duracionHoras} horas` : null,
    relatores.length ? relatores.join(', ') : null,
  ].filter(Boolean)

  return (
    <div>
      <Link href="/cuenta/cursos" className="text-sm text-brand-700 hover:underline">
        ← Mis cursos
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>{ETIQUETA_MODALIDAD[convocatoria.modalidad]}</Badge>
        {!habilitada ? <Badge className="bg-amber-50 text-amber-800">Aula bloqueada</Badge> : null}
      </div>
      <Heading level={2} className="mt-3">
        {titulo}
      </Heading>
      <p className="mt-2 text-sm text-foreground/60">{meta.join(' · ')}</p>
      {paraOtraPersona ? (
        <p className="mt-1 text-sm text-foreground/60">
          Participante: <span className="text-foreground">{inscripcion.participanteNombre}</span>
        </p>
      ) : null}

      {bloqueo ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-900">{bloqueo.titulo}</p>
          <p className="mt-1 text-sm text-amber-900/80">{bloqueo.texto}</p>
          {pagoPendiente && inscripcion.estadoInscripcion === 'pendiente' ? (
            <Button href="/cuenta/compras" variant="secundario" size="sm" className="mt-4 bg-surface">
              Ver el pago pendiente
            </Button>
          ) : null}
        </div>
      ) : null}

      <BloqueAhora aula={aula} lugar={lugarTexto} />

      <SeccionAula id="sesiones" titulo="Sesiones">
        <Card className="p-5 hover:shadow-soft">
          <ol className="divide-y divide-border">
            {sesiones.map((sesion) => (
              <FilaSesion key={sesion.numero} sesion={sesion} habilitada={habilitada} inscripcionId={inscripcion.id} />
            ))}
          </ol>
        </Card>
      </SeccionAula>

      {habilitada ? (
        <SeccionAula id="material" titulo="Material del curso">
          {materialGeneral.length ? (
            <Card className="p-2 hover:shadow-soft">
              {materialGeneral.map((recurso) =>
                recurso.tipo === 'grabacion' ? <Grabacion key={recurso.id} recurso={recurso} /> : <ItemRecurso key={recurso.id} recurso={recurso} />,
              )}
            </Card>
          ) : (
            <p className="text-sm text-foreground/60">El equipo aún no publica material general para este curso.</p>
          )}
        </SeccionAula>
      ) : null}

      {inscripcion.estadoInscripcion !== 'cancelada' && inscripcion.estadoInscripcion !== 'pendiente' && inscripcion.estadoInscripcion !== 'lista_espera' ? (
        <>
          <SeccionAula id="asistencia" titulo="Asistencia">
            <Card className="p-5 hover:shadow-soft">
              <BloqueAsistencia aula={aula} />
            </Card>
          </SeccionAula>

          <SeccionAula id="certificado" titulo="Certificado">
            <BloqueCertificado aula={aula} mailto={mailto} />
          </SeccionAula>
        </>
      ) : null}
    </div>
  )
}
