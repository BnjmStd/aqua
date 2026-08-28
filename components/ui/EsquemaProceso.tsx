'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { cn } from '@/lib/cn'

gsap.registerPlugin(ScrollTrigger)

// useLayoutEffect avisa en SSR; en cliente lo queremos para fijar el estado
// inicial antes del primer paint y evitar el parpadeo de la intro.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Colores de la estructura (tuberias, tanques, molecula, rotulos). Los acentos
 * —agua, burbujas, gota, ondas— no cambian: leen bien sobre claro y oscuro.
 */
const TONOS = {
  claro: {
    tuberia: 'var(--color-navy-700)',
    tanqueBorde: 'var(--color-navy-800)',
    tanqueFondo: 'var(--color-surface)',
    enlace: 'var(--color-navy-400)',
    nodo: 'var(--color-navy-800)',
    motor: 'var(--color-navy-800)',
    rotulo: 'var(--color-muted)',
  },
  oscuro: {
    tuberia: 'var(--color-navy-300)',
    tanqueBorde: 'var(--color-brand-200)',
    tanqueFondo: 'rgb(255 255 255 / 0.06)',
    enlace: 'var(--color-navy-300)',
    nodo: 'var(--color-brand-300)',
    motor: 'var(--color-navy-200)',
    rotulo: 'var(--color-on-navy)',
  },
} as const

type Props = {
  className?: string
  /** `oscuro` para fondos navy. Por defecto `claro`. */
  tono?: keyof typeof TONOS
  /**
   * `hero`: la intro se reproduce sola y el scroll solo termina de llenar el
   * clarificador (gesto sutil). `seccion`: la seccion se fija (pin) y TODO el
   * armado de la planta —mas la tuberia de salida y el colector— se dibuja con
   * el progreso del scroll.
   */
  modo?: 'hero' | 'seccion'
}

export function EsquemaProceso({ className, tono = 'claro', modo = 'hero' }: Props) {
  const raiz = useRef<SVGSVGElement>(null)
  const c = TONOS[tono]

  useIsomorphicLayoutEffect(() => {
    const svg = raiz.current
    if (!svg) return

    const q = gsap.utils.selector(svg)
    let limpiarTicker: (() => void) | undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(q('[data-tuberia], [data-bajada]'), { strokeDashoffset: 0 })
      gsap.set(q('[data-agua], [data-agua-clar]'), { scaleY: 1, transformOrigin: '50% 100%' })
      gsap.set(q('[data-flujo-baja], [data-colector]'), { opacity: modo === 'seccion' ? 1 : 0 })
      return
    }

    const ctx = gsap.context(() => {
      // --- Secuencia de armado (misma en los dos modos) --------------------
      const armar = (tl: gsap.core.Timeline) => {
        tl.from(q('[data-tanque]'), {
          opacity: 0,
          scale: 0.9,
          transformOrigin: '50% 100%',
          duration: 0.6,
          stagger: 0.15,
        })
          .to(q('[data-tuberia]'), { strokeDashoffset: 0, duration: 0.8, stagger: 0.15 }, '-=0.35')
          .from(q('[data-tuberia]'), { opacity: 0, duration: 0.4, stagger: 0.15 }, '<')
          .from(
            q('[data-agua]'),
            { scaleY: 0, transformOrigin: '50% 100%', duration: 1, ease: 'power1.inOut' },
            '-=0.35',
          )
          // En `hero` el clarificador se llena entero acá. En `seccion` este
          // tramo llega a ~40% y el resto lo termina de aportar el scroll.
          .fromTo(
            q('[data-agua-clar]'),
            { scaleY: 0, transformOrigin: '50% 100%' },
            {
              scaleY: modo === 'seccion' ? 0.4 : 1,
              transformOrigin: '50% 100%',
              duration: 1,
              ease: 'power1.inOut',
            },
            '<',
          )
          .from(q('[data-burbuja-grupo]'), { opacity: 0, duration: 0.6 }, '<')
          .from(
            q('[data-aireador-grupo]'),
            { opacity: 0, scale: 0.8, transformOrigin: '50% 50%', duration: 0.4 },
            '-=0.7',
          )
          .from(q('[data-flujo-wrap]'), { opacity: 0, duration: 0.5 }, '<')
          .from(
            q('[data-molecula]'),
            { opacity: 0, scale: 0.5, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(1.7)' },
            '-=0.4',
          )
          .from(q('[data-rotulo]'), { opacity: 0, y: 6, duration: 0.5 }, '-=0.3')
      }

      // --- Bucles continuos (ambiente) ------------------------------------
      // Todos en una sola timeline para poder modularle la velocidad de golpe
      // con timeScale() (lo usa el control por scroll de mas abajo, en hero).
      const bucles = (inicio: number) => {
        const loops = gsap.timeline()
        loops
          .to(
            q('[data-aireador]'),
            { rotation: 360, transformOrigin: '50% 50%', duration: 3.5, ease: 'none', repeat: -1 },
            inicio,
          )
          .to(
            q('[data-molecula]'),
            { rotation: 360, transformOrigin: '50% 50%', duration: 26, ease: 'none', repeat: -1 },
            inicio,
          )
          .to(
            q('[data-flujo]'),
            { strokeDashoffset: -60, duration: 1.6, ease: 'none', repeat: -1 },
            inicio,
          )
          .to(
            q('[data-burbuja]'),
            {
              keyframes: [
                { y: -12, opacity: 0.9, duration: 0.4 },
                { y: -80, opacity: 0.9, duration: 1.5 },
                { y: -106, opacity: 0, duration: 0.5 },
              ],
              ease: 'sine.out',
              stagger: { each: 0.5, from: 'random', repeat: -1 },
            },
            inicio,
          )
          .to(
            q('[data-onda]'),
            {
              keyframes: [
                { scale: 0.3, opacity: 0.7, duration: 0.01 },
                { scale: 1.9, opacity: 0, duration: 1.7 },
              ],
              transformOrigin: '50% 50%',
              ease: 'sine.out',
              stagger: { each: 0.85, repeat: -1 },
            },
            inicio,
          )
          .to(
            q('[data-gota]'),
            {
              keyframes: [
                { opacity: 1, y: 0, duration: 0.01 },
                { y: 20, opacity: 0, duration: 1 },
              ],
              ease: 'power1.in',
              repeat: -1,
              repeatDelay: 0.7,
            },
            inicio,
          )
        return loops
      }

      if (modo === 'seccion') {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: svg.closest('[data-esquema-pin]') ?? svg,
            start: 'top top',
            end: '+=1200',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        })

        armar(tl)
        // Final: el clarificador termina de llenarse y el efluente tratado baja
        // hasta el colector.
        tl.to(q('[data-agua-clar]'), { scaleY: 1, transformOrigin: '50% 100%', duration: 1 }, '+=0.3')
          .to(q('[data-bajada]'), { strokeDashoffset: 0, duration: 1.2 }, '<')
          .to(q('[data-flujo-baja]'), { opacity: 1, duration: 0.4 }, '<')
          .to(q('[data-colector]'), { opacity: 1, duration: 0.5 }, '<0.6')
          .to({}, { duration: 0.6 }) // aire al final del pin

        bucles(0)
        ScrollTrigger.refresh()
        return
      }

      // modo === 'hero' — la intro se reproduce sola y deja la planta armada
      // (clarificador incluido). El scroll ya no llena nada; en cambio, modula
      // la velocidad de los bucles ambiente.
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      armar(intro)
      const loops = bucles(intro.duration())

      // Los bucles siguen la velocidad del scroll: aceleran mientras el usuario
      // se mueve y decaen a ralenti (~1x) cuando se detiene, con techo en 3x.
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
        objetivo += (1 - objetivo) * 0.05 // decae a 1 cuando no llega mas velocidad
        const actual = loops.timeScale()
        loops.timeScale(actual + (objetivo - actual) * 0.1)
      }
      gsap.ticker.add(seguirScroll)
      limpiarTicker = () => gsap.ticker.remove(seguirScroll)

      ScrollTrigger.refresh()
    }, svg)

    return () => {
      limpiarTicker?.()
      ctx.revert()
    }
  }, [modo])

  return (
    <svg
      ref={raiz}
      viewBox={modo === 'seccion' ? '0 0 480 300' : '0 0 480 250'}
      role="img"
      aria-label="Esquema de una linea de tratamiento de efluentes: el agua residual entra a un reactor biologico con aireacion, pasa a un clarificador y sale como agua tratada."
      className={cn('block h-auto w-full max-w-120', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ep-agua-cruda" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-400)" />
          <stop offset="1" stopColor="var(--color-brand-700)" />
        </linearGradient>
        <linearGradient id="ep-agua-tratada" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-200)" />
          <stop offset="1" stopColor="var(--color-brand-400)" />
        </linearGradient>
        <clipPath id="ep-tanque-1">
          <rect x="152" y="82" width="96" height="116" rx="8" />
        </clipPath>
        <clipPath id="ep-tanque-2">
          <rect x="302" y="82" width="96" height="116" rx="8" />
        </clipPath>
      </defs>

      {/* Tuberias del proceso (horizontales) */}
      <g stroke={c.tuberia} strokeWidth="6" strokeLinecap="round">
        <path data-tuberia="" d="M18 150 H150" strokeDasharray="132" strokeDashoffset="132" />
        <path data-tuberia="" d="M250 150 H300" strokeDasharray="50" strokeDashoffset="50" />
        <path data-tuberia="" d="M400 150 H440" strokeDasharray="40" strokeDashoffset="40" />
      </g>

      {/* Tuberia de salida hacia abajo — la "dibuja" el scroll (solo en seccion) */}
      <path
        data-bajada=""
        d="M440 150 V284"
        stroke={c.tuberia}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="134"
        strokeDashoffset="134"
      />

      {/* Flujo por las tuberias */}
      <g
        data-flujo-wrap=""
        stroke="var(--color-brand-300)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 14"
      >
        <path data-flujo="" d="M18 150 H150" />
        <path data-flujo="" d="M250 150 H300" />
        <path data-flujo="" d="M400 150 H440" />
        <path data-flujo="" data-flujo-baja="" d="M440 150 V284" opacity="0" />
      </g>

      {/* Tanques */}
      <rect
        data-tanque=""
        x="150"
        y="80"
        width="100"
        height="120"
        rx="10"
        fill={c.tanqueFondo}
        stroke={c.tanqueBorde}
        strokeWidth="3"
      />
      <rect
        data-tanque=""
        x="300"
        y="80"
        width="100"
        height="120"
        rx="10"
        fill={c.tanqueFondo}
        stroke={c.tanqueBorde}
        strokeWidth="3"
      />

      {/* Agua */}
      <g clipPath="url(#ep-tanque-1)">
        <rect data-agua="" x="150" y="84" width="100" height="114" fill="url(#ep-agua-cruda)" />
      </g>
      <g clipPath="url(#ep-tanque-2)">
        <rect data-agua-clar="" x="300" y="84" width="100" height="114" fill="url(#ep-agua-tratada)" />
      </g>

      {/* Burbujas de aireacion (recortadas al reactor, invisibles en reposo) */}
      <g data-burbuja-grupo="" clipPath="url(#ep-tanque-1)" fill="var(--color-brand-100)">
        <circle data-burbuja="" cx="172" cy="192" r="3" opacity="0" />
        <circle data-burbuja="" cx="188" cy="192" r="4.5" opacity="0" />
        <circle data-burbuja="" cx="204" cy="192" r="3" opacity="0" />
        <circle data-burbuja="" cx="220" cy="192" r="5" opacity="0" />
        <circle data-burbuja="" cx="234" cy="192" r="3.5" opacity="0" />
      </g>

      {/* Aireador mecanico — el grupo aparece entero, solo giran las paletas */}
      <g data-aireador-grupo="">
        <rect x="192" y="60" width="16" height="13" rx="2" fill={c.motor} />
        <path d="M200 73 V96" stroke={c.motor} strokeWidth="3" strokeLinecap="round" />
        <g data-aireador="">
          <path d="M200 86 L206 98 L200 110 L194 98 Z" fill="var(--color-brand-500)" />
          <path d="M188 98 L200 92 L212 98 L200 104 Z" fill="var(--color-brand-500)" />
          <circle cx="200" cy="98" r="3" fill={c.motor} />
        </g>
      </g>

      {/* Molecula (biologia) girando sobre el clarificador */}
      <g data-molecula="">
        <g stroke={c.enlace} strokeWidth="1.5">
          <line x1="350" y1="44" x2="333" y2="55" />
          <line x1="350" y1="44" x2="367" y2="53" />
          <line x1="350" y1="44" x2="353" y2="27" />
        </g>
        <circle cx="350" cy="44" r="5" fill={c.nodo} />
        <circle cx="333" cy="55" r="4" fill="var(--color-brand-500)" />
        <circle cx="367" cy="53" r="4" fill="var(--color-brand-500)" />
        <circle cx="353" cy="27" r="3.5" fill="var(--color-lime)" />
      </g>

      {/* Colector de efluente tratado — aparece con el scroll (solo en seccion) */}
      <g data-colector="" opacity="0">
        <path
          d="M416 285 q24 13 48 0"
          fill="none"
          stroke="var(--color-brand-400)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse
          data-onda=""
          cx="440"
          cy="286"
          rx="7"
          ry="2.5"
          fill="none"
          stroke="var(--color-brand-300)"
          strokeWidth="1.5"
        />
        <ellipse
          data-onda=""
          cx="440"
          cy="286"
          rx="7"
          ry="2.5"
          fill="none"
          stroke="var(--color-brand-300)"
          strokeWidth="1.5"
        />
        <path
          data-gota=""
          d="M440 262 c-4 6 -4 10 0 12 c4 -2 4 -6 0 -12 Z"
          fill="var(--color-brand-400)"
          opacity="0"
        />
      </g>

      {/* Rotulos */}
      <g
        data-rotulo=""
        fill={c.rotulo}
        fontSize="9"
        fontFamily="inherit"
        letterSpacing="1.5"
        textAnchor="middle"
      >
        <text x="200" y="222">REACTOR</text>
        <text x="350" y="222">CLARIFICADOR</text>
      </g>
    </svg>
  )
}
