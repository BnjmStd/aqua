'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'

gsap.registerPlugin(ScrollTrigger)

/** Los hijos entran escalonados al llegar al viewport. Respeta reduced-motion. */
export function RevelarLista({ children, className }: { children: ReactNode; className?: string }) {
  const raiz = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        y: 22,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 86%' },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={raiz} className={className}>
      {children}
    </div>
  )
}
