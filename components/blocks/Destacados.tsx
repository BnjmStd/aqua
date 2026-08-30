import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { esPoblado, type BloqueDeTipo } from './types'

const ETIQUETA_ORIGEN: Record<BloqueDeTipo<'destacados'>['origen'], string> = {
  servicios: 'Servicio',
  cursos: 'Curso',
  convocatorias: 'Convocatoria',
  tecnologias: 'Tecnología',
  articulos: 'Artículo',
  casos: 'Caso',
  proyectos: 'Proyecto',
}

export function Destacados({ titulo, origen, documentos }: BloqueDeTipo<'destacados'>) {
  const items = (documentos ?? [])
    .map((doc) => doc.value)
    .filter(esPoblado)
    .filter((item): item is typeof item & { titulo: string; resumen?: string | null } => 'titulo' in item)

  if (!items.length) return null

  return (
    <Section textura>
      <Container className="relative">
        {titulo ? (
          <Heading level={2} className="mb-12">
            {titulo}
          </Heading>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
              <Badge>{ETIQUETA_ORIGEN[origen]}</Badge>
              <h3 className="mt-4 font-serif text-xl font-semibold">{item.titulo}</h3>
              {item.resumen ? (
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{item.resumen}</p>
              ) : null}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
