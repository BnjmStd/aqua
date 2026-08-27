import type { Caso } from '@/payload-types'
import { CaseCard } from './CaseCard'

export function CaseCatalog({ casos }: { casos: Caso[] }) {
  if (!casos.length) return null

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {casos.map((caso) => (
        <CaseCard key={caso.id} caso={caso} />
      ))}
    </div>
  )
}
