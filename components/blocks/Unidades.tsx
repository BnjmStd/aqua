import { CanalUnidades } from '@/components/ui/CanalUnidades'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { MoleculaTitulo } from '@/components/ui/MoleculaTitulo'
import { Section } from '@/components/ui/Section'
import { TarjetaUnidad } from '@/components/ui/TarjetaUnidad'
import { Text } from '@/components/ui/Text'
import type { NombreIcono } from '@/fields/iconos'
import { UNIDADES, type Unidad } from '@/fields/unidad'
import type { BloqueDeTipo } from './types'

const ICONO_UNIDAD: Record<Unidad, NombreIcono> = {
  consulting: 'lupa',
  academy: 'birrete',
  technologies: 'chip',
  insights: 'documento',
  rnd: 'matraz',
}

/** Los labels de UNIDADES traen el descriptor tras un guion largo: lo cortamos. */
const NOMBRE_UNIDAD = Object.fromEntries(
  UNIDADES.map(({ label, value }) => [value, label.split(' — ')[0]]),
) as Record<Unidad, string>

export function Unidades({ titulo, bajada, tarjetas }: BloqueDeTipo<'unidades'>) {
  if (!tarjetas?.length) return null

  return (
    <Section>
      <Container>
        {(titulo || bajada) && (
          <div className="mx-auto mb-16 max-w-3xl text-center">
            {titulo && (
              <>
                <MoleculaTitulo className="mx-auto mb-3" />
                <Heading level={2}>{titulo}</Heading>
              </>
            )}
            {bajada && (
              <Text tone="lead" className="mt-4">
                {bajada}
              </Text>
            )}
          </div>
        )}

        {/* La grilla vive dentro de CanalUnidades para que la tuberia animada
            pueda medir cada tarjeta y ramificarse hacia ellas (solo en desktop). */}
        <CanalUnidades>
          {tarjetas.map((tarjeta) => (
            <TarjetaUnidad
              key={tarjeta.id ?? tarjeta.unidad}
              unidad={tarjeta.unidad}
              nombre={NOMBRE_UNIDAD[tarjeta.unidad]}
              descripcion={tarjeta.descripcion}
              icono={ICONO_UNIDAD[tarjeta.unidad]}
            />
          ))}
        </CanalUnidades>
      </Container>
    </Section>
  )
}
