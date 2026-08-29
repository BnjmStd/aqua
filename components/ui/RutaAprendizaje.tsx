'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { cn } from '@/lib/cn'

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger)

// useLayoutEffect avisa en SSR; en cliente lo queremos para fijar el estado
// inicial antes del primer paint (igual que EsquemaProceso).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const MODULOS = ['FUNDAMENTOS', 'BIOLOGÍA', 'OPERACIÓN', 'OPTIMIZACIÓN'] as const

// Los 4 hitos sobre el viewBox 480x260: una progresion que sube de izquierda
// a derecha. `lx`/`anchor` acomodan el rotulo para que no se salga del marco.
const NODOS = [
  { x: 52, y: 210, lx: 40, anchor: 'start' as const },
  { x: 190, y: 164, lx: 190, anchor: 'middle' as const },
  { x: 312, y: 116, lx: 312, anchor: 'middle' as const },
  { x: 440, y: 64, lx: 452, anchor: 'end' as const },
]

const RUTA_D =
  'M52 210 C 112 198, 140 172, 190 164 C 244 155, 268 128, 312 116 C 366 100, 400 82, 440 64'

/**
 * Adorno del hero de Academy: la "ruta de formacion". La linea se traza en la
 * intro, los hitos aparecen con rebote y un punto de avance la recorre en
 * bucle, latiendo cada modulo al pasar. Como en EsquemaProceso, el scroll
 * modula la velocidad del bucle y todo se detiene con `prefers-reduced-motion`.
 * Pensado para fondo navy (slot `aside` de HeroBanner).
 */
export function RutaAprendizaje({ className }: { className?: string }) {
  const raiz = useRef<SVGSVGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const svg = raiz.current
    if (!svg) return

    const q = gsap.utils.selector(svg)
    let limpiarTicker: (() => void) | undefined

    // `pathLength` no normaliza el dasharray de forma fiable entre navegadores,
    // asi que se mide cada trazo y se arma el dash con su largo real.
    const trazos = q('[data-ruta], [data-check]') as unknown as SVGPathElement[]
    for (const t of trazos) {
      const largo = t.getTotalLength()
      t.style.strokeDasharray = String(largo)
      t.style.strokeDashoffset = String(largo)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(trazos, { strokeDashoffset: 0 })
      gsap.set(q('[data-avance]'), { opacity: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const ruta = q('[data-ruta]')[0] as unknown as SVGPathElement

      // --- Intro: se arma la ruta -----------------------------------------
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from(q('[data-anillo]'), {
          scale: 0,
          opacity: 0,
          transformOrigin: '50% 50%',
          duration: 0.5,
          stagger: 0.12,
          ease: 'back.out(1.7)',
        })
        .to(q('[data-ruta]'), { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut' }, '-=0.3')
        .to(q('[data-check]'), { strokeDashoffset: 0, duration: 0.3, stagger: 0.12 }, '-=0.6')
        .from(q('[data-rotulo]'), { opacity: 0, y: 6, duration: 0.4, stagger: 0.12 }, '<')

      // --- Bucle: el punto de avance recorre la ruta ---------------------
      // Los tweens arrancan tras la intro (mismo truco que EsquemaProceso:
      // se posicionan en `inicio` y cada uno repite por su cuenta).
      const inicio = intro.duration()
      const bucle = gsap.timeline()

      bucle.set(q('[data-avance]'), { opacity: 1 }, inicio)
      bucle.to(
        q('[data-avance]'),
        {
          motionPath: { path: ruta, align: ruta, alignOrigin: [0.5, 0.5] },
          duration: 4,
          ease: 'none',
          repeat: -1,
        },
        inicio,
      )

      // Cada modulo late cuando el punto pasa (vuelta de 4 s / 4 nodos).
      q('[data-anillo]').forEach((anillo, i) => {
        const pulso = gsap.timeline({ repeat: -1 })
        pulso
          .to(anillo, { scale: 1.3, transformOrigin: '50% 50%', duration: 0.25, ease: 'sine.out' })
          .to(anillo, { scale: 1, transformOrigin: '50% 50%', duration: 0.35, ease: 'sine.in' })
          .to({}, { duration: 4 - 0.6 })
        bucle.add(pulso, inicio + i)
      })

      // El bucle sigue la velocidad del scroll: acelera al moverse y decae a
      // ~1x al detenerse, con techo en 3x (copiado de EsquemaProceso).
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
      aria-label="Ruta de formacion de Academy: cuatro modulos —fundamentos, biologia del proceso, operacion y optimizacion— conectados en una progresion ascendente."
      className={cn('block h-auto w-full max-w-md', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ruta por recorrer: punteada y tenue */}
      <path
        d={RUTA_D}
        stroke="var(--color-navy-300)"
        strokeOpacity="0.3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 9"
      />

      {/* Ruta recorrida: se dibuja en la intro */}
      <path
        data-ruta=""
        d={RUTA_D}
        stroke="var(--color-brand-300)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="460"
        strokeDashoffset="460"
      />

      {/* Hitos */}
      {NODOS.map((n, i) => (
        <g key={i}>
          <circle
            data-anillo=""
            cx={n.x}
            cy={n.y}
            r="9"
            fill="var(--color-navy-900)"
            stroke="var(--color-brand-200)"
            strokeWidth="2.5"
          />
          <path
            data-check=""
            d={`M${n.x - 3.6} ${n.y - 0.2} l 2.6 2.8 l 5 -6`}
            stroke="var(--color-lime)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="14"
            strokeDashoffset="14"
          />
        </g>
      ))}

      {/* Punto de avance */}
      <g data-avance="" opacity="0">
        <circle r="10" fill="var(--color-brand-400)" opacity="0.25" />
        <circle r="4" fill="var(--color-brand-100)" />
      </g>

      {/* Rotulos */}
      <g fill="var(--color-on-navy)" fontSize="8.5" fontFamily="inherit" letterSpacing="1">
        {NODOS.map((n, i) => (
          <text data-rotulo="" key={i} x={n.lx} y={n.y + 23} textAnchor={n.anchor}>
            {MODULOS[i]}
          </text>
        ))}
      </g>
    </svg>
  )
}
