import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
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

/** Artículo destacado del equipo: banda ancha al inicio de /insights. */
export function FeaturedArticle({ articulo }: { articulo: Articulo }) {
  const imagen = urlDeMedia(articulo.imagenDestacada, 'hero')

  return (
    <Link
      href={`/insights/${articulo.slug}`}
      className="group mb-12 block overflow-hidden rounded-lg border border-border bg-surface shadow-soft transition-shadow hover:shadow-lg"
    >
      <div className="grid md:grid-cols-2">
        {imagen ? (
          <div className="relative aspect-video bg-navy-950 md:aspect-auto">
            <Image
              src={imagen}
              alt={articulo.titulo}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : null}

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <Badge>{ETIQUETA_TIPO[articulo.tipo]}</Badge>
            <span className="text-xs font-medium uppercase tracking-wide text-brand-700">
              Destacado
            </span>
          </div>
          <Heading level={2} as="h2" className="mt-4">
            {articulo.titulo}
          </Heading>
          <Text className="mt-3 text-foreground/70">{articulo.bajada}</Text>
          <p className="mt-5 text-xs text-foreground/50">
            {FORMATO_FECHA.format(new Date(articulo.fechaPublicacion))}
            {articulo.tiempoLecturaMinutos ? ` · ${articulo.tiempoLecturaMinutos} min de lectura` : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}
