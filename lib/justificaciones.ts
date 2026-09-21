/**
 * Reglas de las justificaciones de inasistencia, compartidas entre la
 * coleccion (collections/academy/Justificaciones.ts), la Server Action del
 * aula y el formulario del cliente. Sin imports de servidor: el formulario
 * las usa para validar antes de enviar.
 */

/** Formatos de respaldo aceptados. */
export const TIPOS_RESPALDO = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
export const TAMANO_MAXIMO_RESPALDO = 5 * 1024 * 1024

/** Dias corridos despues de la sesion en que el alumno todavia puede justificar. */
export const PLAZO_JUSTIFICACION_DIAS = 7

export const MOTIVOS_JUSTIFICACION = [
  { value: 'si_asisti', label: 'Sí asistí (error en el registro)', ayuda: 'Estuviste en la clase pero no apareces en la lista.' },
  { value: 'salud', label: 'Salud', ayuda: 'Enfermedad, licencia o atención médica.' },
  { value: 'fuerza_mayor', label: 'Urgencia familiar o fuerza mayor', ayuda: 'Un imprevisto que no dependía de ti.' },
  { value: 'laboral', label: 'Motivo laboral', ayuda: 'Una emergencia o turno en tu trabajo.' },
  { value: 'otro', label: 'Otro', ayuda: 'Cuéntanos qué pasó.' },
] as const

export type MotivoJustificacion = (typeof MOTIVOS_JUSTIFICACION)[number]['value']
