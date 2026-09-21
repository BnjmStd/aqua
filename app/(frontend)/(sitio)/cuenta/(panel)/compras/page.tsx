import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { exigirCuenta } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { type Moneda, formatearMonto } from '@/lib/moneda'
import { esPoblado } from '@/lib/relaciones'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import type { Inscripcione } from '@/payload-types'
import { obtenerMisCompras } from '@/queries/cuenta/compras'
import { FORMATO_FECHA } from '../items'

type EstadoPago = Inscripcione['pago']['estadoPago']

const ETIQUETA_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: 'Pago pendiente',
  pagado: 'Pagado',
  parcial: 'Pago parcial',
  reembolsado: 'Reembolsado',
  sin_costo: 'Sin costo',
}

const ESTILO_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: 'bg-amber-50 text-amber-800',
  parcial: 'bg-amber-50 text-amber-800',
  pagado: '',
  reembolsado: 'bg-slate-100 text-slate-600',
  sin_costo: 'bg-slate-100 text-slate-600',
}

const ETIQUETA_MEDIO_PAGO: Record<NonNullable<Inscripcione['pago']['medioPago']>, string> = {
  transferencia: 'Transferencia',
  webpay: 'Webpay',
  flow: 'Flow',
  stripe: 'Tarjeta',
  orden_compra: 'Orden de compra',
  sence: 'Franquicia SENCE',
  otro: 'Otro medio',
}

const porPagar = (compra: Inscripcione) => compra.pago.estadoPago === 'pendiente' || compra.pago.estadoPago === 'parcial'

/** Lo que se ve de una compra, resuelto una vez para la tarjeta y los totales. */
function resumir(compra: Inscripcione) {
  const convocatoria = esPoblado(compra.convocatoria) ? compra.convocatoria : null
  const curso = convocatoria && esPoblado(convocatoria.curso) ? convocatoria.curso : null
  const precio = convocatoria?.valor.monto ?? null
  const monedaPrecio = (convocatoria?.valor.moneda ?? 'CLP') as Moneda
  const pagado = compra.pago.montoPagado ?? null
  const monedaPago = (compra.pago.moneda ?? monedaPrecio) as Moneda

  return {
    titulo: curso?.titulo ?? convocatoria?.titulo ?? 'Curso',
    slugCurso: curso?.slug ?? null,
    inicio: convocatoria ? new Date(convocatoria.fechaInicio) : null,
    precio,
    monedaPrecio,
    pagado,
    monedaPago,
  }
}

function TarjetaCompra({ compra, correo }: { compra: Inscripcione; correo: string }) {
  const { titulo, slugCurso, inicio, precio, monedaPrecio, pagado, monedaPago } = resumir(compra)
  const { estadoPago, medioPago, fechaPago, referenciaExterna } = compra.pago

  // Mientras falte pagar, el monto grande es el precio del curso; el abono va en la linea de "Llevas".
  const montoPrincipal =
    porPagar(compra) || pagado == null
      ? precio != null ? formatearMonto(precio, monedaPrecio) : null
      : formatearMonto(pagado, monedaPago)

  const lineaPago = [
    estadoPago === 'pendiente' ? null : fechaPago ? `Pagado el ${FORMATO_FECHA.format(new Date(fechaPago))}` : null,
    medioPago ? ETIQUETA_MEDIO_PAGO[medioPago] : null,
  ].filter(Boolean)

  const asunto = `Pago de inscripción — ${titulo}`
  const cuerpo =
    `Hola, quiero coordinar el pago de mi inscripción a "${titulo}"` +
    (inicio ? ` (inicio ${FORMATO_FECHA.format(inicio)})` : '') +
    `. Participante: ${compra.participanteNombre}.`
  const mailtoPago = `mailto:${correo}?${new URLSearchParams({ subject: asunto, body: cuerpo })}`

  return (
    <Card className="p-5 hover:shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {slugCurso ? (
            <Link href={`/academia/cursos/${slugCurso}`} className="font-medium text-foreground hover:text-brand-700">
              {titulo}
            </Link>
          ) : (
            <p className="font-medium text-foreground">{titulo}</p>
          )}
          <p className="mt-1 text-sm text-foreground/60">
            Comprado el {FORMATO_FECHA.format(new Date(compra.createdAt))}
            {lineaPago.length ? ` · ${lineaPago.join(' · ')}` : null}
          </p>
          <p className="mt-1 text-xs text-foreground/50">
            Participante: {compra.participanteNombre}
            {compra.requiereFactura ? ' · Con factura' : ''}
          </p>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
          {montoPrincipal ? (
            <p className={cn('font-serif text-xl font-semibold text-navy-800', estadoPago === 'reembolsado' && 'text-foreground/50 line-through')}>
              {montoPrincipal}
            </p>
          ) : null}
          <Badge className={ESTILO_ESTADO_PAGO[estadoPago]}>{ETIQUETA_ESTADO_PAGO[estadoPago]}</Badge>
        </div>
      </div>

      {estadoPago === 'parcial' && pagado != null && precio != null ? (
        <p className="mt-3 text-sm text-amber-800">
          Llevas {formatearMonto(pagado, monedaPago)} de {formatearMonto(precio, monedaPrecio)}. Faltan{' '}
          {monedaPago === monedaPrecio ? formatearMonto(Math.max(precio - pagado, 0), monedaPrecio) : 'algunos pagos'}.
        </p>
      ) : null}

      {porPagar(compra) ? (
        <div className="mt-4 flex flex-col gap-3 rounded-md bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">Para completar el pago, escríbenos y te enviamos las instrucciones.</p>
          <Button href={mailtoPago} variant="secundario" size="sm" className="shrink-0 bg-surface">
            Coordinar pago
          </Button>
        </div>
      ) : null}

      {referenciaExterna || compra.requiereFactura ? (
        <details className="group mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer list-none text-sm text-brand-700 hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Ver detalle</span>
            <span className="hidden group-open:inline">Ocultar detalle</span>
          </summary>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {referenciaExterna ? (
              <div>
                <dt className="text-foreground/50">N° de transacción</dt>
                <dd className="font-mono text-foreground">{referenciaExterna}</dd>
              </div>
            ) : null}
            {inicio ? (
              <div>
                <dt className="text-foreground/50">Inicio del curso</dt>
                <dd className="text-foreground">{FORMATO_FECHA.format(inicio)}</dd>
              </div>
            ) : null}
            {compra.requiereFactura && compra.facturacion?.razonSocial ? (
              <div>
                <dt className="text-foreground/50">Factura a nombre de</dt>
                <dd className="text-foreground">
                  {compra.facturacion.razonSocial}
                  {compra.facturacion.rut ? ` · ${compra.facturacion.rut}` : ''}
                </dd>
              </div>
            ) : null}
            {compra.facturacion?.ordenCompra ? (
              <div>
                <dt className="text-foreground/50">Orden de compra</dt>
                <dd className="text-foreground">{compra.facturacion.ordenCompra}</dd>
              </div>
            ) : null}
          </dl>
        </details>
      ) : null}
    </Card>
  )
}

export default async function MisComprasPage() {
  const cuenta = await exigirCuenta('/cuenta/compras')
  const [compras, sitio] = await Promise.all([obtenerMisCompras(cuenta.id), obtenerConfiguracionSitio()])
  const correo = correoParaMotivo(sitio)

  const pendientes = compras.filter(porPagar)
  const historial = compras.filter((compra) => !porPagar(compra))

  // Total pagado por moneda: CLP, UF y USD no se suman entre si.
  const totales = new Map<Moneda, number>()
  for (const compra of compras) {
    if (compra.pago.estadoPago === 'reembolsado') continue
    const { pagado, monedaPago } = resumir(compra)
    if (pagado) totales.set(monedaPago, (totales.get(monedaPago) ?? 0) + pagado)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Heading level={2}>Mis compras</Heading>
        <Button href="/academia/cursos" variant="secundario" size="sm">
          Ver cursos
        </Button>
      </div>
      <Text tone="muted" className="mt-2">
        Tus pagos de cursos e inscripciones, incluidas las que hiciste para otras personas.
      </Text>

      {compras.length ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="p-5 hover:shadow-soft">
              <p className="text-sm text-foreground/60">Total pagado</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-navy-800">
                {totales.size
                  ? [...totales].map(([moneda, total]) => formatearMonto(total, moneda)).join(' + ')
                  : formatearMonto(0)}
              </p>
            </Card>
            <Card className="p-5 hover:shadow-soft">
              <p className="text-sm text-foreground/60">Pagos pendientes</p>
              <p className={cn('mt-1 font-serif text-2xl font-semibold', pendientes.length ? 'text-amber-700' : 'text-navy-800')}>
                {pendientes.length}
              </p>
            </Card>
          </div>

          {pendientes.length ? (
            <div className="mt-10">
              <Heading level={4} as="h3">
                Por pagar
              </Heading>
              <div className="mt-4 space-y-3">
                {pendientes.map((compra) => (
                  <TarjetaCompra key={compra.id} compra={compra} correo={correo} />
                ))}
              </div>
            </div>
          ) : null}

          {historial.length ? (
            <div className="mt-10">
              <Heading level={4} as="h3">
                Historial
              </Heading>
              <div className="mt-4 space-y-3">
                {historial.map((compra) => (
                  <TarjetaCompra key={compra.id} compra={compra} correo={correo} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            titulo="Aún no tienes compras"
            descripcion="Cuando te inscribas a un curso con costo, aquí vas a ver el pago y su estado."
            accion={
              <Button href="/academia/cursos" size="sm">
                Ver cursos
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
