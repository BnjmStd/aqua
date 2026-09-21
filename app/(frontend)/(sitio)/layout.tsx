import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Avisos } from '@/components/ui/Avisos'

/**
 * Marco del sitio publico: todo lo que vive en (sitio) sale con Header y
 * Footer sin que cada pagina los repita.
 *
 * Tambien es lo que hace que not-found.tsx y error.tsx de este grupo se vean
 * dentro del sitio: error.tsx no envuelve al layout de su mismo segmento, asi
 * que el marco queda en pie y solo el contenido cambia por la pantalla de
 * error. Si lo que falla es el propio marco (p. ej. la base no responde al
 * armar el Header), el error sube a app/(frontend)/error.tsx, que muestra la
 * misma pantalla pero sin marco.
 *
 * Fuera del grupo quedan las rutas puente (/contacto, /consultoria/solicitud),
 * que abren el correo y vuelven atras sin mostrar nada.
 */
export default function SitioLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Avisos />
    </div>
  )
}
