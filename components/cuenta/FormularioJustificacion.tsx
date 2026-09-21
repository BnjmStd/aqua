'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useState } from 'react'

import {
  type EstadoJustificacion,
  justificarInasistencia,
} from '@/app/(frontend)/(sitio)/cuenta/(panel)/cursos/[inscripcionId]/actions'
import { mostrarAviso } from '@/components/ui/Avisos'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { MOTIVOS_JUSTIFICACION, TAMANO_MAXIMO_RESPALDO, TIPOS_RESPALDO } from '@/lib/justificaciones'

const ESTADO_INICIAL: EstadoJustificacion = {}

type Props = {
  inscripcionId: string
  sesion: number
  /** Texto ya formateado de hasta cuando se puede justificar. */
  plazo: string
  /** Si hubo una rechazada antes, el boton dice "Enviar otra justificación". */
  reintento?: boolean
}

/**
 * Boton "Justificar inasistencia" que despliega el formulario en la misma fila
 * de la sesion (no un modal: en celular un formulario largo en modal es peor).
 */
export function FormularioJustificacion({ inscripcionId, sesion, plazo, reintento }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [estado, accion, enviando] = useActionState(justificarInasistencia, ESTADO_INICIAL)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null)
  const id = useId()
  const router = useRouter()
  const { errores = {}, valores = {} } = estado

  const { exito } = estado
  useEffect(() => {
    if (!exito) return
    mostrarAviso(exito.mensaje)
    // Repinta el aula: la sesion pasa a "en revision" y este formulario desaparece.
    router.refresh()
  }, [exito, router])

  if (!abierto) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-brand-500 hover:text-brand-700"
        >
          {reintento ? 'Enviar otra justificación' : 'Justificar inasistencia'}
        </button>
        <span className="text-xs text-foreground/50">Puedes hacerlo hasta el {plazo}.</span>
      </div>
    )
  }

  return (
    <form action={accion} noValidate className="mt-3 rounded-md border border-border bg-background p-4">
      <input type="hidden" name="inscripcion" value={inscripcionId} />
      <input type="hidden" name="sesion" value={sesion} />

      {estado.mensaje ? (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {estado.mensaje}
        </p>
      ) : null}

      <fieldset>
        <legend className="text-sm font-medium text-foreground">¿Qué pasó?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {MOTIVOS_JUSTIFICACION.map((motivo) => (
            <label
              key={motivo.value}
              className="flex cursor-pointer gap-2.5 rounded-md border border-border bg-surface px-3 py-2.5 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
            >
              <input
                type="radio"
                name="motivo"
                value={motivo.value}
                defaultChecked={valores.motivo === motivo.value}
                className="mt-0.5 accent-brand-700"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">{motivo.label}</span>
                <span className="block text-xs text-foreground/60">{motivo.ayuda}</span>
              </span>
            </label>
          ))}
        </div>
        {errores.motivo ? <p className="mt-1.5 text-sm text-red-700">{errores.motivo}</p> : null}
      </fieldset>

      <div className="mt-4">
        <label htmlFor={`${id}-detalle`} className="text-sm font-medium text-foreground">
          Detalle
        </label>
        <textarea
          id={`${id}-detalle`}
          name="detalle"
          rows={3}
          maxLength={2000}
          defaultValue={valores.detalle}
          placeholder="Ej: tuve una urgencia médica ese día y adjunto el certificado."
          aria-invalid={errores.detalle ? true : undefined}
          className={cn(
            'mt-1.5 w-full rounded-md border border-slate-300 bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            errores.detalle && 'border-red-500',
          )}
        />
        {errores.detalle ? <p className="mt-1 text-sm text-red-700">{errores.detalle}</p> : null}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">
          Respaldo <span className="font-normal text-foreground/50">(opcional)</span>
        </p>
        {/* El input nativo queda oculto: su boton sale en el idioma del navegador ("Choose File"). */}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <label
            htmlFor={`${id}-respaldo`}
            className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500"
          >
            {nombreArchivo ? 'Cambiar archivo' : 'Elegir archivo'}
            <input
              id={`${id}-respaldo`}
              name="respaldo"
              type="file"
              accept={TIPOS_RESPALDO.join(',')}
              onChange={(evento) => {
                const archivo = evento.currentTarget.files?.[0]
                // Se valida antes de enviar: un archivo sobre el limite ni siquiera llega a la Server Action.
                if (archivo && archivo.size > TAMANO_MAXIMO_RESPALDO) {
                  setErrorArchivo('El archivo pesa más de 5 MB.')
                  setNombreArchivo(null)
                  evento.currentTarget.value = ''
                } else {
                  setErrorArchivo(null)
                  setNombreArchivo(archivo?.name ?? null)
                }
              }}
              className="sr-only"
            />
          </label>
          <span className="min-w-0 truncate text-sm text-foreground/60">{nombreArchivo ?? 'Ningún archivo seleccionado'}</span>
        </div>
        <p className="mt-1 text-xs text-foreground/50">
          Certificado médico, constancia laboral o captura. PDF o imagen, hasta 5 MB. Solo lo ven tú y el equipo.
        </p>
        {errorArchivo || errores.respaldo ? (
          <p className="mt-1 text-sm text-red-700">{errorArchivo ?? errores.respaldo}</p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setAbierto(false)} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar justificación'}
        </Button>
      </div>
    </form>
  )
}
