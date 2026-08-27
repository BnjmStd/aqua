import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { esPoblado, type BloqueDeTipo } from './types'

export function Equipo({ titulo, personas }: BloqueDeTipo<'equipo'>) {
  const equipo = (personas ?? []).filter(esPoblado)
  if (!equipo.length) return null

  return (
    <Section>
      <Container>
        {titulo ? (
          <Heading level={2} className="mb-12 text-center">
            {titulo}
          </Heading>
        ) : null}

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {equipo.map((persona) => {
            const foto = esPoblado(persona.foto) ? persona.foto : null

            return (
              <div key={persona.id} className="text-center">
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  {foto?.url ? (
                    <Image
                      src={foto.url}
                      alt={foto.alt}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="mt-4 font-medium text-foreground">{persona.nombre}</p>
                {persona.cargo ? (
                  <p className="text-sm text-foreground/60">{persona.cargo}</p>
                ) : null}
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
