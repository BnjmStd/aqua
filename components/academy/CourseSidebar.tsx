import Image from 'next/image'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { urlDeMedia } from '@/lib/media'
import { esPoblado } from '@/lib/relaciones'
import type { Curso } from '@/payload-types'
import { ETIQUETA_MODALIDAD, ETIQUETA_NIVEL } from './etiquetas'

function IconoReloj() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function IconoCapas() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.5 2 6l6 3.5L14 6 8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M2 9.5 8 13l6-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function IconoNivel() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 13V7M8 13V3M13 13V9.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Fila({ icono, etiqueta, valor }: { icono: ReactNode; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0 dark:border-slate-800">
      <span className="flex items-center gap-2 text-foreground/60">
        {icono}
        {etiqueta}
      </span>
      <span className="font-medium text-foreground">{valor}</span>
    </div>
  )
}

export function CourseSidebar({ curso }: { curso: Curso }) {
  const relator = curso.relatoresHabituales?.find(esPoblado)
  const fotoRelator = relator ? urlDeMedia(relator.foto, 'thumbnail') : null

  return (
    <div className="space-y-6">
      <Card>
        <Heading level={4} as="h2" className="mb-2">
          El curso incluye
        </Heading>

        <div>
          <Fila icono={<IconoReloj />} etiqueta="Duración" valor={`${curso.duracionHoras} h`} />
          {curso.modulos?.length ? (
            <Fila icono={<IconoCapas />} etiqueta="Módulos" valor={`${curso.modulos.length}`} />
          ) : null}
          {curso.nivel ? (
            <Fila icono={<IconoNivel />} etiqueta="Nivel" valor={ETIQUETA_NIVEL[curso.nivel]} />
          ) : null}
        </div>

        {curso.modalidadesDisponibles?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {curso.modalidadesDisponibles.map((modalidad) => (
              <Badge key={modalidad}>{ETIQUETA_MODALIDAD[modalidad]}</Badge>
            ))}
          </div>
        ) : null}

        {curso.certificacion ? (
          <p className="mt-4 text-xs leading-relaxed text-foreground/60">{curso.certificacion}</p>
        ) : null}

        <Button href="/contacto" size="lg" className="mt-6 w-full">
          Quiero inscribirme
        </Button>
        <p className="mt-3 text-center text-xs text-foreground/50">
          Te contactamos para coordinar la próxima convocatoria.
        </p>
      </Card>

      {curso.sence?.acreditado ? (
        <Card>
          <p className="text-sm font-medium text-foreground">Acreditación SENCE</p>
          <p className="mt-1 text-sm text-foreground/60">
            {curso.sence.codigoSence ? `Código ${curso.sence.codigoSence}` : 'Curso acreditado'}
          </p>
        </Card>
      ) : null}

      {relator ? (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">Relator</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              {fotoRelator ? (
                <Image
                  src={fotoRelator}
                  alt={relator.nombre}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{relator.nombre}</p>
              {relator.cargo ? <p className="text-xs text-foreground/60">{relator.cargo}</p> : null}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
