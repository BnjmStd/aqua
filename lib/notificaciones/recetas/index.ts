import type { NombreEvento, Receta } from '../tipos'
import { solicitudConsultoriaCreada } from './consultoria'
import { inscripcionConfirmada, inscripcionCreada } from './inscripciones'
import { justificacionCreada, justificacionRevisada } from './justificaciones'
import { cuentaVerificarCorreo } from './verificacion'

/**
 * Todas las recetas del sistema. Agregar un aviso nuevo = escribir su archivo
 * y sumarlo a esta lista; nada mas cambia.
 */
export const RECETAS: Receta[] = [
  justificacionCreada,
  justificacionRevisada,
  inscripcionCreada,
  inscripcionConfirmada,
  solicitudConsultoriaCreada,
  cuentaVerificarCorreo,
]

/** Un evento puede disparar varias recetas (al equipo y al alumno, por ejemplo). */
export const recetasDelEvento = (evento: NombreEvento) => RECETAS.filter((receta) => receta.evento === evento)

export const recetaPorId = (id: string) => RECETAS.find((receta) => receta.id === id) ?? null
