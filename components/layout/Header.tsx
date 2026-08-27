import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { UNIDADES } from '@/fields/unidad'
import { obtenerCuentaActual } from '@/lib/auth'
import { MobileNav } from './MobileNav'
import { NavLink } from './NavLink'

const ENLACES_PRINCIPALES = [
  ...UNIDADES.map(({ label, value }) => ({
    etiqueta: label.split(' — ')[0],
    url: `/${value}`,
  })),
  // Fundador no es una unidad de negocio: va como enlace suelto al final.
  { etiqueta: 'Fundador', url: '/fundador' },
]

export async function Header() {
  const cuenta = await obtenerCuentaActual()

  return (
    // La maqueta usa una barra opaca sobre borde, no el vidrio esmerilado que
    // habia antes: el navy de la marca pierde contraste detras de un blur.
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-tight text-navy-800"
        >
          aquabioprocess
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {ENLACES_PRINCIPALES.map((enlace) => (
            <NavLink key={enlace.url} href={enlace.url}>
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href={cuenta ? '/cuenta' : '/cuenta/ingresar'} variant="secundario" size="sm">
            {cuenta ? 'Mi cuenta' : 'Ingresar'}
          </Button>
          <Button href="/contacto" variant="navy" size="sm">
            Contactar
          </Button>
        </div>

        <MobileNav enlaces={ENLACES_PRINCIPALES} />
      </Container>
    </header>
  )
}
