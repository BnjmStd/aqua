import Image from 'next/image'
import Link from 'next/link'

import { Campana } from '@/components/cuenta/Campana'
import { MenuCuenta } from '@/components/cuenta/MenuCuenta'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { RUTA_UNIDAD, UNIDADES_NAVEGABLES } from '@/fields/unidad'
import { obtenerCuentaActual } from '@/lib/auth'
import { obtenerResumen } from '@/queries/cuenta/notificaciones'
import { esPoblado } from '@/lib/relaciones'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'
import { MobileNav } from './MobileNav'
import { NavLink } from './NavLink'

const ENLACES_PRINCIPALES = [
  { etiqueta: 'Inicio', url: '/' },
  ...UNIDADES_NAVEGABLES.map(({ label, value }) => ({
    etiqueta: label.split(' — ')[0],
    url: RUTA_UNIDAD[value],
  })),
  { etiqueta: 'Fundador', url: '/fundador' },
]

// Dimensiones del asset estatico (public/logo.png). El logo del CMS trae las suyas.
const LOGO_ESTATICO = { src: '/logo.png', width: 600, height: 250 }

export async function Header() {
  const [cuenta, sitio] = await Promise.all([obtenerCuentaActual(), obtenerConfiguracionSitio()])
  // Estado inicial de la campana; despues se refresca sola desde el cliente.
  const avisos = cuenta ? await obtenerResumen({ coleccion: 'cuentas', id: cuenta.id }) : null

  const mailto = rutaContacto(correoParaMotivo(sitio))
  const logoCms = esPoblado(sitio.logo) ? sitio.logo : null
  const logo =
    logoCms?.url != null
      ? { src: logoCms.url, width: logoCms.width ?? 600, height: logoCms.height ?? 250 }
      : LOGO_ESTATICO

  return (
    // La maqueta usa una barra opaca sobre borde, no el vidrio esmerilado que
    // habia antes: el navy de la marca pierde contraste detras de un blur.
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={logo.src}
            alt={sitio.nombreComercial}
            width={logo.width}
            height={logo.height}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {ENLACES_PRINCIPALES.map((enlace) => (
            <NavLink key={enlace.url} href={enlace.url}>
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {cuenta ? (
            <>
              <Campana noLeidas={avisos?.noLeidas ?? 0} ultimas={avisos?.ultimas ?? []} />
              <MenuCuenta nombre={cuenta.nombre} email={cuenta.email} />
            </>
          ) : (
            <Button href="/cuenta/ingresar" variant="secundario" size="sm">
              Ingresar
            </Button>
          )}
          <Button href={mailto} variant="navy" size="sm">
            Contactar
          </Button>
        </div>

        <MobileNav
          enlaces={[...ENLACES_PRINCIPALES, { etiqueta: 'Contactar', url: mailto }]}
          cuenta={cuenta ? { nombre: cuenta.nombre, email: cuenta.email, noLeidas: avisos?.noLeidas ?? 0 } : null}
        />
      </Container>
    </header>
  )
}
