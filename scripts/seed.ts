import { existsSync } from 'fs'
import { join } from 'path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { Pagina } from '@/payload-types'

type BloquesPagina = NonNullable<Pagina['bloques']>

/**
 * Puebla una BD de desarrollo con el contenido base: configuracion del sitio,
 * un admin y las paginas de bloques (inicio, consulting, fundador).
 *
 *   npm run db:seed:contenido            # crea lo que falte, no pisa nada
 *   npm run db:seed:contenido -- --force # reescribe las paginas existentes
 *
 * Flujo para actualizar la semilla versionada:
 *   1. npm run db:seed:contenido -- --force
 *   2. npm run db:snapshot
 *   3. commitear aquabioprocess.seed.db
 *
 * Corre con `tsx --env-file=.env` (ver package.json).
 */

const force = process.argv.includes('--force')

const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? 'admin@aquabioprocess.cl',
  password: process.env.ADMIN_PASSWORD ?? 'aquabio-dev-2026',
  nombre: process.env.ADMIN_NOMBRE ?? 'Administrador',
}

/** Un parrafo suelto en el formato lexical que espera el campo richText. */
function parrafo(texto: string) {
  return {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
          children: [
            { type: 'text', version: 1, text: texto, format: 0, detail: 0, mode: 'normal', style: '' },
          ],
        },
      ],
    },
  }
}

/**
 * Sube una imagen de `public/` a la coleccion Media (idempotente por nombre
 * de archivo) y devuelve su id, para usarlo como `imagenFondo` de un hero.
 * Los archivos resultantes en `/media/` se versionan (ver .gitignore) para
 * que la semilla renderice con imagen en un clon nuevo.
 */
async function upsertMedia(payload: Payload, archivo: string, alt: string): Promise<string> {
  const rutaFisica = join(process.cwd(), 'public', archivo)
  const existentes = await payload.find({
    collection: 'media',
    where: { filename: { equals: archivo } },
    limit: 1,
    depth: 0,
  })
  const rowFileOk =
    existentes.docs[0] && existsSync(join(process.cwd(), 'media', archivo))
  if (rowFileOk) {
    console.log(`  media ${archivo}: ya existe`)
    return existentes.docs[0].id
  }
  if (existentes.docs[0]) {
    await payload.delete({ collection: 'media', id: existentes.docs[0].id, overrideAccess: true })
  }
  const creada = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: rutaFisica,
    overrideAccess: true,
  })
  console.log(`  media ${archivo}: subida`)
  return creada.id
}

type DatosPagina = { slug: string; titulo: string; bloques: Record<string, unknown>[] }

const PAGINAS: DatosPagina[] = [
  {
    slug: 'inicio',
    titulo: 'Inicio',
    bloques: [
      {
        blockType: 'hero',
        // imagenFondo se enchufa en main() con la imagen recien subida.
        esquema: true,
        antetitulo: 'Salinas Aquabioprocess Expert Consulting SpA.',
        titulo: 'Science behind the process. Experience behind the solution.',
        bajada:
          'Consultoría científico-técnica para transformar datos, biología y experiencia industrial en decisiones operacionales.',
        acciones: [
          { texto: 'Conversemos', enlace: '/contacto', estilo: 'primario' },
          { texto: 'Ver servicios', enlace: '/consulting', estilo: 'secundario' },
        ],
      },
      {
        blockType: 'unidades',
        titulo: 'Soluciones integrales',
        bajada:
          'Nuestra arquitectura de marca abarca todas las áreas críticas para el éxito sostenible en el tratamiento de aguas y efluentes industriales.',
        tarjetas: [
          {
            unidad: 'consulting',
            descripcion:
              'Auditorías especializadas, diagnóstico de sistemas y optimización de procesos operativos para garantizar eficiencia técnica y regulatoria.',
          },
          {
            unidad: 'academy',
            descripcion:
              'Programas de formación técnica y capacitación operativa en modalidades online, in-company y presencial, diseñados a medida.',
          },
          {
            unidad: 'technologies',
            descripcion:
              'Representación, evaluación y validación de tecnologías avanzadas e innovadoras aplicables al tratamiento de aguas y lodos.',
          },
          {
            unidad: 'insights',
            descripcion:
              'Difusión de conocimiento a través de artículos técnicos, presencia activa en LinkedIn y nuestro newsletter especializado.',
          },
          {
            unidad: 'rnd',
            descripcion:
              'Investigación aplicada, desarrollo de pilotajes y fomento de la innovación técnica continua para resolver desafíos complejos.',
          },
        ],
      },
      {
        blockType: 'proceso',
        titulo: 'Del efluente crudo al agua tratada',
        bajada:
          'Cada etapa —reactor biológico, aireación, clarificación— se controla con ciencia, datos y experiencia operacional.',
      },
      {
        blockType: 'cta',
        titulo: '¿Tienes un desafío operacional en mente?',
        texto: 'Agenda una conversación inicial sin costo con nuestro equipo técnico.',
        textoBoton: 'Escríbenos',
        enlace: '/contacto',
      },
      {
        blockType: 'propuesta',
        titulo: 'Propuesta de valor',
        bajada:
          'Integramos conocimiento técnico y datos operativos para transformar el tratamiento de efluentes industriales en un proceso predecible y eficiente.',
        pilares: [
          {
            icono: 'molecula',
            titulo: 'Ciencia + Biología',
            descripcion: 'Fundamentos microbiológicos aplicados a la ingeniería de procesos.',
          },
          { icono: 'ajustes', titulo: 'Proceso', descripcion: 'Optimización continua y estabilidad operativa.' },
          { icono: 'grafico', titulo: 'Datos', descripcion: 'Análisis métrico para toma de decisiones precisas.' },
          {
            icono: 'casco',
            titulo: 'Experiencia operacional',
            descripcion:
              'Años en campo garantizando que las soluciones teóricas funcionen en la práctica industrial.',
          },
        ],
      },
      {
        blockType: 'faq',
        titulo: 'Preguntas frecuentes',
        preguntas: [
          {
            pregunta: '¿Trabajan con empresas fuera de Chile?',
            respuesta: parrafo(
              'Sí, prestamos servicios de consultoría remota y presencial en Latinoamérica.',
            ),
          },
          {
            pregunta: '¿Cómo empieza un proyecto con aquabioprocess?',
            respuesta: parrafo(
              'Con un diagnóstico inicial para dimensionar alcance, plazos y equipo requerido.',
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'consulting',
    titulo: 'Consulting',
    bloques: [
      {
        blockType: 'hero',
        antetitulo: 'Consulting',
        titulo: 'Decidir antes de invertir',
        bajada:
          'Auditorías, diagnósticos, causa raíz y optimización de procesos biológicos. Ciencia, datos y experiencia operacional.',
        acciones: [
          { texto: 'Solicitar una consultoría', enlace: '/consulting/solicitud', estilo: 'primario' },
          { texto: 'Hablar con un asesor', enlace: '/contacto', estilo: 'secundario' },
        ],
      },
      {
        blockType: 'cta',
        titulo: '¿Tienes un desafío operacional en mente?',
        texto: 'Cuéntanos qué necesitas y coordinamos un diagnóstico inicial.',
        textoBoton: 'Solicitar consultoría',
        enlace: '/consulting/solicitud',
      },
    ],
  },
  {
    slug: 'fundador',
    titulo: 'Fundador',
    bloques: [
      {
        blockType: 'perfil',
        antetitulo: 'Fundador y consultor principal',
        nombre: 'Dr. Miguel Salinas Maldonado',
        subtitulo: 'Bioquímico, PhD y consultor principal',
        texto:
          'Más de 20 años de experiencia técnica comprobada en tratamiento de efluentes industriales, combinando el rigor científico con la excelencia en la gestión operacional.',
        acciones: [
          { texto: 'Contactar al Dr. Salinas', enlace: '/contacto', estilo: 'primario' },
          { texto: 'Descargar CV técnico', enlace: '/contacto', estilo: 'secundario' },
        ],
        estadisticas: [
          { etiqueta: 'Experiencia', valor: '20+ años' },
          { etiqueta: 'Especialidad', valor: 'Efluentes industriales' },
        ],
      },
      {
        blockType: 'propuesta',
        titulo: 'Metodología interdisciplinaria',
        bajada:
          'Un enfoque holístico que integra las áreas críticas de la planta para garantizar un desempeño óptimo y continuo.',
        pilares: [
          {
            icono: 'ajustes',
            titulo: 'Gestión operacional',
            descripcion:
              'Optimización de procesos biológicos y físico-químicos en tiempo real, con decisiones sobre evidencia y modelos predictivos.',
          },
          {
            icono: 'casco',
            titulo: 'Mantenimiento preventivo y correctivo',
            descripcion:
              'Sinergia entre el área biológica y la mecánica: detección temprana de fallas en aireación, bombeo y clarificación.',
          },
          {
            icono: 'molecula',
            titulo: 'Cumplimiento ambiental',
            descripcion:
              'Aseguramiento de normativas estrictas y monitoreo continuo de parámetros de descarga.',
          },
          {
            icono: 'grafico',
            titulo: 'Visión integrada',
            descripcion:
              'Análisis cruzado de variables de proceso, datos de laboratorio y reportes de mantenimiento.',
          },
        ],
      },
      {
        blockType: 'presencia',
        antetitulo: 'Presencia industrial',
        titulo: 'Huella geográfica',
        bajada:
          'Impacto regional en Chile y Uruguay, con experiencia transferible a operaciones complejas en toda la zona sur.',
        paises: [
          {
            pais: 'Chile',
            plantas: [
              {
                nombre: 'Planta Valdivia',
                descripcion:
                  'Optimización del sistema de lodos activados e implementación de control avanzado para efluentes de celulosa kraft.',
              },
              {
                nombre: 'Planta Nueva Aldea',
                descripcion:
                  'Diagnóstico integral del tratamiento secundario y capacitación técnica del equipo operativo.',
              },
              {
                nombre: 'Proyecto MAPA (Arauco)',
                descripcion:
                  'Asesoría durante el comisionamiento y la puesta en marcha del tratamiento de efluentes de la línea 3.',
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
                  'Auditoría de desempeño del sistema biológico y protocolos de respuesta ante variaciones de carga orgánica.',
              },
            ],
          },
        ],
      },
      {
        blockType: 'cta',
        titulo: '¿Necesitas experiencia técnica en tu planta?',
        texto: 'Coordinemos una conversación inicial para dimensionar el desafío.',
        textoBoton: 'Conversemos',
        enlace: '/contacto',
      },
    ],
  },
]

async function upsertAdmin(payload: Payload) {
  const existentes = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN.email } },
    limit: 1,
    depth: 0,
  })
  if (existentes.docs[0]) {
    console.log(`  admin ${ADMIN.email}: ya existe`)
    return
  }
  await payload.create({
    collection: 'users',
    data: { ...ADMIN, rol: 'admin' },
    overrideAccess: true,
  })
  console.log(`  admin ${ADMIN.email}: creado`)
}

async function upsertPagina(payload: Payload, datos: DatosPagina) {
  const existentes = await payload.find({
    collection: 'paginas',
    where: { slug: { equals: datos.slug } },
    limit: 1,
    depth: 0,
  })
  const existente = existentes.docs[0]
  const data = {
    titulo: datos.titulo,
    slug: datos.slug,
    bloques: datos.bloques as unknown as BloquesPagina,
    _status: 'published' as const,
  }

  if (existente) {
    if (!force) {
      console.log(`  pagina ${datos.slug}: ya existe (usa --force para reescribir)`)
      return
    }
    await payload.update({ collection: 'paginas', id: existente.id, data, overrideAccess: true })
    console.log(`  pagina ${datos.slug}: actualizada`)
  } else {
    await payload.create({ collection: 'paginas', data, overrideAccess: true })
    console.log(`  pagina ${datos.slug}: creada`)
  }
}

async function main() {
  const payload = await getPayload({ config })

  console.log('Media...')
  const logoMarca = await upsertMedia(
    payload,
    'logo.png',
    'Logotipo de Salinas Aquabioprocess Expert Consulting: una gota de agua con una hoja verde junto al nombre de la empresa.',
  )
  const fotoFundador = await upsertMedia(
    payload,
    'fundador.jpg',
    'Consultor con casco y chaleco reflectante frente a los estanques de una planta de tratamiento de aguas industriales.',
  )
  const heroInicio = await upsertMedia(
    payload,
    'hero-planta.jpg',
    'Planta de tratamiento de aguas industriales con estanques de acero, tableros de control y laboratorio de analisis.',
  )

  console.log('Configuracion del sitio...')
  await payload.updateGlobal({
    slug: 'configuracion-sitio',
    data: {
      nombreComercial: 'aquabioprocess.cl',
      razonSocial: 'SALINAS AQUABIOPROCESS EXPERT CONSULTING SpA',
      email: 'contacto@aquabioprocess.cl',
      logo: logoMarca,
    },
    overrideAccess: true,
  })

  console.log('Admin...')
  await upsertAdmin(payload)

  console.log('Paginas...')
  for (const datos of PAGINAS) {
    if (datos.slug === 'inicio') {
      // El bloque hero es el primero; le enchufamos la imagen de fondo recien subida.
      Object.assign(datos.bloques[0], { imagenFondo: heroInicio })
    }
    if (datos.slug === 'fundador') {
      // El bloque perfil es el primero; le enchufamos la foto recien subida.
      Object.assign(datos.bloques[0], { foto: fotoFundador })
    }
    await upsertPagina(payload, datos)
  }

  console.log('Listo.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
