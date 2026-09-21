import config from '@payload-config'
import { getPayload } from 'payload'

import type { Inscripcione } from '@/payload-types'

/**
 * Datos de PRUEBA para ver "Mis cursos" y "Mis compras" con contenido: una
 * relatora, 2 cursos, 4 convocatorias (pasada, en curso y dos proximas, con
 * sesiones) y 5 inscripciones con distintos estados de pago, todo asociado a
 * la cuenta que se pase por argumento.
 *
 *   npm run db:datos-prueba -- tu@correo.cl            # crea (idempotente)
 *   npm run db:datos-prueba -- tu@correo.cl --limpiar  # borra lo creado
 *
 * Solo toca la BD viva y NO va a la semilla: los cursos son inventados y no
 * deben terminar en `aquabioprocess.seed.db`. Todo lo creado lleva slug o
 * codigo con prefijo `prueba-` para poder encontrarlo y borrarlo.
 *
 * La cuenta tiene que existir (registrarse antes en /cuenta/registro).
 */

const email = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
const limpiar = process.argv.includes('--limpiar')

if (!email) {
  console.error('Uso: npm run db:datos-prueba -- <email de la cuenta> [--limpiar]')
  process.exit(1)
}

const payload = await getPayload({ config })

const { docs: cuentas } = await payload.find({ collection: 'cuentas', where: { email: { equals: email.toLowerCase() } } })
const cuenta = cuentas[0]
if (!cuenta) {
  console.error(`No existe una cuenta con el email ${email}. Registrala primero en /cuenta/registro.`)
  process.exit(1)
}

// Los hooks anti-abuso de Inscripciones fuerzan pago "pendiente" y rate limit
// salvo que cree alguien del panel: se crea "como" el primer admin.
const { docs: admins } = await payload.find({ collection: 'users', limit: 1 })
if (!admins[0]) {
  console.error('No hay usuarios del panel. Corre `npm run db:seed:contenido` primero.')
  process.exit(1)
}
const comoAdmin = { ...admins[0], collection: 'users' as const }

const dias = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

/** `cantidad` sesiones semanales de `horas` c/u desde `inicio` (en dias), a las 10:00 de Chile. */
function sesionesSemanales(inicio: number, cantidad: number, horas: number, temas: string[]) {
  return Array.from({ length: cantidad }, (_, i) => {
    const fecha = new Date(Date.now() + (inicio + i * 7) * 86_400_000)
    fecha.setUTCHours(13, 0, 0, 0) // 10:00 America/Santiago (UTC-3)
    return { fecha: fecha.toISOString(), duracionHoras: horas, tema: temas[i] }
  })
}

const RELATORA = {
  slug: 'prueba-relatora-paula-rivas',
  nombre: 'Dra. Paula Rivas',
  cargo: 'Microbióloga ambiental',
}

const CURSOS = [
  {
    slug: 'prueba-bioindicadores-lodos-activados',
    codigo: 'prueba-ACAD-001',
    titulo: 'Bioindicadores en lodos activados',
    resumen: 'Lectura microscópica del lodo para anticipar problemas de sedimentación y espumas.',
    duracionHoras: 16,
    asistenciaMinima: 75,
    certificacion: 'Certificado de aprobación AquaBioProcess Academy con 16 horas cronológicas.',
  },
  {
    slug: 'prueba-corrosion-plantas-tratamiento',
    codigo: 'prueba-ACAD-002',
    titulo: 'Corrosión en plantas de tratamiento',
    resumen: 'Diagnóstico y control de corrosión en estructuras y equipos de plantas de aguas.',
    duracionHoras: 12,
    asistenciaMinima: 75,
    certificacion: 'Certificado de participación con 12 horas cronológicas.',
  },
]

const TEMAS_BIO = ['Microfauna y floc', 'Filamentosas', 'Diagnóstico de espumas', 'Casos reales']
const TEMAS_CORROSION = ['Mecanismos de corrosión', 'Inspección en terreno', 'Recubrimientos y control']

const CONVOCATORIAS = [
  { slug: 'prueba-bioindicadores-2026-03', curso: 0, titulo: 'Bioindicadores · marzo 2026', sesiones: sesionesSemanales(-180, 4, 4, TEMAS_BIO), estado: 'finalizada', monto: 180000, moneda: 'CLP', modalidad: 'presencial', lugar: { sede: 'Centro de Extensión UC', direccion: 'Av. Libertador Bernardo O’Higgins 390', ciudad: 'Santiago' } },
  { slug: 'prueba-corrosion-2026-09', curso: 1, titulo: 'Corrosión · septiembre 2026', sesiones: sesionesSemanales(-8, 3, 4, TEMAS_CORROSION), estado: 'en_curso', monto: 95000, moneda: 'CLP', modalidad: 'online_vivo', lugar: { plataforma: 'Zoom' } },
  { slug: 'prueba-corrosion-2026-10', curso: 1, titulo: 'Corrosión · octubre 2026', sesiones: sesionesSemanales(30, 3, 4, TEMAS_CORROSION), estado: 'inscripciones_abiertas', monto: 95000, moneda: 'CLP', modalidad: 'online_vivo', lugar: { plataforma: 'Zoom' } },
  { slug: 'prueba-bioindicadores-2026-11', curso: 0, titulo: 'Bioindicadores · noviembre 2026', sesiones: sesionesSemanales(60, 4, 4, TEMAS_BIO), estado: 'inscripciones_abiertas', monto: 6.5, moneda: 'UF', modalidad: 'incompany', lugar: { sede: 'Planta Biobío', ciudad: 'Concepción' } },
] as const

async function borrarTodo() {
  const slugsConvocatorias = CONVOCATORIAS.map((c) => c.slug)
  const { docs: convocatorias } = await payload.find({
    collection: 'convocatorias',
    where: { slug: { in: slugsConvocatorias } },
    draft: true,
    limit: 100,
  })
  const ids = convocatorias.map((c) => c.id)
  const { docs: cursosPrueba } = await payload.find({
    collection: 'cursos',
    where: { slug: { in: CURSOS.map((c) => c.slug) } },
    draft: true,
    limit: 100,
  })
  const { docs: recursos } = await payload.delete({
    collection: 'recursos',
    where: { or: [{ convocatoria: { in: ids } }, { curso: { in: cursosPrueba.map((c) => c.id) } }] },
  })
  console.log(`  recursos borrados: ${recursos.length}`)
  if (ids.length) {
    // Justificaciones y listas apuntan a inscripciones: se borran antes.
    const { docs: justificaciones } = await payload.delete({ collection: 'justificaciones', where: { convocatoria: { in: ids } } })
    console.log(`  justificaciones borradas: ${justificaciones.length}`)
    const { docs: listas } = await payload.delete({ collection: 'listas-asistencia', where: { convocatoria: { in: ids } } })
    console.log(`  listas de asistencia borradas: ${listas.length}`)
    const { docs } = await payload.delete({ collection: 'inscripciones', where: { convocatoria: { in: ids } } })
    console.log(`  inscripciones borradas: ${docs.length}`)
    await payload.delete({ collection: 'convocatorias', where: { id: { in: ids } } })
    console.log(`  convocatorias borradas: ${ids.length}`)
  }
  const { docs: cursos } = await payload.delete({
    collection: 'cursos',
    where: { slug: { in: CURSOS.map((c) => c.slug) } },
  })
  console.log(`  cursos borrados: ${cursos.length}`)
  await payload.delete({ collection: 'personas', where: { slug: { equals: RELATORA.slug } } })
}

if (limpiar) {
  console.log('Borrando datos de prueba...')
  await borrarTodo()
  console.log('Listo.')
  process.exit(0)
}

console.log(`Datos de prueba para ${cuenta.email}...`)

const { docs: relatoras } = await payload.find({ collection: 'personas', where: { slug: { equals: RELATORA.slug } } })
const relatora =
  relatoras[0] ??
  // visibleEnSitio: false para que no aparezca en paginas publicas del equipo.
  (await payload.create({ collection: 'personas', data: { ...RELATORA, roles: ['relator'], visibleEnSitio: false } }))

const idsCursos: string[] = []
for (const curso of CURSOS) {
  const { docs } = await payload.find({ collection: 'cursos', where: { slug: { equals: curso.slug } }, draft: true })
  const existente = docs[0]
  const doc =
    existente ??
    (await payload.create({
      collection: 'cursos',
      data: { ...curso, estadoProducto: 'activo', modalidadesDisponibles: ['presencial', 'online_vivo'], _status: 'published' },
    }))
  console.log(`  curso ${curso.slug}: ${existente ? 'ya existe' : 'creado'}`)
  idsCursos.push(doc.id)
}

const idsConvocatorias: string[] = []
for (const c of CONVOCATORIAS) {
  const { docs } = await payload.find({ collection: 'convocatorias', where: { slug: { equals: c.slug } }, draft: true })
  const existente = docs[0]
  const doc =
    existente ??
    (await payload.create({
      collection: 'convocatorias',
      data: {
        curso: idsCursos[c.curso],
        titulo: c.titulo,
        slug: c.slug,
        fechaInicio: c.sesiones[0].fecha,
        fechaTermino: c.sesiones[c.sesiones.length - 1].fecha,
        sesiones: [...c.sesiones],
        modalidad: c.modalidad,
        lugar: { ...c.lugar },
        relatores: [relatora.id],
        valor: { monto: c.monto, moneda: c.moneda, cupoMaximo: 20 },
        estadoConvocatoria: c.estado,
        _status: 'published',
      },
    }))
  console.log(`  convocatoria ${c.slug}: ${existente ? 'ya existe' : 'creada'}`)
  idsConvocatorias.push(doc.id)
}

type DatosInscripcion = Pick<Inscripcione, 'estadoInscripcion' | 'pago' | 'requiereFactura' | 'facturacion'> & {
  convocatoria: number
  participanteNombre?: string
  creadaHaceDias: number
}

const INSCRIPCIONES: DatosInscripcion[] = [
  {
    // Curso pasado, pagado con factura.
    convocatoria: 0,
    creadaHaceDias: 200,
    estadoInscripcion: 'asistio',
    pago: { estadoPago: 'pagado', medioPago: 'transferencia', montoPagado: 180000, moneda: 'CLP', fechaPago: dias(-195), referenciaExterna: 'TRX-PRUEBA-0001' },
    requiereFactura: true,
    facturacion: { razonSocial: 'Aguas del Sur SpA', rut: '76.123.456-0', giro: 'Tratamiento de aguas' },
  },
  {
    // Curso en marcha, pagado con Webpay.
    convocatoria: 1,
    creadaHaceDias: 20,
    estadoInscripcion: 'confirmada',
    pago: { estadoPago: 'pagado', medioPago: 'webpay', montoPagado: 95000, moneda: 'CLP', fechaPago: dias(-19), referenciaExterna: 'WP-PRUEBA-8841' },
  },
  {
    // Proximo curso, confirmado y pagado.
    convocatoria: 2,
    creadaHaceDias: 10,
    estadoInscripcion: 'confirmada',
    pago: { estadoPago: 'pagado', medioPago: 'webpay', montoPagado: 95000, moneda: 'CLP', fechaPago: dias(-9), referenciaExterna: 'WP-PRUEBA-9012' },
  },
  {
    // Inscripcion reciente, falta pagar.
    convocatoria: 3,
    creadaHaceDias: 2,
    estadoInscripcion: 'pendiente',
    pago: { estadoPago: 'pendiente', moneda: 'UF' },
  },
  {
    // Jefatura inscribe a alguien de su equipo, pago parcial.
    convocatoria: 2,
    creadaHaceDias: 5,
    participanteNombre: 'Carla Muñoz',
    estadoInscripcion: 'pendiente',
    pago: { estadoPago: 'parcial', medioPago: 'orden_compra', montoPagado: 50000, moneda: 'CLP', fechaPago: dias(-4) },
    requiereFactura: true,
    facturacion: { razonSocial: 'Aguas del Sur SpA', rut: '76.123.456-0', ordenCompra: 'OC-2026-114' },
  },
]

const { docs: previas } = await payload.find({
  collection: 'inscripciones',
  where: { and: [{ cuenta: { equals: cuenta.id } }, { convocatoria: { in: idsConvocatorias } }] },
  limit: 100,
})

if (previas.length) {
  console.log(`  inscripciones: ya hay ${previas.length} de prueba (usa --limpiar para empezar de cero)`)
} else {
  for (const { convocatoria, creadaHaceDias, participanteNombre, ...resto } of INSCRIPCIONES) {
    await payload.create({
      collection: 'inscripciones',
      user: comoAdmin,
      // Datos de prueba: no deben disparar avisos al equipo.
      context: { sinNotificaciones: true },
      data: {
        ...resto,
        cuenta: cuenta.id,
        convocatoria: idsConvocatorias[convocatoria],
        participanteNombre: participanteNombre ?? cuenta.nombre,
        participanteEmail: cuenta.email,
        origen: 'web',
        createdAt: dias(-creadaHaceDias),
      },
    })
  }
  console.log(`  inscripciones: ${INSCRIPCIONES.length} creadas`)
}

// --- Aula: recursos y asistencia -------------------------------------------

/** PDF minimo valido de una pagina, para probar descargas sin versionar archivos. */
function pdfDePrueba(texto: string) {
  const contenido = `BT /F1 18 Tf 72 720 Td (${texto.replace(/[()\\]/g, '')}) Tj ET`
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objetos.forEach((objeto, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`
  })
  const inicioXref = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`
  return Buffer.from(pdf)
}

async function crearRecurso(data: Record<string, unknown>, archivo?: { nombre: string; texto: string }) {
  await payload.create({
    collection: 'recursos',
    data: data as never,
    ...(archivo
      ? {
          file: {
            data: pdfDePrueba(archivo.texto),
            mimetype: 'application/pdf',
            name: archivo.nombre,
            size: pdfDePrueba(archivo.texto).length,
          },
        }
      : {}),
  })
}

const { totalDocs: recursosPrevios } = await payload.count({
  collection: 'recursos',
  where: { or: [{ convocatoria: { in: idsConvocatorias } }, { curso: { in: idsCursos } }] },
})

// Videos publicos de ejemplo (demos oficiales de YouTube y Vimeo): solo para ver el reproductor.
const VIDEO_YOUTUBE = 'https://www.youtube.com/watch?v=M7lc1UVf-VE'
const VIDEO_VIMEO = 'https://vimeo.com/76979871'

if (recursosPrevios) {
  console.log(`  recursos: ya hay ${recursosPrevios}`)
} else {
  const [bio, corrosion] = idsCursos
  const [convPasada, convEnCurso, convOctubre, convNoviembre] = idsConvocatorias

  // Material base de cada curso (aparece en todas sus convocatorias).
  await crearRecurso({ titulo: 'Guía del participante', tipo: 'material', alcance: 'curso', curso: corrosion, descripcion: 'Programa, evaluación y bibliografía.' }, { nombre: 'prueba-guia-corrosion.pdf', texto: 'Guia del participante - Corrosion' })
  await crearRecurso({ titulo: 'NCh 2369: diseño sísmico de estructuras industriales', tipo: 'lectura', alcance: 'curso', curso: corrosion, enlace: 'https://www.inn.cl/' })
  await crearRecurso({ titulo: 'Atlas de microfauna del lodo activado', tipo: 'material', alcance: 'curso', curso: bio }, { nombre: 'prueba-atlas-microfauna.pdf', texto: 'Atlas de microfauna' })

  // Convocatoria en curso: enlace de clase, grabaciones y material por sesion.
  await crearRecurso({ titulo: 'Sala de Zoom del curso', tipo: 'enlace_clase', alcance: 'convocatoria', convocatoria: convEnCurso, enlace: 'https://zoom.us/j/1234567890?pwd=prueba' })
  await crearRecurso({ titulo: 'Grabación sesión 1', tipo: 'grabacion', alcance: 'convocatoria', convocatoria: convEnCurso, sesion: 1, enlace: VIDEO_YOUTUBE })
  await crearRecurso({ titulo: 'Presentación sesión 1', tipo: 'material', alcance: 'convocatoria', convocatoria: convEnCurso, sesion: 1 }, { nombre: 'prueba-corrosion-s1.pdf', texto: 'Mecanismos de corrosion' })
  await crearRecurso({ titulo: 'Grabación sesión 2', tipo: 'grabacion', alcance: 'convocatoria', convocatoria: convEnCurso, sesion: 2, enlace: VIDEO_VIMEO })
  await crearRecurso({ titulo: 'Checklist de inspección en terreno', tipo: 'material', alcance: 'convocatoria', convocatoria: convEnCurso, sesion: 2 }, { nombre: 'prueba-checklist-inspeccion.pdf', texto: 'Checklist de inspeccion' })
  // Material de la sesion 3 que se publica recien despues de la clase: no debe verse todavia.
  await crearRecurso({ titulo: 'Presentación sesión 3', tipo: 'material', alcance: 'convocatoria', convocatoria: convEnCurso, sesion: 3, visibleDesde: dias(7) }, { nombre: 'prueba-corrosion-s3.pdf', texto: 'Recubrimientos' })

  // Convocatorias proximas: solo el enlace de clase.
  await crearRecurso({ titulo: 'Sala de Zoom del curso', tipo: 'enlace_clase', alcance: 'convocatoria', convocatoria: convOctubre, enlace: 'https://zoom.us/j/9876543210?pwd=prueba' })

  // Convocatoria pasada: grabacion que ya vencio (no debe verse) y una vigente.
  await crearRecurso({ titulo: 'Grabación sesión 1', tipo: 'grabacion', alcance: 'convocatoria', convocatoria: convPasada, sesion: 1, enlace: VIDEO_YOUTUBE, visibleHasta: dias(-30) })
  await crearRecurso({ titulo: 'Grabación sesión 4 · Casos reales', tipo: 'grabacion', alcance: 'convocatoria', convocatoria: convPasada, sesion: 4, enlace: VIDEO_VIMEO })
  void convNoviembre
  console.log('  recursos: 12 creados')
}

const { totalDocs: listasPrevias } = await payload.count({
  collection: 'listas-asistencia',
  where: { convocatoria: { in: idsConvocatorias } },
})

if (listasPrevias) {
  console.log(`  listas de asistencia: ya hay ${listasPrevias}`)
} else {
  const { docs: propias } = await payload.find({
    collection: 'inscripciones',
    where: { and: [{ cuenta: { equals: cuenta.id } }, { convocatoria: { in: idsConvocatorias } }] },
    depth: 0,
    limit: 100,
  })
  const inscripcionEn = (indice: number) =>
    propias.find((i) => i.convocatoria === idsConvocatorias[indice] && i.participanteNombre === cuenta.nombre)?.id

  const lista = (convocatoria: number, sesion: number, presentes: (string | undefined)[]) =>
    payload.create({
      collection: 'listas-asistencia',
      data: { convocatoria: idsConvocatorias[convocatoria], sesion, presentes: presentes.filter((p): p is string => Boolean(p)) },
    })

  // Curso pasado: fue a las 4.
  for (const sesion of [1, 2, 3, 4]) await lista(0, sesion, [inscripcionEn(0)])
  // Curso en marcha: fue a la 1, falto a la 2 (la 3 aun no ocurre).
  await lista(1, 1, [inscripcionEn(1)])
  await lista(1, 2, [])
  console.log('  listas de asistencia: 6 creadas')
}

console.log('Listo.')
process.exit(0)
