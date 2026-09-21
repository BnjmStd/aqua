'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'

const ANTES_MS = 15 * 60_000

type Props = {
  href: string
  inicio: number
  fin: number
  /** Hora del servidor al renderizar: evita diferencias de hidratacion. */
  ahoraServidor: number
}

/**
 * "Unirse a la clase" se habilita 15 min antes y hasta que termina la sesion.
 * Se re-evalua cada 30 s para no obligar a recargar la pagina.
 *
 * La ventana es de experiencia, no de seguridad: quien ve este boton ya tiene
 * acceso al aula, asi que el enlace puede viajar en el HTML.
 */
export function BotonUnirse({ href, inicio, fin, ahoraServidor }: Props) {
  const [ahora, setAhora] = useState(ahoraServidor)

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 30_000)
    return () => clearInterval(intervalo)
  }, [])

  const abierta = ahora >= inicio - ANTES_MS && ahora <= fin
  const minutos = Math.ceil((inicio - ANTES_MS - ahora) / 60_000)

  if (abierta) {
    return (
      <Button href={href} size="md" className="w-full sm:w-auto">
        Unirse a la clase
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        disabled
        className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground/50"
      >
        Unirse a la clase
      </button>
      {ahora < inicio && minutos <= 120 ? (
        <span className="text-center text-xs text-foreground/50 sm:text-right">Se habilita en {minutos} min</span>
      ) : (
        <span className="text-center text-xs text-foreground/50 sm:text-right">Se habilita 15 min antes</span>
      )}
    </div>
  )
}
