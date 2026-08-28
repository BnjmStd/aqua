import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { urlDeMedia } from '@/lib/media'
import type { Articulo } from '@/payload-types'

const ETIQUETA_TIPO: Record<Articulo['tipo'], string> = {
  articulo: 'Artículo',
  analisis: 'Análisis técnico',
  linkedin: 'LinkedIn',
  noticia: 'Noticia',
  caso_comentado: 'Caso comentado',
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

export function ArticleCard({ articulo }: { articulo: Articulo }) {
  const imagen = urlDeMedia(articulo.imagenDestacada, 'card')

  return (
    <Link href={`/insights/${articulo.slug}`} className="group block">
      <Card className="flex h-full flex-col p-0 transition-shadow group-hover:shadow-lg">
        {imagen ? (
          <div className="aspect-4/3 w-full overflow-hidden rounded-t-lg bg-navy-950">
            <Image
              src={imagen}
              alt={articulo.titulo}
              width={400}
              height={300}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col p-6">
          <Badge>{ETIQUETA_TIPO[articulo.tipo]}</Badge>
          <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">{articulo.titulo}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">{articulo.bajada}</p>
          <p className="mt-4 text-xs text-foreground/50">
            {FORMATO_FECHA.format(new Date(articulo.fechaPublicacion))}
            {articulo.tiempoLecturaMinutos ? ` · ${articulo.tiempoLecturaMinutos} min de lectura` : ''}
          </p>
        </div>
      </Card>
    </Link>
  )
}
