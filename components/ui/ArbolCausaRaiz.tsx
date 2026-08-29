'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { cn } from '@/lib/cn'

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger)

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// viewBox 480x260: sintoma arriba, tres hipotesis al medio, causa raiz abajo.
const N = {
  sintoma: { x: 240, y: 42 },
  a: { x: 112, y: 132 },
  b: { x: 240, y: 132 },
  c: { x: 368, y: 132 },
  raiz: { x: 240, y: 222 },
}

// Aristas: dos "descartadas" (sintoma->a, sintoma->c) y la cadena verdadera
// (sintoma->b->raiz). Todas se trazan en la intro.
const EDGES = {
  sa: `M${N.sintoma.x} ${N.sintoma.y + 8} C 202 82, 150 100, ${N.a.x + 6} ${N.a.y - 12}`,
  sc: `M${N.sintoma.x} ${N.sintoma.y + 8} C 278 82, 330 100, ${N.c.x - 6} ${N.c.y - 12}`,
  sb: `M${N.sintoma.x} ${N.sintoma.y + 10} L ${N.b.x} ${N.b.y - 10}`,
  br: `M${N.b.x} ${N.b.y + 10} L ${N.raiz.x} ${N.raiz.y - 11}`,
}

/**
 * Adorno del hero de Consulting: un arbol de causa raiz. En la intro se
 * dibujan el sintoma, tres hipotesis y la cadena que baja a la causa raiz.
 * En bucle, un punto de diagnostico tantea las hipotesis descartadas y
 * termina bajando por la verdadera, que destella. Como los demas adornos,
 * el scroll modula la velocidad y `prefers-reduced-motion` lo deja quieto.
 * Pensado para fondo navy (slot `aside` de HeroBanner).
 */
export function ArbolCausaRaiz({ className }: { className?: string }) {
  const raiz = useRef<SVGSVGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const svg = raiz.current
    if (!svg) return

    const q = gsap.utils.selector(svg)
    let limpiarTicker: (() => void) | undefined

    const trazos = q('[data-trazo]') as unknown as SVGPathElement[]
    for (const t of trazos) {
      const largo = t.getTotalLength()
      t.style.strokeDasharray = String(largo)
      t.style.strokeDashoffset = String(largo)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(trazos, { strokeDashoffset: 0 })
      gsap.set(q('[data-avance], [data-flare]'), { opacity: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const edge = (sel: string) => q(sel)[0] as unknown as SVGPathElement
      const eSA = edge('[data-e-sa]')
      const eSC = edge('[data-e-sc]')
      const eSB = edge('[data-e-sb]')
      const eBR = edge('[data-e-br]')
      const porPath = (
        path: SVGPathElement,
        opts: { start?: number; end?: number } = {},
      ) => ({
        motionPath: { path, align: path, alignOrigin: [0.5, 0.5] as [number, number], ...opts },
      })
      const centro = { transformOrigin: '50% 50%' }

      // --- Intro: se arma el arbol --------------------------------------
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from(q('[data-anillo-sintoma]'), { scale: 0, opacity: 0, ...centro, duration: 0.5, ease: 'back.out(1.7)' })
        .to(q('[data-e-sa], [data-e-sc], [data-e-sb]'), { strokeDashoffset: 0, duration: 0.7, stagger: 0.12 }, '-=0.15')
        .from(
          q('[data-anillo-a], [data-anillo-b], [data-anillo-c]'),
          { scale: 0, opacity: 0, ...centro, duration: 0.4, stagger: 0.12, ease: 'back.out(1.7)' },
          '-=0.5',
        )
        .to(q('[data-e-br]'), { strokeDashoffset: 0, duration: 0.5 }, '-=0.1')
        .from(q('[data-anillo-raiz]'), { scale: 0, opacity: 0, ...centro, duration: 0.45, ease: 'back.out(1.7)' }, '-=0.2')
        .from(q('[data-rotulo]'), { opacity: 0, y: 6, duration: 0.4, stagger: 0.12 }, '<')

      // --- Bucle: el diagnostico tantea y encuentra la raiz ------------
      const inicio = intro.duration()
      const bucle = gsap.timeline()
      const pulso = gsap.timeline({ repeat: -1, defaults: { ease: 'power1.inOut' } })

      pulso
        .set(q('[data-avance]'), { opacity: 1 })
        // tantea la hipotesis A y la descarta
        .to(q('[data-avance]'), { ...porPath(eSA), duration: 0.6 })
        .to(q('[data-anillo-a]'), { scale: 1.3, ...centro, duration: 0.2, yoyo: true, repeat: 1 }, '<0.35')
        .to(q('[data-avance]'), { ...porPath(eSA, { start: 1, end: 0 }), duration: 0.45 })
        // tantea la hipotesis C y la descarta
        .to(q('[data-avance]'), { ...porPath(eSC), duration: 0.6 })
        .to(q('[data-anillo-c]'), { scale: 1.3, ...centro, duration: 0.2, yoyo: true, repeat: 1 }, '<0.35')
        .to(q('[data-avance]'), { ...porPath(eSC, { start: 1, end: 0 }), duration: 0.45 })
        // baja por la cadena verdadera hasta la raiz
        .to(q('[data-avance]'), { ...porPath(eSB), duration: 0.5 })
        .to(q('[data-anillo-b]'), { scale: 1.3, ...centro, duration: 0.25 }, '<')
        .to(q('[data-avance]'), { ...porPath(eBR), duration: 0.5 })
        .to(q('[data-anillo-b]'), { scale: 1, ...centro, duration: 0.4 }, '<')
        .to(q('[data-flare]'), { opacity: 0.9, scale: 1.6, ...centro, duration: 0.3, ease: 'power2.out' }, '-=0.1')
        .to(q('[data-anillo-raiz]'), { scale: 1.35, ...centro, duration: 0.3 }, '<')
        .to({}, { duration: 1 })
        .to(q('[data-flare]'), { opacity: 0, scale: 1, ...centro, duration: 0.5 })
        .to(q('[data-anillo-raiz]'), { scale: 1, ...centro, duration: 0.5 }, '<')
        .to(q('[data-avance]'), { opacity: 0, duration: 0.3 }, '<')

      bucle.add(pulso, inicio)

      // El bucle sigue la velocidad del scroll (mismo gesto que EsquemaProceso).
      let objetivo = 1
      ScrollTrigger.create({
        trigger: svg,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = Math.min(Math.abs(self.getVelocity()) / 1400, 1)
          objetivo = 1 + v * 2
        },
      })
      const seguirScroll = () => {
        objetivo += (1 - objetivo) * 0.05
        const actual = bucle.timeScale()
        bucle.timeScale(actual + (objetivo - actual) * 0.1)
      }
      gsap.ticker.add(seguirScroll)
      limpiarTicker = () => gsap.ticker.remove(seguirScroll)

      ScrollTrigger.refresh()
    }, svg)

    return () => {
      limpiarTicker?.()
      ctx.revert()
    }
  }, [])

  return (
    <svg
      ref={raiz}
      viewBox="0 0 480 260"
      role="img"
      aria-label="Arbol de causa raiz: un sintoma en la parte superior, tres hipotesis intermedias y la cadena que desciende hasta la causa raiz."
      className={cn('block h-auto w-full max-w-md', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Aristas descartadas: tenues */}
      <g stroke="var(--color-navy-300)" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round">
        <path data-trazo="" data-e-sa="" d={EDGES.sa} />
        <path data-trazo="" data-e-sc="" d={EDGES.sc} />
      </g>

      {/* Cadena verdadera: brand */}
      <g stroke="var(--color-brand-300)" strokeWidth="3" strokeLinecap="round">
        <path data-trazo="" data-e-sb="" d={EDGES.sb} />
        <path data-trazo="" data-e-br="" d={EDGES.br} />
      </g>

      {/* Destello de la causa raiz (detras del anillo) */}
      <circle data-flare="" cx={N.raiz.x} cy={N.raiz.y} r="10" fill="var(--color-lime)" opacity="0" />

      {/* Nodos */}
      <g fill="var(--color-navy-900)" stroke="var(--color-brand-200)" strokeWidth="2.5">
        <circle data-anillo="" data-anillo-sintoma="" cx={N.sintoma.x} cy={N.sintoma.y} r="10" />
        <circle data-anillo="" data-anillo-a="" cx={N.a.x} cy={N.a.y} r="8" />
        <circle data-anillo="" data-anillo-b="" cx={N.b.x} cy={N.b.y} r="8" />
        <circle data-anillo="" data-anillo-c="" cx={N.c.x} cy={N.c.y} r="8" />
        <circle data-anillo="" data-anillo-raiz="" cx={N.raiz.x} cy={N.raiz.y} r="10" />
      </g>

      {/* Punto de diagnostico */}
      <g data-avance="" opacity="0">
        <circle r="9" fill="var(--color-brand-400)" opacity="0.25" />
        <circle r="3.5" fill="var(--color-brand-100)" />
      </g>

      {/* Rotulos */}
      <g fill="var(--color-on-navy)" fontSize="8.5" fontFamily="inherit" letterSpacing="1.2" textAnchor="middle">
        <text data-rotulo="" x={N.sintoma.x} y={N.sintoma.y - 16}>SÍNTOMA</text>
        <text data-rotulo="" x={N.raiz.x} y={N.raiz.y + 24}>CAUSA RAÍZ</text>
      </g>
    </svg>
  )
}
