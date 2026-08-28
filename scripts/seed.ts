import { existsSync } from 'fs'
import { join } from 'path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { Articulo, Pagina } from '@/payload-types'

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
        blockType: 'bioindicadores',
        titulo: 'Lo que dice el microscopio',
        bajada:
          'En un diagnóstico biológico, la microscopía del lodo activado adelanta lo que los análisis fisicoquímicos confirman días después. Cada organismo es una señal sobre la edad del lodo, la aireación y la carga.',
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

/**
 * Bioindicadores del lodo activado (colección `bioindicadores`). Imágenes
 * optimizadas por scripts/optimizar-bioindicadores.ts. Los textos de `queIndica`
 * son interpretación estándar de microscopía y quedan sujetos a revisión del
 * equipo técnico.
 */
const BIOINDICADORES: {
  slug: string
  archivo: string
  alt: string
  nombre: string
  nombreCientifico?: string
  grupo: 'floculo' | 'ciliado' | 'ameba' | 'metazoo' | 'filamentosa'
  condicion: 'buena' | 'alerta' | 'problema'
  queIndica: string
  orden: number
}[] = [
  {
    slug: 'floculo-sano',
    archivo: 'bioindicador-floculo-sano.jpg',
    alt: 'Microscopía de lodo activado: flóculo compacto con ciliados pedunculados fijos en su borde.',
    nombre: 'Flóculo con ciliados fijos',
    grupo: 'floculo',
    condicion: 'buena',
    queIndica:
      'Flóculo firme y bien colonizado, con biomasa activa. Buena sedimentabilidad y efluente clarificado: es la estructura de referencia de un lodo sano.',
    orden: 1,
  },
  {
    slug: 'ciliados-pedunculados',
    archivo: 'bioindicador-ciliados-pedunculados.jpg',
    alt: 'Colonia de ciliados pedunculados Opercularia adherida a un flóculo de lodo activado.',
    nombre: 'Ciliados pedunculados',
    nombreCientifico: 'Opercularia sp.',
    grupo: 'ciliado',
    condicion: 'buena',
    queIndica:
      'Fijos al flóculo, depredan bacterias dispersas. Indican lodo maduro y bien oxigenado, con carga orgánica moderada y efluente de baja turbidez.',
    orden: 2,
  },
  {
    slug: 'rotifero',
    archivo: 'bioindicador-rotifero.jpg',
    alt: 'Rotífero del género Rotaria observado al microscopio en una muestra de lodo activado.',
    nombre: 'Rotíferos',
    nombreCientifico: 'Rotaria sp.',
    grupo: 'metazoo',
    condicion: 'alerta',
    queIndica:
      'Aparecen con lodos de edad alta (SRT largo) y relación alimento/microorganismos muy baja. Buena nitrificación y efluente de alta calidad; en exceso, señal de sobre-oxidación y pérdida de flóculo.',
    orden: 3,
  },
  {
    slug: 'ameba-testacea',
    archivo: 'bioindicador-ameba-testacea.jpg',
    alt: 'Ameba testácea Arcella junto a un ciliado reptante y flóculos de lodo activado.',
    nombre: 'Amebas testáceas',
    nombreCientifico: 'Arcella sp.',
    grupo: 'ameba',
    condicion: 'buena',
    queIndica:
      'Toleran bien condiciones estables y de baja carga. Su presencia acompaña a lodos con buena nitrificación y edad media-alta.',
    orden: 4,
  },
  {
    slug: 'gastrotrico',
    archivo: 'bioindicador-gastrotrico.jpg',
    alt: 'Gastrotrico del género Chaetonotus en una muestra de lodo activado.',
    nombre: 'Gastrotricos',
    nombreCientifico: 'Chaetonotus sp.',
    grupo: 'metazoo',
    condicion: 'buena',
    queIndica:
      'Metazoos asociados a lodos limpios, poco cargados y bien estabilizados, con efluente de buena calidad.',
    orden: 5,
  },
  {
    slug: 'bacterias-filamentosas',
    archivo: 'bioindicador-bacterias-filamentosas.jpg',
    alt: 'Bacterias filamentosas extendiéndose desde un flóculo de lodo activado.',
    nombre: 'Bacterias filamentosas',
    grupo: 'filamentosa',
    condicion: 'problema',
    queIndica:
      'En exceso puentean los flóculos e impiden que compacten: bulking filamentoso, SVI alto y arrastre de sólidos al efluente. Causas típicas: oxígeno disuelto bajo, déficit de nutrientes, pH bajo o septicidad.',
    orden: 6,
  },
  {
    slug: 'crecimiento-disperso',
    archivo: 'bioindicador-crecimiento-disperso.jpg',
    alt: 'Lodo activado con crecimiento bacteriano disperso y filamentos libres, sin flóculos definidos.',
    nombre: 'Crecimiento disperso',
    grupo: 'floculo',
    condicion: 'problema',
    queIndica:
      'Bacterias que no se agregan en flóculo: efluente turbio y mala sedimentación. Suele indicar lodo muy joven (SRT corto), choque tóxico o sobrecarga orgánica.',
    orden: 7,
  },
]

async function upsertBioindicador(
  payload: Payload,
  datos: (typeof BIOINDICADORES)[number],
): Promise<string> {
  const imagen = await upsertMedia(payload, datos.archivo, datos.alt)
  const existentes = await payload.find({
    collection: 'bioindicadores',
    where: { slug: { equals: datos.slug } },
    limit: 1,
    depth: 0,
  })
  const data = {
    nombre: datos.nombre,
    nombreCientifico: datos.nombreCientifico,
    slug: datos.slug,
    imagen,
    grupo: datos.grupo,
    condicion: datos.condicion,
    queIndica: datos.queIndica,
    orden: datos.orden,
    _status: 'published' as const,
  }
  const existente = existentes.docs[0]
  if (existente) {
    if (force) {
      await payload.update({ collection: 'bioindicadores', id: existente.id, data, overrideAccess: true })
      console.log(`  bioindicador ${datos.slug}: actualizado`)
    } else {
      console.log(`  bioindicador ${datos.slug}: ya existe`)
    }
  } else {
    await payload.create({ collection: 'bioindicadores', data, overrideAccess: true })
    console.log(`  bioindicador ${datos.slug}: creado`)
  }
  return imagen
}

/** Nodo de texto lexical. */
function lexTexto(texto: string) {
  return { type: 'text', version: 1, text: texto, format: 0, style: '', mode: 'normal', detail: 0 }
}

/** Nodos lexical de nivel raiz para el `contenido` de un articulo. */
function lexParrafo(texto: string) {
  return { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [lexTexto(texto)] }
}

function lexEncabezado(texto: string, tag: 'h2' | 'h3' = 'h2') {
  return { type: 'heading', tag, version: 1, direction: 'ltr', format: '', indent: 0, children: [lexTexto(texto)] }
}

function lexImagen(mediaId: string) {
  return { type: 'upload', version: 3, relationTo: 'media', value: mediaId, fields: null, format: '' }
}

function lexDocumento(nodos: Record<string, unknown>[]) {
  return {
    root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: nodos },
  }
}

async function upsertArticulo(payload: Payload, imagenesBio: Record<string, string>) {
  const SLUG = 'bioindicadores-lodo-activado'
  const contenido = lexDocumento([
    lexParrafo(
      'En un diagnostico biologico, la microscopia del lodo activado es la primera lectura del estado del proceso. Mientras los analisis fisicoquimicos tardan dias, una muestra al microscopio muestra en minutos si el flóculo esta sano, si la aireacion alcanza y si la edad del lodo es la adecuada. Los organismos que aparecen —y los que faltan— son un indicador anticipado.',
    ),
    lexEncabezado('El flóculo, primero'),
    lexImagen(imagenesBio['floculo-sano']),
    lexParrafo(
      'Antes de mirar quien vive en el lodo, se mira como esta armado. Un flóculo compacto, firme y bien definido, con bacterias formadoras dominando, sedimenta bien y deja un efluente clarificado. Es la estructura de referencia contra la que se compara todo lo demas.',
    ),
    lexEncabezado('Los que traen buenas noticias'),
    lexParrafo(
      'Los ciliados pedunculados —Opercularia, Vorticella y parientes— se fijan al flóculo y filtran bacterias dispersas del liquido. Su presencia indica un lodo maduro, bien oxigenado, con carga organica moderada y un efluente de baja turbidez.',
    ),
    lexImagen(imagenesBio['ciliados-pedunculados']),
    lexParrafo(
      'Mas arriba en la escala de estabilizacion aparecen los metazoos. Los rotiferos son propios de lodos de edad alta y relacion alimento/microorganismos muy baja: buena nitrificacion y efluente de alta calidad. En exceso, sin embargo, son senal de sobre-oxidacion y de un lodo que empieza a perder estructura.',
    ),
    lexImagen(imagenesBio['rotifero']),
    lexParrafo(
      'Las amebas testaceas como Arcella y los gastrotricos completan el cuadro de un lodo estable y poco cargado, con buena nitrificacion y edad media-alta.',
    ),
    lexImagen(imagenesBio['gastrotrico']),
    lexEncabezado('Las senales de alarma'),
    lexParrafo(
      'El exceso de bacterias filamentosas es el problema mas frecuente. Los filamentos se extienden desde el flóculo y lo puentean, impidiendo que compacte: el indice volumetrico de lodos (SVI) sube, el manto crece y los solidos se van con el efluente. La causa esta detras del filamento dominante —oxigeno disuelto bajo, deficit de nutrientes, pH bajo, septicidad, sustrato muy biodegradable— y por eso identificarlo orienta la correccion.',
    ),
    lexImagen(imagenesBio['bacterias-filamentosas']),
    lexParrafo(
      'En el otro extremo esta el crecimiento disperso: bacterias que no llegan a agregarse en flóculo. El efluente sale turbio y la sedimentacion es mala. Suele indicar un lodo muy joven, un choque toxico o una sobrecarga organica reciente.',
    ),
    lexImagen(imagenesBio['crecimiento-disperso']),
    lexEncabezado('Del microscopio a la decision'),
    lexParrafo(
      'Ninguna de estas observaciones se lee sola: se cruzan con el SVI, el oxigeno disuelto, la edad del lodo y la carga. Pero permiten anticipar. Cuando la poblacion de ciliados cae o los filamentos empiezan a dominar, hay dias de margen para ajustar aireacion, purga o dosificacion antes de que el problema llegue al punto de descarga. Esa ventaja de tiempo es el valor de mirar.',
    ),
  ])

  const data = {
    titulo: 'Bioindicadores del lodo activado: lo que el microscopio adelanta',
    bajada:
      'Antes de que lleguen los resultados de laboratorio, la microscopia del lodo ya muestra si el proceso esta sano. Una guia visual de los organismos que importan.',
    contenido: contenido as unknown as NonNullable<Articulo['contenido']>,
    tipo: 'analisis' as const,
    fechaPublicacion: new Date('2026-08-01T12:00:00Z').toISOString(),
    unidades: ['insights'] as NonNullable<Articulo['unidades']>,
    slug: SLUG,
    imagenDestacada: imagenesBio['ciliados-pedunculados'],
    tiempoLecturaMinutos: 4,
    _status: 'published' as const,
  }

  const existentes = await payload.find({
    collection: 'articulos',
    where: { slug: { equals: SLUG } },
    limit: 1,
    depth: 0,
  })
  const existente = existentes.docs[0]
  if (existente) {
    if (force) {
      await payload.update({ collection: 'articulos', id: existente.id, data, overrideAccess: true })
      console.log(`  articulo ${SLUG}: actualizado`)
    } else {
      console.log(`  articulo ${SLUG}: ya existe`)
    }
  } else {
    await payload.create({ collection: 'articulos', data, overrideAccess: true })
    console.log(`  articulo ${SLUG}: creado`)
  }
}

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

  console.log('Bioindicadores...')
  const imagenesBio: Record<string, string> = {}
  for (const datos of BIOINDICADORES) {
    imagenesBio[datos.slug] = await upsertBioindicador(payload, datos)
  }

  console.log('Insights...')
  await upsertArticulo(payload, imagenesBio)

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
