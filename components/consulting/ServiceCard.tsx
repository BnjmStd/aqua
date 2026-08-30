import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Servicio } from '@/payload-types'
import { ETIQUETA_TIPO_SERVICIO } from './etiquetas'

export function ServiceCard({ servicio }: { servicio: Servicio }) {
  return (
    <Card className="h-full border-t-4 border-t-brand-500 transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
      {servicio.tipo ? <Badge>{ETIQUETA_TIPO_SERVICIO[servicio.tipo]}</Badge> : null}
      <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">{servicio.titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/70">{servicio.resumen}</p>
    </Card>
  )
}
