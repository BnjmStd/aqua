'use client'

import { useTransition } from 'react'

import { reenviarVerificacion } from '@/app/(frontend)/(sitio)/cuenta/actions'
import { mostrarAviso } from '@/components/ui/Avisos'
import { Button } from '@/components/ui/Button'

/** Pide otro correo de verificación. El límite entre envíos lo aplica el servidor. */
export function BotonReenviarVerificacion({ variante = 'secundario' }: { variante?: 'primario' | 'secundario' }) {
  const [enviando, iniciarTransicion] = useTransition()

  return (
    <Button
      type="button"
      variant={variante}
      size="sm"
      disabled={enviando}
      className={variante === 'secundario' ? 'shrink-0 bg-surface' : undefined}
      onClick={() =>
        iniciarTransicion(async () => {
          const { mensaje } = await reenviarVerificacion()
          mostrarAviso(mensaje, 'info')
        })
      }
    >
      {enviando ? 'Enviando…' : 'Reenviar correo'}
    </Button>
  )
}
