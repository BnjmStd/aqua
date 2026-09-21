import { redirect } from 'next/navigation'

import { BotonReenviarVerificacion } from '@/components/cuenta/BotonReenviarVerificacion'
import { Iniciales } from '@/components/cuenta/Iniciales'
import { NavCuenta } from '@/components/cuenta/NavCuenta'
import { Container } from '@/components/ui/Container'
import { obtenerCuentaActual } from '@/lib/auth'
import { cerrarSesion } from '../actions'

/**
 * Marco de las paginas privadas de /cuenta (resumen, inscripciones,
 * solicitudes, datos). /cuenta/ingresar y /cuenta/registro quedan fuera del
 * grupo (panel), sin sidebar.
 *
 * Ojo: esto NO es la guardia de acceso — cada pagina llama a `exigirCuenta`.
 * Aca solo se lee la cuenta para pintar el nombre.
 */
export default async function PanelCuentaLayout({ children }: LayoutProps<'/cuenta'>) {
  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect('/cuenta/ingresar?redirect=/cuenta')

  return (
    <section className="py-10 sm:py-16">
      {/* `minmax(0,1fr)`: sin el 0, la fila de pestañas moviles ensancha la columna y la pagina desborda. */}
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
        <aside className="min-w-0 md:sticky md:top-28 md:self-start">
          <div className="mb-4 flex items-center gap-3 md:mb-6">
            <Iniciales nombre={cuenta.nombre} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{cuenta.nombre}</p>
              <p className="truncate text-sm text-muted">{cuenta.email}</p>
            </div>
          </div>

          <NavCuenta />

          <form action={cerrarSesion} className="mt-6 hidden border-t border-border pt-4 md:block">
            <button type="submit" className="px-3 text-sm text-muted transition-colors hover:text-brand-700">
              Cerrar sesión
            </button>
          </form>
        </aside>

        <div className="min-w-0">
          {cuenta.correoVerificadoEl ? null : (
            <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-amber-900">
                <span className="font-medium">Verifica tu correo.</span> Te enviamos un enlace a {cuenta.email}; sin
                eso no podemos avisarte de tus cursos ni de tus pagos.
              </p>
              <BotonReenviarVerificacion />
            </div>
          )}
          {children}
        </div>
      </Container>
    </section>
  )
}
