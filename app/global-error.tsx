'use client'

import { useEffect } from 'react'

/**
 * Ultima red: solo se ve si falla un layout raiz, (frontend) o (payload).
 * Los errores del sitio los atrapan antes los error.tsx de (frontend).
 *
 * Reemplaza al documento completo, asi que no hay globals.css ni fuentes. Va
 * con estilos inline a proposito: importar Tailwind aca lo cargaria tambien
 * junto al panel de Payload, cuyo layout es el otro raiz. Los colores son los
 * de globals.css copiados a mano; si cambia la paleta, cambiarlos aca.
 */
export default function ErrorGlobal({
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
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          background: '#faf9fc',
          color: '#1a1c1e',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <title>Error · aquabioprocess.cl</title>
        <main style={{ maxWidth: '36rem' }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#30859c',
            }}
          >
            Error del servidor
          </p>
          <h1
            style={{
              margin: '1rem 0 0',
              fontFamily: 'Georgia, serif',
              fontSize: '2rem',
              lineHeight: 1.2,
              color: '#0d3156',
            }}
          >
            El sitio no está disponible en este momento
          </h1>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.6, color: '#43474e' }}>
            Tuvimos un problema de nuestro lado. Intenta de nuevo en unos minutos.
          </p>
          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => retry()}
              style={{
                height: '2.75rem',
                padding: '0 1.5rem',
                border: 0,
                borderRadius: '0.625rem',
                background: '#0d3156',
                color: '#fff',
                font: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Intentar de nuevo
            </button>
            {/* <a> y no Link: tras un error de este nivel conviene una carga completa. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '2.75rem',
                padding: '0 1.5rem',
                border: '1px solid #c3c6cf',
                borderRadius: '0.625rem',
                color: '#1a1c1e',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Volver al inicio
            </a>
          </div>
          {error.digest ? (
            <p
              style={{
                margin: '2rem 0 0',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
                color: '#1a1c1e80',
              }}
            >
              Referencia: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
