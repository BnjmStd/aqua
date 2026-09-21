export type Moneda = 'CLP' | 'UF' | 'USD'

const FORMATOS: Record<Exclude<Moneda, 'UF'>, Intl.NumberFormat> = {
  CLP: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD' }),
}

// La UF no es moneda ISO: Intl no la conoce, va como numero + sufijo.
const FORMATO_UF = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })

/** $180.000 · US$250,00 · 4,5 UF */
export function formatearMonto(monto: number, moneda: Moneda | null | undefined = 'CLP') {
  if (moneda === 'UF') return `${FORMATO_UF.format(monto)} UF`
  return FORMATOS[moneda ?? 'CLP'].format(monto)
}
