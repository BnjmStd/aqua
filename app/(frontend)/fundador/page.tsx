import type { Metadata } from 'next'

import { Cta } from '@/components/blocks/Cta'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Icono } from '@/components/ui/iconos'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import type { NombreIcono } from '@/fields/iconos'

export const metadata: Metadata = {
  title: 'Fundador | aquabioprocess.cl',
  description:
    'Más de 20 años de experiencia técnica en tratamiento de efluentes industriales: rigor científico y gestión operacional.',
}

/**
 * Primera pasada de la maqueta docs/templates/fundador,.html: la pagina se
 * arma SOLO con primitivas que ya existen (Section, Container, Heading, Text,
 * Button, Card, Icono). El contenido de abajo viene del template y esta
 * pendiente de confirmar (nombre del fundador, plantas, cifras). Cuando se
 * conecte a Payload, estos literales salen de una coleccion/global.
 */

const METODOLOGIA: { icono: NombreIcono; titulo: string; descripcion: string }[] = [
  {
    icono: 'ajustes',
    titulo: 'Gestión operacional',
    descripcion:
      'Optimización de procesos biológicos y físico-químicos en tiempo real. Análisis de datos operativos para decidir sobre evidencia y modelos predictivos.',
  },
  {
    icono: 'casco',
    titulo: 'Mantenimiento preventivo y correctivo',
    descripcion:
      'Sinergia entre el área biológica y la mecánica. Detección temprana de fallas en aireación, bombeo y clarificación para evitar disrupciones en el tratamiento.',
  },
  {
    icono: 'molecula',
    titulo: 'Cumplimiento ambiental',
    descripcion:
      'Aseguramiento de normativas estrictas. Monitoreo continuo de parámetros de descarga para proteger el ecosistema y evitar contingencias legales.',
  },
  {
    icono: 'grafico',
    titulo: 'Visión integrada',
    descripcion:
      'Análisis cruzado de variables de proceso, datos de laboratorio y reportes de mantenimiento para una lectura 360° de la planta.',
  },
]

const HUELLA: { pais: string; plantas: { nombre: string; descripcion: string; insignia?: boolean }[] }[] = [
  {
    pais: 'Chile',
    plantas: [
      {
        nombre: 'Planta Valdivia',
        descripcion:
          'Optimización del sistema de lodos activados e implementación de estrategias de control avanzado para efluentes de celulosa kraft.',
      },
      {
        nombre: 'Planta Nueva Aldea',
        descripcion:
          'Diagnóstico integral del tratamiento secundario y capacitación técnica especializada del equipo operativo.',
      },
      {
        nombre: 'Proyecto MAPA (Arauco)',
        descripcion:
          'Asesoría durante el comisionamiento y la puesta en marcha del sistema de tratamiento de efluentes de la línea 3.',
        insignia: true,
      },
    ],
  },
  {
    pais: 'Uruguay',
    plantas: [
      {
        nombre: 'Montes del Plata',
        descripcion:
          'Auditoría de desempeño del sistema biológico y desarrollo de protocolos de respuesta ante variaciones de carga orgánica.',
      },
    ],
  },
]

export default function FundadorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero — perfil del fundador */}
        <Section tone="brand">
          <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-brand-300">
                Fundador y consultor principal
              </p>
              <Heading level={1} as="h1" className="text-white">
                Dr. Miguel Salinas Maldonado
              </Heading>
              <Text tone="lead" className="mt-4 text-brand-200">
                Bioquímico, PhD y consultor principal
              </Text>
              <Text className="mt-6 border-l-2 border-brand-400 pl-4 text-white/80">
                Más de 20 años de experiencia técnica comprobada en la industria de la celulosa. Una
                trayectoria que combina el rigor científico con la excelencia en la gestión
                operacional, para procesos de tratamiento de efluentes eficientes y sostenibles.
              </Text>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button href="/contacto" variant="primario" size="lg">
                  Contactar al Dr. Salinas
                </Button>
                <Button
                  href="/contacto"
                  variant="secundario"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Descargar CV técnico
                </Button>
              </div>
            </div>

            {/* Espacio para el retrato: dejar /public/fundador.jpg y reemplazar por <Image /> */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/15 bg-navy-900">
                <div className="absolute inset-x-0 top-0 h-1 bg-lime" />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-md border border-white/15 bg-navy-950/90 p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-brand-300">Experiencia</p>
                    <p className="text-lg font-semibold text-white">20+ años</p>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-brand-300">Especialidad</p>
                    <p className="text-sm font-medium text-white">Celulosa</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Metodología interdisciplinaria */}
        <Section>
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <Heading level={2}>Metodología interdisciplinaria</Heading>
              <Text tone="lead" className="mt-4">
                Un enfoque holístico que integra las áreas críticas de la planta para garantizar un
                desempeño óptimo y continuo.
              </Text>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {METODOLOGIA.map((item) => (
                <Card key={item.titulo} className="flex flex-col">
                  <span className="text-brand-700">
                    <Icono nombre={item.icono} />
                  </span>
                  <Heading level={4} as="h3" className="mt-4">
                    {item.titulo}
                  </Heading>
                  <Text className="mt-2">{item.descripcion}</Text>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Huella geográfica */}
        <Section tone="muted">
          <Container>
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-brand-700">
                Presencia industrial
              </p>
              <Heading level={2}>Huella geográfica</Heading>
              <Text tone="lead" className="mt-4">
                Impacto regional en Chile y Uruguay, con experiencia transferible a operaciones
                complejas en toda la zona sur.
              </Text>
            </div>

            <div className="mt-14 grid gap-12 lg:grid-cols-2">
              {HUELLA.map((columna) => (
                <div key={columna.pais}>
                  <Heading level={3} as="h3">
                    {columna.pais}
                  </Heading>
                  <div className="mt-6 space-y-4">
                    {columna.plantas.map((planta) => (
                      <Card
                        key={planta.nombre}
                        className={planta.insignia ? 'border-l-4 border-l-lime' : undefined}
                      >
                        <Heading level={4} as="h4" className="text-xl">
                          {planta.nombre}
                        </Heading>
                        <Text className="mt-2">{planta.descripcion}</Text>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Cta
          blockType="cta"
          titulo="¿Necesitas experiencia técnica en tu planta?"
          texto="Coordinemos una conversación inicial para dimensionar el desafío."
          textoBoton="Conversemos"
          enlace="/contacto"
        />
      </main>
      <Footer />
    </div>
  )
}
