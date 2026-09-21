import type { PayloadRequest } from 'payload'

import { ETIQUETA_MODALIDAD } from '../../../components/academy/etiquetas'
import type { Convocatoria, Inscripcione } from '../../../payload-types'
import { destinatariosDelEquipo, formatearFecha, rutaAbsoluta } from './comunes'
import { type Destinatario, definirReceta } from '../tipos'

type Contexto = { inscripcion: Inscripcione; convocatoria: Convocatoria }

async function cargarContexto(inscripcionId: string, req: PayloadRequest): Promise<Contexto | null> {
  const inscripcion = await req.payload
    // 2 para llegar al curso (inscripcion -> convocatoria -> curso).
    .findByID({ collection: 'inscripciones', id: inscripcionId, depth: 2, req })
    .catch(() => null)
  if (!inscripcion || typeof inscripcion.convocatoria === 'string') return null
  return { inscripcion, convocatoria: inscripcion.convocatoria }
}

const nombreCurso = (convocatoria: Convocatoria) =>
  typeof convocatoria.curso === 'object' ? convocatoria.curso.titulo : convocatoria.titulo

/** Al equipo: alguien se inscribió a un curso. */
export const inscripcionCreada = definirReceta({
  id: 'inscripcion-creada',
  evento: 'inscripcion.creada',
  categoria: 'equipo',
  // Varias inscripciones seguidas (una empresa anotando a su equipo) = un solo correo.
  agrupar: { clave: 'academia-equipo', ventanaMinutos: 60 },
  cargar: ({ inscripcionId }, req) => cargarContexto(inscripcionId, req),
  vigente: ({ inscripcion }) => inscripcion.estadoInscripcion !== 'cancelada',
  clave: ({ inscripcion }) => inscripcion.id,
  destinatarios: (_ctx, req) => destinatariosDelEquipo(req),
  contenido: ({ inscripcion, convocatoria }) => {
    const ruta = `/admin/collections/inscripciones/${inscripcion.id}`
    const curso = nombreCurso(convocatoria)
    const pagado = inscripcion.pago.estadoPago === 'pagado'

    return {
      inApp: {
        titulo: 'Nueva inscripción a un curso',
        cuerpo: `${inscripcion.participanteNombre} · ${curso} · ${formatearFecha(convocatoria.fechaInicio)}`,
        url: ruta,
      },
      email: {
        asunto: `Nueva inscripción: ${inscripcion.participanteNombre} · ${curso}`,
        titulo: 'Entró una inscripción nueva',
        parrafos: [
          `${curso} · ${formatearFecha(convocatoria.fechaInicio)} · ${ETIQUETA_MODALIDAD[convocatoria.modalidad]}`,
          `Participante: ${inscripcion.participanteNombre} (${inscripcion.participanteEmail})`,
          pagado ? 'El pago figura al día.' : 'Queda pendiente confirmar el pago.',
          inscripcion.requiereFactura ? 'Pidió factura.' : '',
        ].filter(Boolean),
        accion: { texto: 'Ver la inscripción', url: rutaAbsoluta(ruta) },
      },
    }
  },
})

/** Al alumno: el equipo confirmó su cupo. */
export const inscripcionConfirmada = definirReceta({
  id: 'inscripcion-confirmada',
  evento: 'inscripcion.confirmada',
  categoria: 'academia',
  cargar: ({ inscripcionId }, req) => cargarContexto(inscripcionId, req),
  vigente: ({ inscripcion }) => inscripcion.estadoInscripcion === 'confirmada',
  clave: ({ inscripcion }) => inscripcion.id,
  destinatarios: async ({ inscripcion }, req): Promise<Destinatario[]> => {
    const id = typeof inscripcion.cuenta === 'string' ? inscripcion.cuenta : inscripcion.cuenta.id
    const cuenta = await req.payload.findByID({ collection: 'cuentas', id, depth: 0, req }).catch(() => null)
    if (!cuenta) return []
    return [{ coleccion: 'cuentas', id: cuenta.id, nombre: cuenta.nombre, email: cuenta.email }]
  },
  contenido: ({ inscripcion, convocatoria }) => {
    const ruta = `/cuenta/cursos/${inscripcion.id}`
    const curso = nombreCurso(convocatoria)
    const lugar =
      convocatoria.modalidad === 'online_vivo' || convocatoria.modalidad === 'elearning'
        ? (convocatoria.lugar?.plataforma ?? 'Online')
        : [convocatoria.lugar?.sede, convocatoria.lugar?.ciudad].filter(Boolean).join(', ')

    return {
      inApp: {
        titulo: 'Confirmamos tu inscripción',
        cuerpo: `${curso} · empieza el ${formatearFecha(convocatoria.fechaInicio)}`,
        url: ruta,
      },
      email: {
        asunto: `Tu cupo está confirmado: ${curso}`,
        titulo: 'Confirmamos tu inscripción',
        parrafos: [
          `${curso} empieza el ${formatearFecha(convocatoria.fechaInicio)}.`,
          lugar ? `Dónde: ${lugar}` : '',
          'En tu aula vas a encontrar el enlace de la clase, el material y las grabaciones.',
        ].filter(Boolean),
        accion: { texto: 'Entrar al curso', url: rutaAbsoluta(ruta) },
      },
    }
  },
})
