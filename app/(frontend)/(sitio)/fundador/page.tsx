import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { obtenerPagina } from '@/queries/paginas'

const SLUG = 'fundador'

export async function generateMetadata(): Promise<Metadata> {
  const pagina = await obtenerPagina(SLUG)
  if (!pagina) return {}
  return {
    title: pagina.seo?.titulo ?? `${pagina.titulo} | aquabioprocess.cl`,
    description: pagina.seo?.descripcion ?? undefined,
  }
}

export default async function FundadorPage() {
  const pagina = await obtenerPagina(SLUG)
  if (!pagina) notFound()

  return <BlockRenderer bloques={pagina.bloques ?? []} />
}
