import { EmptyState } from '@/components/ui/EmptyState'
import type { Servicio } from '@/payload-types'
import { ServiceCard } from './ServiceCard'

export function ServiceCatalog({ servicios }: { servicios: Servicio[] }) {
  if (!servicios.length) {
    return (
      <EmptyState
        titulo="Todavía no hay servicios publicados"
        descripcion="Estamos documentando el catálogo de Consulting."
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {servicios.map((servicio) => (
        <ServiceCard key={servicio.id} servicio={servicio} />
      ))}
    </div>
  )
}
