import { EmptyState } from '@/components/ui/EmptyState'
import type { Curso } from '@/payload-types'
import { CourseCard } from './CourseCard'

export function CourseCatalog({ cursos }: { cursos: Curso[] }) {
  if (!cursos.length) {
    return (
      <EmptyState
        titulo="Todavía no hay cursos publicados"
        descripcion="Vuelve a revisar pronto — estamos preparando el catálogo de Academy."
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cursos.map((curso) => (
        <CourseCard key={curso.id} curso={curso} />
      ))}
    </div>
  )
}
