import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { urlDeMedia } from '@/lib/media'
import type { Servicio } from '@/payload-types'
import { ETIQUETA_TIPO_SERVICIO } from './etiquetas'

/** Tarjeta del catalogo: lleva a la ficha singular del servicio. */
export function ServiceCard({ servicio }: { servicio: Servicio }) {
  const imagen = urlDeMedia(servicio.imagenDestacada, 'card')
  const href = `/consultoria/servicios/${servicio.slug}`

  return (
    <Link href={href} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-shadow group-hover:shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden bg-navy-950">
          {imagen ? (
            <Image
              src={imagen}
              alt={servicio.titulo}
              fill
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-brand-700/40" />
          )}
        </div>

        <div className="flex flex-1 flex-col border-t-4 border-t-brand-500 p-6">
          {servicio.tipo ? <Badge>{ETIQUETA_TIPO_SERVICIO[servicio.tipo]}</Badge> : null}
          <h3 className="mt-3 font-serif text-xl font-semibold text-foreground group-hover:text-brand-800">
            {servicio.titulo}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">{servicio.resumen}</p>
          <p className="mt-4 text-sm font-medium text-brand-700">Ver servicio →</p>
        </div>
      </Card>
    </Link>
  )
}
