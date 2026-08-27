/**
 * Validacion de RUT chileno (modulo 11).
 * Se usa en inscripciones y datos de facturacion: un RUT mal cargado se
 * descubre recien al emitir la factura, cuando ya es tarde.
 */

/** Deja solo digitos y el digito verificador, en mayuscula. */
export const normalizarRut = (rut: string): string =>
  rut.replace(/[.\-\s]/g, '').toUpperCase()

export const esRutValido = (rut: string): boolean => {
  const limpio = normalizarRut(rut)
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false

  const cuerpo = limpio.slice(0, -1)
  const dvIngresado = limpio.slice(-1)

  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)

  return dvIngresado === dvEsperado
}

/** Formatea a 12.345.678-9 */
export const formatearRut = (rut: string): string => {
  const limpio = normalizarRut(rut)
  if (limpio.length < 2) return rut
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}
