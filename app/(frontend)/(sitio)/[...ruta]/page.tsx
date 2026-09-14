import { notFound } from 'next/navigation'

/**
 * Atrapa toda URL que no calza con otra ruta para que su 404 salga con el
 * marco del sitio (not-found.tsx de este grupo).
 *
 * Es la alternativa a app/global-not-found.tsx, que Next propone para apps
 * con varios layouts raiz como esta, pero que renderiza un documento suelto:
 * sin layout, sin Header ni Footer.
 *
 * No pisa a nadie: Next prefiere siempre las rutas estaticas y los catch-all
 * mas especificos, asi que /admin y /api siguen yendo a Payload.
 */
export default function RutaInexistente() {
  notFound()
}
