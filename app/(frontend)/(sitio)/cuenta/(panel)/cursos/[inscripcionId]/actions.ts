'use server'

import { redirect } from 'next/navigation'
import { ValidationError } from 'payload'

import { obtenerCuentaActual } from '@/lib/auth'
import {
  MOTIVOS_JUSTIFICACION,
  type MotivoJustificacion,
  TAMANO_MAXIMO_RESPALDO,
  TIPOS_RESPALDO,
} from '@/lib/justificaciones'
import { obtenerPayload } from '@/lib/payload'
import { obtenerAula } from '@/queries/cuenta/aula'

export type EstadoJustificacion = {
  errores?: Partial<Record<'motivo' | 'detalle' | 'respaldo', string>>
  mensaje?: string
  valores?: { motivo?: string; detalle?: string }
  exito?: { mensaje: string; enviadoEn: number }
}

const LARGO_MINIMO_DETALLE = 10
const LARGO_MAXIMO_DETALLE = 2000

/**
 * El alumno justifica una inasistencia. Toda la autorizacion va aca, no en la
 * coleccion (su `create` publico esta cerrado): la inscripcion tiene que ser
 * de la cuenta, la sesion tiene que figurar ausente, estar dentro del plazo y
 * no tener otra justificacion pendiente o aprobada. `obtenerAula` ya calcula
 * todo eso en `puedeJustificar`.
 */
export async function justificarInasistencia(
  _estado: EstadoJustificacion,
  formData: FormData,
): Promise<EstadoJustificacion> {
  const inscripcionId = String(formData.get('inscripcion') ?? '')
  const sesionNumero = Number(formData.get('sesion'))

  const cuenta = await obtenerCuentaActual()
  if (!cuenta) redirect(`/cuenta/ingresar?redirect=${encodeURIComponent(`/cuenta/cursos/${inscripcionId}`)}`)

  const motivo = String(formData.get('motivo') ?? '')
  const detalle = String(formData.get('detalle') ?? '').trim()
  const respaldo = formData.get('respaldo')
  const archivo = respaldo instanceof File && respaldo.size > 0 ? respaldo : null
  const valores = { motivo, detalle }

  const aula = await obtenerAula(cuenta.id, inscripcionId, Date.now())
  const sesion = aula?.sesiones.find((s) => s.numero === sesionNumero)
  if (!aula || !sesion) return { mensaje: 'No encontramos esa sesión.', valores }
  if (!sesion.puedeJustificar) {
    return {
      mensaje:
        sesion.justificacion?.estado === 'pendiente'
          ? 'Ya enviaste una justificación para esta sesión y está en revisión.'
          : 'Esta sesión ya no se puede justificar.',
      valores,
    }
  }

  const errores: EstadoJustificacion['errores'] = {}
  if (!MOTIVOS_JUSTIFICACION.some((m) => m.value === motivo)) errores.motivo = 'Elige un motivo.'
  if (detalle.length < LARGO_MINIMO_DETALLE) errores.detalle = 'Cuéntanos brevemente qué pasó.'
  else if (detalle.length > LARGO_MAXIMO_DETALLE) errores.detalle = `Máximo ${LARGO_MAXIMO_DETALLE} caracteres.`
  if (archivo && !TIPOS_RESPALDO.includes(archivo.type)) errores.respaldo = 'Sube un PDF o una imagen (JPG, PNG).'
  else if (archivo && archivo.size > TAMANO_MAXIMO_RESPALDO) errores.respaldo = 'El archivo pesa más de 5 MB.'
  if (Object.keys(errores).length) return { errores, valores }

  const payload = await obtenerPayload()
  try {
    await payload.create({
      collection: 'justificaciones',
      data: {
        cuenta: cuenta.id,
        inscripcion: aula.inscripcion.id,
        convocatoria: aula.convocatoria.id,
        sesion: sesion.numero,
        motivo: motivo as MotivoJustificacion,
        detalle,
        estado: 'pendiente',
      },
      ...(archivo
        ? {
            file: {
              data: Buffer.from(await archivo.arrayBuffer()),
              mimetype: archivo.type,
              // Nombre neutro: el original puede traer datos personales ("licencia-juan-perez.pdf").
              name: `respaldo-sesion-${sesion.numero}.${archivo.name.split('.').pop()?.toLowerCase() ?? 'pdf'}`,
              size: archivo.size,
            },
          }
        : {}),
    })
  } catch (error) {
    // Payload revisa el contenido real del archivo (un .pdf que no es PDF, una imagen corrupta).
    if (error instanceof ValidationError && error.data.errors.some((e) => e.path === 'file')) {
      return { errores: { respaldo: 'No pudimos leer el archivo. Verifica que sea un PDF o una imagen válida.' }, valores }
    }
    console.error('justificarInasistencia:', error)
    return { mensaje: 'No pudimos enviar la justificación. Inténtalo de nuevo en unos minutos.', valores }
  }

  // Sin refresh() aca: si el aula se repinta en esta misma respuesta, el formulario se desmonta
  // antes de mostrar el toast. El cliente muestra el aviso y despues refresca.
  return { exito: { mensaje: 'Enviamos tu justificación. El equipo la revisará.', enviadoEn: Date.now() } }
}
