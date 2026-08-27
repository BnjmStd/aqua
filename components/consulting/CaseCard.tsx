import { Card } from '@/components/ui/Card'
import { esPoblado } from '@/lib/relaciones'
import type { Caso } from '@/payload-types'

export function CaseCard({ caso }: { caso: Caso }) {
  const cliente = caso.clienteAnonimo
    ? caso.descripcionClienteAnonimo
    : (esPoblado(caso.cliente) ? caso.cliente.nombre : null)

  return (
    <Card className="h-full">
      {cliente ? (
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">{cliente}</p>
      ) : null}
      <h3 className="mt-2 font-serif text-xl font-semibold text-foreground">{caso.titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/70">{caso.resumen}</p>

      {caso.metricas?.length ? (
        <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          {caso.metricas.map((metrica) => (
            <div key={metrica.id ?? metrica.descripcion}>
              <p className="font-serif text-2xl font-semibold text-brand-700 dark:text-brand-300">
                {metrica.valor}
              </p>
              <p className="text-xs text-foreground/60">{metrica.descripcion}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
