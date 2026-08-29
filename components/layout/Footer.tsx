import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { UNIDADES_NAVEGABLES } from '@/fields/unidad'
import { obtenerConfiguracionSitio } from '@/lib/sitio'
import { WhatsAppFlotante } from './WhatsAppFlotante'

const ENLACES_LEGALES = [
  { etiqueta: 'Política de privacidad', url: '/privacidad' },
  { etiqueta: 'Contacto', url: '/contacto' },
]

export async function Footer() {
  const anio = new Date().getFullYear()
  const sitio = await obtenerConfiguracionSitio()

  return (
    <>
      <WhatsAppFlotante />

      <footer className="bg-navy-950 text-white">
        <Container className="py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-serif text-lg font-semibold text-white">
                {sitio.nombreComercial}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-navy-300">
                Consultoría científico-técnica en tratamiento de aguas, efluentes industriales y
                procesos biológicos.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">Unidades</p>
              <ul className="mt-4 space-y-2">
                {UNIDADES_NAVEGABLES.map((unidad) => (
                  <li key={unidad.value}>
                    <Link
                      href={`/${unidad.value}`}
                      className="text-sm text-navy-300 transition-colors hover:text-brand-500"
                    >
                      {unidad.label.split(' — ')[0]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-white">Legal</p>
              <ul className="mt-4 space-y-2">
                {ENLACES_LEGALES.map((enlace) => (
                  <li key={enlace.url}>
                    <Link href={enlace.url} className="text-sm text-navy-300 transition-colors hover:text-brand-500">
                      {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-white">Contacto</p>
              {sitio.email ? (
                <a
                  href={`mailto:${sitio.email}`}
                  className="mt-4 block text-sm text-navy-300 transition-colors hover:text-brand-500"
                >
                  {sitio.email}
                </a>
              ) : null}
            </div>
          </div>

          <p className="mt-16 text-xs text-navy-400">
            © {anio} {sitio.razonSocial}. Todos los derechos reservados.
          </p>
        </Container>
      </footer>
    </>
  )
}
