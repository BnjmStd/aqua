'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/Button'
import { PantallaError } from './PantallaError'

/**
 * Contenido de los error.tsx del sitio. Es el mismo en los dos niveles; lo
 * que cambia es donde se monta:
 * - app/(frontend)/(sitio)/error.tsx: fallo una pagina, el Header y el
 *   Footer siguen en pie.
 * - app/(frontend)/error.tsx: fallo el marco mismo (el Header o el Footer no
 *   pudieron leer la configuracion del sitio), asi que sale sin ellos.
 */
export function ErrorInesperado({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <title>Error · aquabioprocess.cl</title>
      <PantallaError
        codigo="500"
        etiqueta="Error inesperado"
        titulo="Algo salió mal"
        descripcion="No pudimos cargar esta página. Puede ser algo pasajero: intenta de nuevo en unos segundos."
        referencia={error.digest}
        acciones={
          <>
            <Button type="button" variant="navy" onClick={() => retry()}>
              Intentar de nuevo
            </Button>
            <Button href="/" variant="secundario">
              Volver al inicio
            </Button>
          </>
        }
      />
    </>
  )
}
