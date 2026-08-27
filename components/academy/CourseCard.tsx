import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { urlDeMedia } from '@/lib/media'
import type { Curso } from '@/payload-types'
import { ETIQUETA_MODALIDAD, ETIQUETA_NIVEL } from './etiquetas'

export function CourseCard({ curso }: { curso: Curso }) {
  const imagen = urlDeMedia(curso.imagenDestacada, 'card')

  return (
    <Link href={`/academy/cursos/${curso.slug}`} className="group block">
      <Card className="flex h-full flex-col p-0 transition-shadow group-hover:shadow-lg">
        <div className="aspect-4/3 w-full overflow-hidden rounded-t-lg bg-slate-100 dark:bg-slate-800">
          {imagen ? (
            <Image
              src={imagen}
              alt={curso.titulo}
              width={400}
              height={300}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6">
          {curso.nivel ? <Badge>{ETIQUETA_NIVEL[curso.nivel]}</Badge> : null}

          <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">{curso.titulo}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">{curso.resumen}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/50">
            <span>{curso.duracionHoras} h</span>
            {curso.modalidadesDisponibles?.slice(0, 2).map((modalidad) => (
              <span key={modalidad}>{ETIQUETA_MODALIDAD[modalidad]}</span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
