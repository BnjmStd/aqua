/**
 * Distingue una relacion resuelta (objeto, `depth >= 1`) de una sin poblar
 * (solo el id como string). Compartido entre blocks/ y cualquier otro
 * dominio que consuma relaciones de Payload (academy/, etc).
 */
export function esPoblado<T>(valor: string | T | null | undefined): valor is T {
  return typeof valor === 'object' && valor !== null
}
