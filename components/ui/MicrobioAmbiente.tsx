'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'

import { cn } from '@/lib/cn'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'

type Config = {
  left: string
  top: string
  driftX: string
  driftY: string
  durX: number
  durY: number
  escala: number
  color: string
  flip?: boolean
}

/**
 * Unos pocos microbios que derivan lento por el fondo de la seccion: la
 * biologia es el corazon del proceso. Cada uno con su posicion, tamaño,
 * velocidad y sentido, para que no se lean como copias.
 */
const MICROBIOS: Config[] = [
  { left: '9%', top: '15%', driftX: '66%', driftY: '60%', durX: 21, durY: 29, escala: 1, color: 'text-brand-500/20' },
  { left: '80%', top: '58%', driftX: '34%', driftY: '20%', durX: 27, durY: 34, escala: 0.68, color: 'text-brand-500/16', flip: true },
  { left: '52%', top: '9%', driftX: '38%', driftY: '72%', durX: 35, durY: 24, escala: 1.3, color: 'text-navy-400/12' },
]

function Microbio({ left, top, driftX, driftY, durX, durY, escala, color, flip }: Config) {
  const raiz = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const q = gsap.utils.selector(el)
    const ctx = gsap.context(() => {
      // Deriva: X e Y con periodos distintos -> nunca repite el mismo trazo.
      gsap.to(el, { left: driftX, duration: durX, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.to(el, { top: driftY, duration: durY, ease: 'sine.inOut', repeat: -1, yoyo: true })
      // El cuerpo cabecea; los flagelos baten mas rapido.
      gsap.to(q('[data-cuerpo]'), {
        rotation: flip ? -12 : 12,
        transformOrigin: '50% 50%',
        duration: durY * 0.28,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(q('[data-flagelo]'), {
        rotation: 16,
        transformOrigin: '0% 50%',
        duration: 0.9,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.12,
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={raiz}
      aria-hidden
      className={cn('pointer-events-none absolute', color)}
      style={{ left, top, transform: `scale(${escala})${flip ? ' scaleX(-1)' : ''}` }}
    >
      <svg width="66" height="31" viewBox="-20 -14 60 28" fill="none">
        <g data-cuerpo>
          <ellipse
            cx="0"
            cy="0"
            rx="13"
            ry="8"
            fill="currentColor"
            stroke="currentColor"
            strokeOpacity="0.5"
          />
          <circle cx="-3" cy="-1" r="2.4" fill="currentColor" fillOpacity="0.55" />
          <circle cx="4" cy="2" r="1.7" fill="currentColor" fillOpacity="0.55" />
          <circle cx="3" cy="-3" r="1.1" fill="currentColor" fillOpacity="0.55" />
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <path data-flagelo d="M13 -2q8 -3 14 1" />
            <path data-flagelo d="M13 3q9 2 15 -2" />
          </g>
        </g>
      </svg>
    </div>
  )
}

export function MicrobioAmbiente() {
  return (
    <>
      {MICROBIOS.map((cfg) => (
        <Microbio key={cfg.left + cfg.top} {...cfg} />
      ))}
    </>
  )
}
