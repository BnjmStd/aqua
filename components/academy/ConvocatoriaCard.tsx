import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { esPoblado } from '@/lib/relaciones'
import { ETIQUETA_MODALIDAD } from './etiquetas'
import type { ConvocatoriaConCupo } from '@/queries/academy/convocatorias'

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

export function ConvocatoriaCard({ convocatoria }: { convocatoria: ConvocatoriaConCupo }) {
  const curso = esPoblado(convocatoria.curso) ? convocatoria.curso : null
  const href = curso ? `/academy/cursos/${curso.slug}` : '/academy/cursos'
  const lugar = convocatoria.lugar?.ciudad ?? convocatoria.lugar?.plataforma

  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{ETIQUETA_MODALIDAD[convocatoria.modalidad]}</Badge>
          {convocatoria.cuposDisponibles !== null && convocatoria.cuposDisponibles <= 3 ? (
            <Badge className="bg-navy-800/10 text-navy-800">
              {convocatoria.cuposDisponibles === 0 ? 'Cupo completo' : `Últimos ${convocatoria.cuposDisponibles} cupos`}
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
          {curso?.titulo ?? convocatoria.titulo}
        </h3>

        <div className="mt-4 space-y-1 text-sm text-foreground/70">
          <p>{FORMATO_FECHA.format(new Date(convocatoria.fechaInicio))}</p>
          {lugar ? <p>{lugar}</p> : null}
        </div>
      </Card>
    </Link>
  )
}
