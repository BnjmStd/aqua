import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { obtenerPagina } from '@/queries/paginas'

const SLUG = 'inicio'

export async function generateMetadata(): Promise<Metadata> {
  const pagina = await obtenerPagina(SLUG)
  if (!pagina) return {}
  return {
    title: pagina.seo?.titulo ?? pagina.titulo,
    description: pagina.seo?.descripcion ?? undefined,
  }
}

export default async function Home() {
  const pagina = await obtenerPagina(SLUG)
  if (!pagina) notFound()

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <BlockRenderer bloques={pagina.bloques ?? []} />
      </main>
      <Footer />
    </div>
  )
}
