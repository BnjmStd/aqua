# Plan: aula del curso (material, grabaciones, asistencia y certificado)

Estado: **fase 1 implementada** (2026-09-15). Fases 2 y 3 pendientes.

## Qué problema resuelve

Hoy "Mis cursos" muestra **cuándo y dónde** es un curso. Falta lo que el alumno necesita **durante y después**:

- entrar a la clase online (enlace de Zoom/Meet),
- descargar el material (presentaciones, guías, lecturas),
- ver las grabaciones,
- saber cuánta asistencia lleva y si le alcanza para certificar,
- descargar el certificado y poder demostrar que es auténtico.

Hoy el equipo resuelve todo esto por correo: se pierde, se reenvía, y los enlaces de Zoom o de las grabaciones terminan circulando fuera del curso.

## Principio de seguridad (el que manda en el diseño)

`cursos` y `convocatorias` son **públicas**: la API REST las entrega a cualquiera una vez publicadas. Si el enlace de Zoom, las grabaciones o el material quedaran como campos de esas colecciones, bastaría con abrir `/api/convocatorias` para verlos.

Por eso **nada privado vive en colecciones públicas**. Va en colecciones nuevas que por defecto niegan todo y solo abren a:

- personal del panel (`users`), o
- una cuenta con inscripción **confirmada** o **asistió** en esa convocatoria.

Los archivos van en una colección de upload propia (no en `media`, que es pública). Payload sirve cada archivo por `/api/<coleccion>/file/<nombre>` y **aplica el `access.read` de la colección** al servirlo (`payload/dist/uploads/checkFileAccess.js`), así que un enlace copiado no sirve a quien no tenga acceso.

## Modelo de datos

### 1. Colección nueva `recursos` (upload opcional)

Un recurso = un enlace **o** un archivo, asociado a un curso (todas sus ediciones) o a una convocatoria (una edición), y opcionalmente a una sesión.

| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | text, requerido | "Presentación sesión 2", "Grabación: Filamentosas" |
| `tipo` | select | `material`, `lectura`, `grabacion`, `enlace_clase` |
| `alcance` | select | `curso` (se repite en cada edición) o `convocatoria` |
| `curso` / `convocatoria` | relationship | según `alcance` |
| `sesion` | number, opcional | N° de sesión (1..n). Sin número = recurso general |
| `enlace` | text (https) | para enlaces (Zoom, Vimeo, YouTube, Drive). No se llama `url` porque ese nombre lo reserva el upload |
| archivo | upload con `filesRequiredOnCreate: false` | PDF, PPTX, XLSX, ZIP. Tope de tamaño |
| `visibleDesde` | date, opcional | ej. grabación que se publica al día siguiente |
| `visibleHasta` | date, opcional | ej. grabaciones disponibles 90 días |
| `descripcion` | textarea, opcional | |

Validación: exige `enlace` **o** archivo, no ambos vacíos.

`access.read`: staff → todo; cuenta → `Where` con las convocatorias donde tiene inscripción confirmada/asistió (y los cursos de esas convocatorias). Se calcula en la función de acceso con una consulta a `inscripciones`.

**Por qué una sola colección y no campos en la convocatoria:** es privada por defecto (no hay que acordarse de ocultar campo por campo), el equipo ve todo el material en una lista filtrable y el material base del curso se carga una vez y aparece en todas las ediciones.

**Enlace de la clase:** `tipo: enlace_clase`. En el aula, el botón "Unirse a la clase" se activa **15 min antes** de cada sesión y hasta que termina (fecha + duración). Fuera de esa ventana se muestra la hora, no el enlace.

**Videos:** Payload **no** aloja videos (peso, streaming, costos). Se guarda la URL y el aula muestra el reproductor embebido. Recomendación: **Vimeo** (privacidad por dominio: el video solo se reproduce dentro de aquabioprocess.cl) o, si se quiere gratis, **YouTube "no listado"** (cualquiera con el enlace lo ve). El modelo sirve para ambos.

### 2. Colección nueva `listas-asistencia`

Una lista por sesión: `convocatoria` + `sesion` (N° según orden de fechas) + `presentes` (relationship `hasMany` a `inscripciones`, filtrada a los inscritos confirmados de esa convocatoria). Una sola lista por sesión (validado en un hook).

**Por qué una colección y no un campo en `convocatorias.sesiones`** (lo que decía la primera versión de este plan): las convocatorias tienen borradores, así que pasar lista obligaría a re-publicar la convocatoria cada vez y gastaría versiones. Además la colección es privada de entrada (solo panel); la convocatoria es pública.

El alumno no lee esta colección por la API: el aula la consulta en el servidor y muestra solo lo de su inscripción.

Se deriva sin guardar nada más:

- asistencia por sesión: presente / ausente (hay lista y no está) / sin registrar (ya ocurrió, no hay lista) / próxima,
- % de asistencia = presentes / sesiones con lista,
- ¿cumple el mínimo para certificar? Si hay listas, mandan las listas; el estado "asistió" de la inscripción solo cuenta cuando el curso no usa listas.

Mínimo configurable en el curso: `asistenciaMinima` (number, default **75 %**, que es el estándar SENCE).

### 2b. Colección nueva `justificaciones` (hecha)

Si el alumno figura **ausente** en una lista, en esa sesión del aula aparece **"Justificar inasistencia"**: elige motivo (sí asistí / salud / urgencia o fuerza mayor / laboral / otro), escribe el detalle y puede adjuntar un respaldo (PDF o imagen, hasta 5 MB, upload privado: solo lo ven él y el equipo).

- **Plazo:** 7 días corridos desde la sesión (`PLAZO_JUSTIFICACION_DIAS` en `lib/justificaciones.ts`).
- **Una vigente por sesión:** mientras hay una pendiente o aprobada no se puede enviar otra; si la rechazan, puede enviar otra dentro del plazo.
- **Revisión en el panel** (Academy → Justificaciones de inasistencia): `estado` pendiente/aprobada/rechazada. Al aprobar es obligatorio elegir `resultado`:
  - `presente`: error en la lista, la sesión cuenta como asistida.
  - `justificada`: no cuenta en contra; se saca del cálculo del %.
  Al rechazar es obligatoria una `respuesta`, que el alumno ve en su aula.
- **No se toca la lista de asistencia:** el aula superpone la justificación aprobada al calcular. La lista sigue siendo lo que marcó el relator y la corrección queda trazable.
- **Seguridad:** el alumno crea solo por la Server Action del aula (valida dueño, sesión ausente, plazo, formato real del archivo); `create` por la API está cerrado (403). Cada cuenta lee solo sus justificaciones y sus archivos.
- Sin aviso por correo al equipo todavía (fase 3, Resend): hay que revisar las pendientes en el panel.

### 3. Colección nueva `certificados`

| Campo | Tipo | Notas |
|---|---|---|
| `inscripcion` | relationship, único | un certificado por inscripción |
| `codigo` | text, único, autogenerado | `ABP-2026-7K4Q9X`: legible, sin ambigüedad (sin O/0, I/1) |
| `emitidoEl` | date | |
| `horas` | number | copiado del curso al emitir (si el curso cambia, el certificado no) |
| `participanteNombre`, `cursoTitulo` | text | idem, congelados al emitir |
| `porcentajeAsistencia` | number | congelado al emitir |
| archivo PDF | upload privado | fase 1: el equipo lo sube; fase 3: se genera solo |
| `anulado` + `motivoAnulacion` | checkbox + text | nunca se borra: se anula |

**Verificación pública** en `/certificados/verificar/[codigo]`: muestra nombre, curso, horas y fecha, o "no encontrado / anulado". Sirve para que una empresa confirme que un certificado es real y para el botón **"Agregar a LinkedIn"** (la URL de LinkedIn `add to profile` recibe nombre, emisor, fecha, URL de verificación y código).

Datos congelados a propósito: un certificado es un documento emitido y no debe cambiar si mañana se renombra el curso.

## Experiencia del alumno

### Entrada

En "Mis cursos", cada tarjeta confirmada suma **"Entrar al curso" →** `/cuenta/cursos/[inscripcionId]`. La página valida que la inscripción sea de la cuenta en sesión (si no, 404, no 403: no confirmar que existe).

### Página del aula (una sola página, con secciones y un índice fijo)

```
← Mis cursos
Corrosión en plantas de tratamiento           [Online en vivo] [Confirmada]
7 sept al 21 de septiembre · 12 horas · Dra. Paula Rivas

┌ AHORA ─────────────────────────────────────────────────────────┐
│ Sesión 3 · Recubrimientos y control                              │
│ Lunes 21 de septiembre, 10:00        [ Unirse a la clase ]      │ ← activo 15 min antes
└──────────────────────────────────────────────────────────────────┘

Sesiones
 ✓ 1  Mecanismos de corrosión     7 sept    ▶ Grabación   📄 2 archivos
 ✗ 2  Inspección en terreno       14 sept   ▶ Grabación   📄 1 archivo
 ○ 3  Recubrimientos y control    21 sept   (disponible después de la clase)

Material del curso
 📄 Guía del participante (PDF, 2,4 MB)
 🔗 Norma NCh 2369 (enlace)

Asistencia                                     1 de 2 sesiones · 50 %
 ████████░░░░░░░░  mínimo para certificar: 75 %
 "Si asistes a la sesión 3 llegas a 67 %: no alcanza. Escríbenos si faltaste por fuerza mayor."

Certificado
 ○ En curso → se habilita al terminar si cumples 75 % de asistencia
```

Estados de la sección Certificado:

1. **En curso:** qué falta para obtenerlo.
2. **No cumple el mínimo:** explicación y contacto.
3. **En preparación:** terminó y cumple, pero el equipo aún no lo emite.
4. **Disponible:** Descargar PDF · Copiar enlace de verificación · Agregar a LinkedIn.

### Quién ve qué

| Estado de la inscripción | Calendario | Enlace de clase, material, grabaciones | Asistencia | Certificado |
|---|---|---|---|---|
| Pendiente / lista de espera | sí | no: "se habilita al confirmar tu inscripción" | no | no |
| Confirmada | sí | sí | sí | según estado |
| Asistió | sí | sí (dentro de `visibleHasta`) | sí | sí |
| No asistió / cancelada | sí | no | sí (no asistió) | no |

### Participante ≠ cuenta (inscripciones B2B)

Si una jefatura inscribe a "Carla Muñoz", la dueña de la inscripción es la **cuenta** de la jefatura. Fase 1: esa cuenta ve el aula y el certificado de Carla (le sirve, porque suele ser quien gestiona SENCE y los certificados de su equipo). Fase posterior: invitar a Carla por correo a crear su cuenta y darle acceso a su propia aula (`participanteCuenta`).

## Experiencia del equipo (panel)

- **Recursos:** Academy → Recursos. Filtrar por convocatoria; subir archivo o pegar enlace; elegir sesión.
- **Asistencia:** Academy → Listas de asistencia → crear "convocatoria + N° de sesión" y elegir a los presentes (solo aparecen los inscritos confirmados de esa convocatoria).
- **Certificados:** Academy → Certificados → crear desde la inscripción; el código se genera solo. En la inscripción, un aviso de "cumple asistencia, falta certificado".

## Fases

1. ✅ **Aula + recursos + asistencia.** Colecciones `recursos` (privada, upload opcional) y `listas-asistencia`, `asistenciaMinima` en cursos, página `/cuenta/cursos/[inscripcionId]`, botón "Entrar al curso", datos de prueba (`npm run db:datos-prueba`).
2. **Certificados.** Colección `certificados` con PDF subido a mano, sección certificado en el aula, página pública de verificación, botón de LinkedIn.
3. **Automatizar.** Generar el PDF del certificado con plantilla de marca; correos con Resend ("nueva grabación disponible", recordatorio 24 h antes con el enlace); invitar al participante cuando no es quien inscribió.

## Decisiones

1. **Inscripciones B2B:** en fase 1 la cuenta que inscribió ve el aula del participante (confirmado). Invitar al participante queda para fase 3.
2. **Asistencia mínima:** 75 % por defecto, editable por curso.
3. **Disponibilidad de grabaciones:** por recurso con `visibleHasta`; vacío = siempre.
4. **Video:** **YouTube "no listado"** para las grabaciones reales. El proveedor no está fijado en ningún lado: `lib/video.ts` lo deduce de cada URL (YouTube, Vimeo, Google Drive), así que se pueden mezclar y cambiar más adelante editando solo el enlace de cada recurso. Un servicio no reconocido se muestra como enlace, no se rompe.
   - Al subir a YouTube: visibilidad **No listado** y **Permitir inserción** activado (si no, el reproductor del aula muestra error).
   - Límite a tener presente: un video no listado lo ve cualquiera que tenga el enlace. El aula solo se lo muestra a inscritos, pero un alumno podría compartirlo. Si eso llega a importar, pasar a Vimeo con privacidad por dominio (el video solo se reproduce dentro de aquabioprocess.cl).

## Verificado en fase 1

- Sin inscripción confirmada: `/api/recursos` y `/api/recursos/file/<archivo>` responden 403, con y sin sesión.
- Con inscripción confirmada: se listan solo los recursos de sus convocatorias/cursos; no aparecen los que tienen `visibleDesde` futuro ni `visibleHasta` vencido, y sus archivos siguen en 403.
- `/api/listas-asistencia` responde 403 a cuentas.
- `/cuenta/cursos/<id>` de una inscripción ajena o inexistente responde 404.
