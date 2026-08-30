'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Fallback: abre el correo en otra pestaña y vuelve a la página anterior. */
export function AbrirCorreo({ href }: { href: string }) {
  const router = useRouter()

  useEffect(() => {
    window.open(href, '_blank', 'noopener,noreferrer')
    if (window.history.length > 1) router.back()
    else router.replace('/')
  }, [href, router])

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm text-foreground/70">Abriendo el correo…</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-sm font-medium text-brand-700 hover:underline"
      >
        Si no se abre, hacé clic acá
      </a>
    </main>
  )
}
