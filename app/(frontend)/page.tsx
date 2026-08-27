import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import type { Bloque, BloqueDeTipo } from '@/components/blocks/types'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

type Texto = BloqueDeTipo<'contenido'>['texto']

/**
 * Contenido de ejemplo, uno de cada bloque, para revisar el sistema de diseño
 * sin depender todavia de datos reales de Payload (ver plan: conectar
 * payload.find() queda para la siguiente pasada).
 */
function parrafo(texto: string): Texto {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          children: [{ type: 'text', version: 1, text: texto, format: 0, detail: 0, mode: 'normal', style: '' }],
        },
      ],
    },
  } as Texto
}

const BLOQUES_DEMO: Bloque[] = [
  {
    blockType: 'hero',
    id: 'hero-demo',
    titulo: 'Science behind the process. Experience behind the solution.',
    bajada:
      'Consultoría científico-técnica para transformar datos, biología y experiencia industrial en decisiones operacionales.',
    acciones: [
      { id: '1', texto: 'Conversemos', enlace: '/contacto', estilo: 'primario' },
      { id: '2', texto: 'Ver servicios', enlace: '/consulting', estilo: 'secundario' },
    ],
  },
  {
    blockType: 'contenido',
    id: 'contenido-demo',
    texto: parrafo(
      'Acompañamos a industrias y empresas de ingeniería a comprender el comportamiento de sus sistemas, identificar causas de desviaciones y convertir el diagnóstico en acciones concretas de mejora. Experiencia profunda en celulosa y papel, aplicable a sectores intensivos en agua y tratamiento biológico.',
    ),
  },
  {
    blockType: 'cta',
    id: 'cta-demo',
    titulo: '¿Tienes un desafío operacional en mente?',
    texto: 'Agenda una conversación inicial sin costo con nuestro equipo técnico.',
    textoBoton: 'Escríbenos',
    enlace: '/contacto',
  },
  {
    blockType: 'faq',
    id: 'faq-demo',
    titulo: 'Preguntas frecuentes',
    preguntas: [
      {
        id: '1',
        pregunta: '¿Trabajan con empresas fuera de Chile?',
        respuesta: parrafo('Sí, prestamos servicios de consultoría remota y presencial en Latinoamérica.'),
      },
      {
        id: '2',
        pregunta: '¿Cómo empieza un proyecto con aquabioprocess?',
        respuesta: parrafo('Con un diagnóstico inicial para dimensionar alcance, plazos y equipo requerido.'),
      },
    ],
  },
]

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <BlockRenderer bloques={BLOQUES_DEMO} />
      </main>
      <Footer />
    </div>
  )
}
