'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'

gsap.registerPlugin(ScrollTrigger)

type Item = { id: string; pregunta: string; respuesta: ReactNode }

/**
 * Lista de preguntas frecuentes. Cada una es una tarjeta con borde de la paleta
 * que se acenta al abrir; entran escalonadas al llegar al viewport y el
 * acordeon abre/cierra con altura animada en vez del salto nativo.
 */
export function FaqLista({ items }: { items: Item[] }) {
  const lista = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const el = lista.current
    if (!el) return

    const detalles = Array.from(el.querySelectorAll<HTMLDetailsElement>('details'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.from(detalles, {
          y: 14,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 82%' },
        })
      }

      // Acordeon con altura animada (el <details> nativo salta de golpe).
      const quitar = detalles.map((det) => {
        const resumen = det.querySelector('summary')
        const cuerpo = det.querySelector<HTMLElement>('[data-respuesta]')
        if (!resumen || !cuerpo || reduce) return () => {}

        const alClic = (e: MouseEvent) => {
          e.preventDefault()
          if (det.open) {
            gsap.to(cuerpo, {
              height: 0,
              opacity: 0,
              duration: 0.28,
              ease: 'power2.inOut',
              onComplete: () => {
                det.open = false
                gsap.set(cuerpo, { height: 'auto', opacity: 1 })
              },
            })
          } else {
            det.open = true
            gsap.fromTo(
              cuerpo,
              { height: 0, opacity: 0 },
              { height: 'auto', opacity: 1, duration: 0.34, ease: 'power2.out' },
            )
          }
        }

        resumen.addEventListener('click', alClic)
        return () => resumen.removeEventListener('click', alClic)
      })

      return () => quitar.forEach((fn) => fn())
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={lista} className="space-y-3">
      {items.map((item) => (
        <details
          key={item.id}
          className="group overflow-hidden rounded-lg border border-brand-200 bg-surface shadow-soft transition-colors open:border-brand-400"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-foreground">
            {item.pregunta}
            <span
              aria-hidden
              className="grid size-6 shrink-0 place-items-center rounded-full border border-brand-300 text-brand-600 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div
            data-respuesta
            className="overflow-hidden px-5 pb-5 text-foreground/80 [&_p]:mt-2 [&_p]:leading-relaxed"
          >
            {item.respuesta}
          </div>
        </details>
      ))}
    </div>
  )
}
