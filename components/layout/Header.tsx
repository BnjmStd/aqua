import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { UNIDADES } from '@/fields/unidad'
import { obtenerCuentaActual } from '@/lib/auth'
import { MobileNav } from './MobileNav'

const ENLACES_PRINCIPALES = UNIDADES.map(({ label, value }) => ({
  etiqueta: label.split(' — ')[0],
  url: `/${value}`,
}))

export async function Header() {
  const cuenta = await obtenerCuentaActual()

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-lg font-semibold tracking-tight text-foreground">
          aquabioprocess
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {ENLACES_PRINCIPALES.map((enlace) => (
            <Link
              key={enlace.url}
              href={enlace.url}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Button href={cuenta ? '/cuenta' : '/cuenta/ingresar'} variant="secundario" size="sm">
            {cuenta ? 'Mi cuenta' : 'Ingresar'}
          </Button>
          <Button href="/contacto" size="sm">
            Contactar
          </Button>
        </div>

        <MobileNav enlaces={ENLACES_PRINCIPALES} />
      </Container>
    </header>
  )
}
