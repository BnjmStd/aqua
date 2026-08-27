import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { UNIDADES } from '@/fields/unidad'
import { WhatsAppFlotante } from './WhatsAppFlotante'

const ENLACES_LEGALES = [
  { etiqueta: 'Política de privacidad', url: '/privacidad' },
  { etiqueta: 'Contacto', url: '/contacto' },
]

export function Footer() {
  const anio = new Date().getFullYear()

  return (
    <>
      <WhatsAppFlotante />

      <footer className="border-t border-brand-100 bg-brand-50 dark:border-brand-900 dark:bg-brand-950/40">
        <Container className="py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">aquabioprocess</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/60">
                Consultoría científico-técnica en tratamiento de aguas, efluentes industriales y
                procesos biológicos.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Unidades</p>
              <ul className="mt-4 space-y-2">
                {UNIDADES.map((unidad) => (
                  <li key={unidad.value}>
                    <Link
                      href={`/${unidad.value}`}
                      className="text-sm text-foreground/60 hover:text-foreground"
                    >
                      {unidad.label.split(' — ')[0]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Legal</p>
              <ul className="mt-4 space-y-2">
                {ENLACES_LEGALES.map((enlace) => (
                  <li key={enlace.url}>
                    <Link href={enlace.url} className="text-sm text-foreground/60 hover:text-foreground">
                      {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Contacto</p>
              <p className="mt-4 text-sm text-foreground/60">contacto@aquabioprocess.cl</p>
            </div>
          </div>

          <p className="mt-16 text-xs text-foreground/40">
            © {anio} SALINAS AQUABIOPROCESS EXPERT CONSULTING SpA.
          </p>
        </Container>
      </footer>
    </>
  )
}
