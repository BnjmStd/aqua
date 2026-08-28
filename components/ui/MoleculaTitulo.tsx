'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'

import { cn } from '@/lib/cn'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'

/**
 * La misma molecula que gira sobre el clarificador en EsquemaProceso, reusada
 * como marca sobre un titulo: gira en bucle y sus nodos laten por turnos.
 */
export function MoleculaTitulo({ className }: { className?: string }) {
  const raiz = useRef<SVGSVGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const q = gsap.utils.selector(el)
    const ctx = gsap.context(() => {
      gsap.to(q('[data-giro]'), {
        rotation: 360,
        svgOrigin: '24 24', // el nodo central, para que gire sin bambolearse
        duration: 10,
        ease: 'none',
        repeat: -1,
      })
      gsap.to(q('[data-nodo]'), {
        scale: 1.35,
        transformOrigin: '50% 50%',
        duration: 0.7,
        ease: 'sine.inOut',
        stagger: { each: 0.8, repeat: -1, yoyo: true },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={raiz}
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={cn('block size-10 overflow-visible', className)}
      fill="none"
    >
      <g data-giro>
        <g stroke="var(--color-navy-400)" strokeWidth="1.4" strokeLinecap="round">
          <line x1="24" y1="24" x2="24" y2="11" />
          <line x1="24" y1="24" x2="35.3" y2="30.5" />
          <line x1="24" y1="24" x2="12.7" y2="30.5" />
        </g>
        <circle cx="24" cy="24" r="3.6" fill="var(--color-navy-800)" />
        <circle data-nodo cx="24" cy="11" r="2.8" fill="var(--color-lime)" />
        <circle data-nodo cx="35.3" cy="30.5" r="3.2" fill="var(--color-brand-500)" />
        <circle data-nodo cx="12.7" cy="30.5" r="3.2" fill="var(--color-brand-500)" />
      </g>
    </svg>
  )
}
