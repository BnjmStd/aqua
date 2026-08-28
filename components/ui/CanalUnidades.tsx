'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { cn } from '@/lib/cn'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'

gsap.registerPlugin(ScrollTrigger)

const SVG_NS = 'http://www.w3.org/2000/svg'
/** El SVG asoma por encima de la grilla: ahi va el colector del que salen los ramales. */
const PAD_TOP = 40

type Props = { children: React.ReactNode; className?: string }

/**
 * Envuelve la grilla de tarjetas y dibuja —solo en desktop— la tuberia que
 * "baja" hacia esta seccion y se ramifica a cada tarjeta, dibujandose con el
 * scroll. Es una capa decorativa (aria-hidden, pointer-events:none): si el JS
 * no corre o hay prefers-reduced-motion, la grilla queda intacta y las lineas
 * aparecen ya trazadas.
 */
export function CanalUnidades({ children, className }: Props) {
  const marco = useRef<HTMLDivElement>(null)
  const grilla = useRef<HTMLDivElement>(null)
  const lienzo = useRef<SVGSVGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const marcoEl = marco.current
    const grillaEl = grilla.current
    const svg = lienzo.current
    if (!marcoEl || !grillaEl || !svg) return

    const escritorio = window.matchMedia('(min-width: 64rem)')
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)')
    let ctx: gsap.Context | undefined

    const construir = () => {
      ctx?.revert()
      ctx = undefined
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      // La grilla solo es de 3 columnas (5 tarjetas -> 3 + 2) en >= lg; por
      // debajo se apila y la tuberia no aporta, asi que no se dibuja.
      if (!escritorio.matches) return

      const caja = marcoEl.getBoundingClientRect()
      const cartas = Array.from(grillaEl.children) as HTMLElement[]
      if (!cartas.length || caja.width === 0) return

      const W = caja.width
      const H = caja.height + PAD_TOP
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

      const troncoX = Math.max(cartas[0].getBoundingClientRect().left - caja.left - 20, 6)
      const ramas: SVGPathElement[] = []
      let ramaYMax = 0

      cartas.forEach((carta) => {
        const r = carta.getBoundingClientRect()
        const cx = r.left - caja.left + r.width / 2
        const top = r.top - caja.top + PAD_TOP
        const ramaY = Math.max(top - 14, 6)
        ramaYMax = Math.max(ramaYMax, ramaY)
        const rad = 12
        const d = `M ${troncoX} ${ramaY} H ${cx - rad} Q ${cx} ${ramaY} ${cx} ${ramaY + rad} L ${cx} ${top}`
        const p = document.createElementNS(SVG_NS, 'path')
        p.setAttribute('d', d)
        p.setAttribute('stroke', 'currentColor')
        p.setAttribute('stroke-width', '1.75')
        p.setAttribute('stroke-linecap', 'round')
        p.setAttribute('opacity', '0.4')
        ramas.push(p)
      })

      const tronco = document.createElementNS(SVG_NS, 'path')
      tronco.setAttribute('d', `M ${troncoX} 0 V ${ramaYMax}`)
      tronco.setAttribute('stroke', 'currentColor')
      tronco.setAttribute('stroke-width', '2.5')
      tronco.setAttribute('stroke-linecap', 'round')
      tronco.setAttribute('opacity', '0.5')
      svg.appendChild(tronco)
      ramas.forEach((p) => svg.appendChild(p))

      const trazos = [tronco, ...ramas]
      trazos.forEach((p) => {
        const largo = p.getTotalLength()
        p.style.strokeDasharray = String(largo)
        p.style.strokeDashoffset = menosMovimiento.matches ? '0' : String(largo)
      })
      if (menosMovimiento.matches) return

      ctx = gsap.context(() => {
        gsap.to(tronco, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: marcoEl, start: 'top 92%', end: 'top 58%', scrub: true },
        })
        gsap.to(ramas, {
          strokeDashoffset: 0,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: marcoEl, start: 'top 82%', end: 'top 40%', scrub: true },
        })
      }, svg)
    }

    construir()

    let debounce: number | undefined
    const rehacer = () => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(() => {
        construir()
        ScrollTrigger.refresh()
      }, 150)
    }

    const ro = new ResizeObserver(rehacer)
    ro.observe(marcoEl)
    escritorio.addEventListener('change', rehacer)
    menosMovimiento.addEventListener('change', rehacer)

    return () => {
      window.clearTimeout(debounce)
      ro.disconnect()
      escritorio.removeEventListener('change', rehacer)
      menosMovimiento.removeEventListener('change', rehacer)
      ctx?.revert()
    }
  }, [])

  return (
    <div ref={marco} className={cn('relative', className)}>
      <svg
        ref={lienzo}
        aria-hidden="true"
        fill="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden overflow-visible text-brand-500 lg:block"
        style={{ top: -PAD_TOP }}
      />
      <div ref={grilla} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  )
}
