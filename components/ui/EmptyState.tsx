import type { ReactNode } from 'react'

import { Heading } from './Heading'
import { Text } from './Text'

type EmptyStateProps = {
  titulo: string
  descripcion?: string
  icono?: ReactNode
  accion?: ReactNode
}

export function EmptyState({ titulo, descripcion, icono, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      {icono ? <div className="text-foreground/40">{icono}</div> : null}
      <Heading level={4} as="h3" className="text-foreground/80">
        {titulo}
      </Heading>
      {descripcion ? (
        <Text tone="muted" className="max-w-sm">
          {descripcion}
        </Text>
      ) : null}
      {accion ? <div className="mt-2">{accion}</div> : null}
    </div>
  )
}
