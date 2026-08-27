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
    antetitulo: 'Salinas Aquabioprocess Expert Consulting SpA.',
    // Placeholder: cuando la home lea de Payload, `imagenFondo` llega como
    // relacion resuelta desde la coleccion media y este literal desaparece.
    imagenFondo: {
      id: 'hero-placeholder',
      alt: 'Planta de tratamiento de aguas industriales con estanques de acero, tableros de control y laboratorio de analisis.',
      url: '/hero-planta.jpg',
      width: 1408,
      height: 768,
      updatedAt: '',
      createdAt: '',
    },
    titulo: 'Science behind the process. Experience behind the solution.',
    bajada:
      'Consultoría científico-técnica para transformar datos, biología y experiencia industrial en decisiones operacionales.',
    acciones: [
      { id: '1', texto: 'Conversemos', enlace: '/contacto', estilo: 'primario' },
      { id: '2', texto: 'Ver servicios', enlace: '/consulting', estilo: 'secundario' },
    ],
  },
  {
    blockType: 'unidades',
    id: 'unidades-demo',
    titulo: 'Soluciones Integrales',
    bajada:
      'Nuestra arquitectura de marca abarca todas las áreas críticas para el éxito sostenible en el tratamiento de aguas y efluentes industriales.',
    tarjetas: [
      {
        id: '1',
        unidad: 'consulting',
        descripcion:
          'Auditorías especializadas, diagnóstico de sistemas y optimización de procesos operativos para garantizar eficiencia técnica y regulatoria.',
      },
      {
        id: '2',
        unidad: 'academy',
        descripcion:
          'Programas de formación técnica y capacitación operativa en modalidades online, in-company y presencial, diseñados a medida.',
      },
      {
        id: '3',
        unidad: 'technologies',
        descripcion:
          'Representación, evaluación y validación de tecnologías avanzadas e innovadoras aplicables al tratamiento de aguas y lodos.',
      },
      {
        id: '4',
        unidad: 'insights',
        descripcion:
          'Difusión de conocimiento a través de artículos técnicos, presencia activa en LinkedIn y nuestro newsletter especializado.',
      },
      {
        id: '5',
        unidad: 'rnd',
        descripcion:
          'Investigación aplicada, desarrollo de pilotajes y fomento de la innovación técnica continua para resolver desafíos complejos.',
      },
    ],
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
    blockType: 'propuesta',
    id: 'propuesta-demo',
    titulo: 'Propuesta de Valor',
    bajada:
      'Integramos conocimiento técnico y datos operativos para transformar el tratamiento de efluentes industriales en un proceso predecible y eficiente.',
    pilares: [
      {
        id: '1',
        icono: 'molecula',
        titulo: 'Ciencia + Biología',
        descripcion: 'Fundamentos microbiológicos aplicados a la ingeniería de procesos.',
      },
      {
        id: '2',
        icono: 'ajustes',
        titulo: 'Proceso',
        descripcion: 'Optimización continua y estabilidad operativa.',
      },
      {
        id: '3',
        icono: 'grafico',
        titulo: 'Datos',
        descripcion: 'Análisis métrico para toma de decisiones precisas.',
      },
      {
        id: '4',
        icono: 'casco',
        titulo: 'Experiencia Operacional',
        descripcion:
          'Años en campo garantizando que las soluciones teóricas funcionen en la práctica industrial.',
      },
    ],
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
