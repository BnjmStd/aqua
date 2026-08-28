'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { Heading } from '@/components/ui/Heading'
import { Icono } from '@/components/ui/iconos'
import { Text } from '@/components/ui/Text'
import type { NombreIcono } from '@/fields/iconos'
import type { Unidad } from '@/fields/unidad'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'

gsap.registerPlugin(ScrollTrigger)

type Props = {
  unidad: Unidad
  nombre: string
  descripcion: string
  icono: NombreIcono
}

/**
 * Burbujas de aireacion, como las del reactor pero para fondo claro: contorno
 * teal en vez del relleno claro que usa el esquema sobre navy. Suben por detras
 * del contenido y se escapan por arriba de la tarjeta.
 */
const BURBUJAS = [
  { left: '11%', size: 7 },
  { left: '27%', size: 10 },
  { left: '44%', size: 6 },
  { left: '61%', size: 9 },
  { left: '78%', size: 7 },
  { left: '91%', size: 5 },
]

/**
 * Tarjeta de una unidad de negocio. Se comporta como la maqueta original
 * (toda la tarjeta enlaza a `/unidad`) y suma el llenado: al entrar al
 * viewport un lavado de agua sube desde la base y, una vez llena, la tarjeta
 * "airea" burbujas mientras sigue a la vista.
 */
export function TarjetaUnidad({ unidad, nombre, descripcion, icono }: Props) {
  const raiz = useRef<HTMLAnchorElement>(null)
  const agua = useRef<HTMLSpanElement>(null)
  const glifo = useRef<HTMLSpanElement>(null)

  useIsomorphicLayoutEffect(() => {
    const el = raiz.current
    const aguaEl = agua.current
    if (!el || !aguaEl) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(aguaEl, { scaleY: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const glifoEl = glifo.current

      // Llenado: el agua sube y el icono despega mientras dura el gesto de scroll.
      const llenado = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: true },
      })
      llenado.fromTo(aguaEl, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%' }, 0)
      if (glifoEl) {
        llenado.fromTo(glifoEl, { scale: 0.92 }, { scale: 1.06, transformOrigin: '50% 100%' }, 0)
      }

      // Baile del icono: dos vaivenes de periodo distinto (nunca calzan, se ve
      // organico) y un arranque al azar para que las 5 tarjetas no vayan a la par.
      const baile = glifoEl
        ? gsap
            .timeline({ paused: true })
            .to(glifoEl, { y: -3, duration: 1.15, ease: 'sine.inOut', repeat: -1, yoyo: true }, 0)
            .to(
              glifoEl,
              {
                rotation: 6,
                transformOrigin: '50% 100%',
                duration: 1.9,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
              },
              0,
            )
            .seek(Math.random() * 2)
        : undefined

      // Burbujas: como las del reactor pero en contorno teal para fondo claro.
      const burbujasEls = el.querySelectorAll('[data-burbuja]')
      let burbujas: gsap.core.Tween | undefined
      if (burbujasEls.length) {
        gsap.set(burbujasEls, { y: 0, opacity: 0 })
        burbujas = gsap.to(burbujasEls, {
          keyframes: [
            { y: -16, opacity: 0.75, duration: 0.5 },
            { y: -110, opacity: 0.75, duration: 1.5 },
            { y: -200, opacity: 0, duration: 0.6 },
          ],
          ease: 'sine.out',
          stagger: { each: 0.5, from: 'random', repeat: -1 },
          paused: true,
        })
      }

      // Lo "vivo" (baile + burbujas) arranca cuando la tarjeta quedo llena
      // ('top 45%' = fin del llenado) y para al dejar de estarlo o salir de vista.
      if (baile || burbujas) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom top',
          onToggle: (self) => {
            if (self.isActive) {
              baile?.play()
              burbujas?.play()
            } else {
              baile?.pause(0)
              burbujas?.pause(0)
            }
          },
        })
      }
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <Link
      ref={raiz}
      href={`/${unidad}`}
      className="group relative rounded-lg border border-border bg-surface p-8 shadow-soft transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* El agua: `to-transparent` arriba, asi el borde superior aplastado por
          el scaleY no se nota; las esquinas de abajo siguen el radio de la tarjeta. */}
      <span
        ref={agua}
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 rounded-lg bg-linear-to-t from-brand-500/15 via-brand-400/8 to-transparent"
      />
      {BURBUJAS.map((b) => (
        <span
          key={b.left}
          data-burbuja
          aria-hidden
          className="pointer-events-none absolute bottom-3 rounded-full border border-brand-400/60 bg-brand-200/25 opacity-0"
          style={{ left: b.left, width: b.size, height: b.size }}
        />
      ))}
      <span className="relative block">
        <span ref={glifo} className="inline-block text-brand-700">
          <Icono nombre={icono} />
        </span>
        <Heading level={4} as="h3" className="mt-4">
          {nombre}
        </Heading>
        <Text className="mt-3">{descripcion}</Text>
      </span>
    </Link>
  )
}
