import { useEffect, useLayoutEffect } from 'react'

/**
 * `useLayoutEffect` en el cliente (fija el estado inicial antes del primer
 * paint y evita parpadeos en las animaciones), `useEffect` en SSR para no
 * emitir el warning de React. Mismo criterio que usa GSAP en sus ejemplos.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
