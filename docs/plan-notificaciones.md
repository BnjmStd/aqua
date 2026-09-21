# Plan: sistema de notificaciones (in-app, correo, WhatsApp, SMS)

Estado: en construcción por etapas (2026-09-15). Ver "Etapas de construcción" al final.

## El problema

Hoy nadie se entera de nada si no entra a mirar: el equipo no sabe que llegó una justificación, el alumno no sabe que se la aprobaron, nadie recuerda la clase de mañana. Y cada aviso nuevo, si se programa "a mano" donde ocurre (un `resend.send()` dentro del hook de justificaciones, otro dentro de inscripciones…), termina en correos duplicados, textos repartidos por todo el código y un canal nuevo (WhatsApp) que obliga a tocar cada rincón.

Lo que se busca:

- **Agregar un aviso nuevo** = describirlo en un archivo, sin tocar el envío.
- **Agregar un canal nuevo** (WhatsApp, SMS) = un adaptador, sin tocar los avisos.
- **Cambiar de proveedor** (Resend → otro, Twilio → Meta) = cambiar un adaptador.
- Que un envío que falla **se reintente solo** y quede registro de qué se mandó, a quién y por dónde.
- Que la gente pueda **elegir por dónde** le llegan las cosas.

## Idea central: separar tres preguntas

```
  ¿QUÉ PASÓ?                ¿A QUIÉN Y QUÉ LE DECIMOS?          ¿POR DÓNDE LE LLEGA?
 ─────────────             ────────────────────────────        ──────────────────────
  Evento                    Tipo de notificación                Canal (adaptador)
  "justificacion.creada"    destinatarios + textos por canal    in-app · correo · WhatsApp · SMS
        │                              │                                 │
        ▼                              ▼                                 ▼
  hook de la colección  ──►  notificaciones (bandeja)  ──►  envios (cola con reintentos)
                             1 por destinatario             1 por canal, via Payload Jobs
```

1. **Evento** — un hecho del negocio, con nombre y datos tipados. Lo emite quien sabe que pasó (el hook `afterChange` de la colección), no la pantalla. No sabe nada de correos.
2. **Tipo de notificación** — la "receta" de un evento: a quién le importa, en qué categoría cae, y el contenido para cada canal.
3. **Canal** — cómo se entrega. Una interfaz común; cada proveedor es un adaptador.

## Modelo de datos

### `notificaciones` (la bandeja in-app + el registro)

Una fila por **destinatario**. Es a la vez lo que ve la campana y el historial.

| Campo | Notas |
|---|---|
| `destinatario` | relationship polimórfica `['users', 'cuentas']`: sirve para equipo y para alumnos |
| `tipo` | `justificacion.creada`, `sesion.recordatorio`… |
| `categoria` | `academia`, `pagos`, `cuenta`, `equipo` (para preferencias) |
| `titulo`, `cuerpo`, `url` | texto corto para la campana; `url` a donde lleva el clic |
| `leidaEl` | null = no leída |
| `claveUnica` | `tipo + id del objeto + destinatario`, **única**: si un hook corre dos veces, no se duplica |
| `datos` | json con los ids involucrados (para reconstruir o auditar) |

Acceso: cada destinatario lee y marca como leídas **solo las suyas**; nadie las crea por la API.

### `envios` (la entrega por canal)

Una fila por **notificación × canal externo** (in-app no genera envío: la notificación ya es el mensaje).

| Campo | Notas |
|---|---|
| `notificacion` | relationship |
| `canal` | `email`, `whatsapp`, `sms` |
| `estado` | `pendiente` → `enviado` / `fallido` / `omitido` (sin teléfono, canal apagado, preferencia) |
| `intentos`, `ultimoError` | lo llena el job |
| `idProveedor` | id de Resend / Meta / Twilio, para rastrear rebotes |
| `motivoOmision` | "sin teléfono verificado", "el usuario desactivó WhatsApp para Academia"… |

Solo lectura para el equipo en el panel (Sistema → Envíos): sirve para responder "¿le llegó el correo?".

### Preferencias (en `users` y `cuentas`)

Grupo `preferenciasNotificacion`: por **categoría × canal** (checkboxes). Defaults sensatos: in-app y correo activados, WhatsApp/SMS apagados hasta que la persona dé su número y lo active.

Hay avisos **obligatorios** que ignoran preferencias (recuperar contraseña, cambio de contraseña): el tipo lo marca con `obligatoria: true`.

## Código

```
lib/notificaciones/
  eventos.ts            catálogo tipado: nombre del evento -> forma de sus datos
  emitir.ts             emitirEvento(nombre, datos, { req }) — lo único que llaman los hooks
  tipos/
    justificacion-creada.ts
    justificacion-revisada.ts
    sesion-recordatorio.ts
    ...                 una receta por archivo
  canales/
    tipos.ts            interface Canal { id; disponible(); enviar(destino, contenido) }
    email-resend.ts
    whatsapp-meta.ts    (fase 3)
    sms-twilio.ts       (fase 3)
    consola.ts          desarrollo: imprime en la terminal en vez de enviar
  plantillas/email/     React Email (componentes con la marca)
jobs/
  enviar-notificacion.ts   task de Payload Jobs: toma un envío, llama al canal, reintenta
  recordatorios.ts         task programada (cron): busca sesiones de mañana y emite eventos
```

### Una receta, de ejemplo

```ts
// lib/notificaciones/tipos/justificacion-creada.ts
export default definirTipo({
  evento: 'justificacion.creada',
  categoria: 'equipo',
  // A quién: el equipo que revisa Academia (usuarios del panel con esa preferencia).
  destinatarios: async ({ payload }) => usuariosDelEquipo(payload, 'academia'),
  // Varias justificaciones en una hora = un solo correo "Tienes 3 justificaciones pendientes".
  agrupar: { clave: 'justificaciones-pendientes', ventana: '1h' },
  contenido: ({ justificacion, inscripcion }) => ({
    inApp: {
      titulo: 'Nueva justificación de inasistencia',
      cuerpo: `${inscripcion.participanteNombre} · sesión ${justificacion.sesion}`,
      url: `/admin/collections/justificaciones/${justificacion.id}`,
    },
    email: { asunto: 'Justificación pendiente de revisión', plantilla: 'JustificacionPendiente' },
    // WhatsApp exige plantillas aprobadas por Meta para mensajes que inicia la empresa.
    whatsapp: { plantilla: 'justificacion_pendiente', variables: [inscripcion.participanteNombre] },
  }),
})
```

Y en la colección, una línea:

```ts
afterChange: [({ doc, operation, req }) => operation === 'create' && emitirEvento('justificacion.creada', { id: doc.id }, { req })]
```

### El flujo por dentro

1. El hook llama `emitirEvento(...)` **con `req`**: todo ocurre dentro de la misma transacción. Si la justificación no se guarda, no sale ningún aviso (patrón *outbox*).
2. `emitir` busca la receta, resuelve destinatarios, aplica preferencias, crea las `notificaciones` (con `claveUnica`) y un `envio` por canal habilitado.
3. Por cada envío encola el job `enviar-notificacion` (`payload.jobs.queue`). Si la receta agrupa, lo encola con `waitUntil` al final de la ventana y los siguientes eventos se suman al mismo envío.
4. El job arma el contenido final, llama al adaptador del canal y marca `enviado` o `fallido`. Payload Jobs reintenta con backoff (`retries: { attempts: 5, backoff: exponencial }`).
5. La campana lee `notificaciones` no leídas del usuario.

**Por qué Payload Jobs y no un servicio aparte:** ya está configurado en el proyecto (lo usa la publicación programada), persiste en la misma base, reintenta, soporta `waitUntil` y tareas con cron. En desarrollo corre solo (`autoRun`); en producción serverless se llama `/api/payload-jobs/run` desde un cron externo (ya documentado en `payload.config.ts`).

**Por qué no Knock/Novu/Courier (SaaS de notificaciones):** para el volumen de una consultora son costo mensual y datos personales en un tercero. La interfaz `Canal` deja la puerta abierta: si algún día conviene, se reemplaza la capa de envío sin tocar eventos ni recetas.

## Canales

| Canal | Proveedor recomendado | Notas |
|---|---|---|
| In-app | propio (`notificaciones`) | Campana en el header del sitio y en el panel de Payload; página `/cuenta/notificaciones`. Actualiza al navegar y cada 60 s; tiempo real (SSE) no hace falta todavía |
| Correo | **Resend** + React Email | Ya decidido para el newsletter. Instalar también `@payloadcms/email-resend` para que los correos propios de Payload (recuperar contraseña) salgan por el mismo lado. Requiere verificar el dominio (SPF/DKIM en el DNS de aquabioprocess.cl) |
| WhatsApp | **Meta WhatsApp Cloud API** (directo) | Más barato que Twilio. Mensajes iniciados por la empresa **solo con plantillas aprobadas** (categoría "utilidad"). Requiere número de empresa verificado y opt-in explícito del usuario |
| SMS | Twilio u otro local | Caro por mensaje: dejarlo solo para lo crítico (ej. clase cancelada a última hora) |

Teléfonos: guardar en E.164 (`+56912345678`) y **verificarlos** (código por SMS/WhatsApp) antes de habilitar esos canales. Sin número verificado, el envío queda `omitido` con motivo, no falla.

## Catálogo inicial de eventos

| Evento | Para | Canales por defecto | Fase |
|---|---|---|---|
| `justificacion.creada` | equipo Academia | in-app + correo (agrupado por hora) | 1 |
| `justificacion.revisada` | alumno | in-app + correo | 1 |
| `inscripcion.creada` | equipo | in-app + correo | 1 |
| `inscripcion.confirmada` | alumno | in-app + correo | 1 |
| `solicitud-consultoria.creada` | equipo | in-app + correo | 1 |
| `recurso.publicado` (grabación/material) | inscritos confirmados | in-app (+ correo diario agrupado) | 2 |
| `sesion.recordatorio` (24 h antes, programado) | inscritos confirmados | in-app + correo (+ WhatsApp si opt-in) | 2 |
| `pago.pendiente.recordatorio` (programado) | cuenta | in-app + correo | 2 |
| `sesion.cancelada` | inscritos | todos, incluido SMS | 3 |
| `certificado.emitido` | alumno | in-app + correo | con certificados |

## Experiencia

- **Alumno:** campana con contador en el header (junto al avatar); desplegable con las últimas 5; `/cuenta/notificaciones` con todo el historial y "marcar todo como leído"; en **Mis datos** una sección **Notificaciones**: tabla categoría × canal, y el teléfono para WhatsApp.
- **Equipo:** campana en el panel de Payload (componente en la barra del admin) y el mismo control de preferencias en su usuario. Opcional: bloque "Pendientes de revisión" en el dashboard del panel.

## Fases

1. **Núcleo + in-app + correo.** Colecciones `notificaciones` y `envios`, `emitirEvento`, job con reintentos, canal consola (dev) y Resend, campana en sitio y panel, eventos de justificación / inscripción / solicitud. Adaptador de correo de Payload.
2. **Preferencias y programados.** Preferencias por categoría × canal, agrupación (digest), recordatorio de sesión y de pago, aviso de nueva grabación.
3. **WhatsApp y SMS.** Verificación de teléfono, adaptadores Meta/Twilio, plantillas aprobadas.

## Auditoría del plan (2026-09-15)

Lo que faltaba o estaba mal resuelto en la primera versión, y cómo queda.

### Bloqueante: la cola de trabajos está abierta a cualquier cuenta

Payload deja por defecto `jobs.access.run/queue/cancel` y la colección `payload-jobs` abiertos a **cualquier usuario con sesión**, y eso incluye `cuentas` (registro público). Verificado con una cuenta de prueba: `GET /api/payload-jobs` 200 (lee trabajos en cola), `GET /api/payload-jobs/run` 200 (dispara la cola), `POST /api/payload-jobs` acepta crear trabajos (con un `taskSlug` válido podría encolar un `schedulePublish` y publicar un borrador). Las notificaciones van a pasar por esa cola con datos personales.

**Arreglo (etapa 1):** `jobs.access` solo para personal del panel; `run` además acepta `Authorization: Bearer $CRON_SECRET` para el cron de producción; `jobsCollectionOverrides` deja la colección `payload-jobs` solo para el panel.

### Faltas de diseño

1. **Silenciar eventos en scripts.** Seeds, `db:datos-prueba` e importaciones disparan los mismos hooks: mandarían correos reales. → `req.context.sinNotificaciones = true` y `emitirEvento` no hace nada.
2. **Vigencia al momento de enviar.** Entre que se encola y se envía (sobre todo con agrupación) la situación puede cambiar: la justificación ya se revisó. → cada receta define `vigente(ctx)`; el job lo revisa antes de mandar y si no aplica marca `omitido: ya no aplica`.
3. **No avisarse a uno mismo.** El admin que aprueba no debe recibir "se aprobó una justificación". → `actor` (el `req.user`) se excluye de los destinatarios.
4. **Clave de deduplicación por receta.** `tipo + id` no alcanza: una justificación puede revisarse dos veces (rechazada → aprobada). → la receta define `clave(ctx)` (ej. `id + estado + resultado`).
5. **Agrupación mal modelada.** Un envío apuntaba a una sola notificación, pero un resumen junta varias. → `envios.notificaciones` es `hasMany`.
6. **Destinatarios sin cuenta.** El participante B2B (Carla) o un suscriptor del newsletter no tienen cuenta. → el destinatario puede ser una cuenta/usuario **o** un contacto (`email`/`telefono`); sin cuenta no hay bandeja in-app, solo canales externos.
7. **Darse de baja sin iniciar sesión.** Gmail y Yahoo exigen desde 2024 baja en un clic para remitentes masivos. → enlace firmado (token) a una página de preferencias + cabecera `List-Unsubscribe`. Los obligatorios no llevan baja.
8. **Rebotes y quejas.** Seguir mandando a un correo que rebota daña la reputación del dominio. → webhook de Resend (firma verificada) marca el correo como inválido y los siguientes envíos quedan `omitido`. Igual con los estados de WhatsApp (entregado/leído/fallido).
9. **Horario y zona horaria.** WhatsApp/SMS no a las 3 AM. → horario de silencio por defecto 21:00–08:00 `America/Santiago` para canales de celular; el envío se difiere con `waitUntil`. Correo e in-app sin restricción.
10. **Consentimiento y datos personales (Ley 19.628 y Ley 21.719).** → guardar fecha, canal y texto aceptado al activar WhatsApp/SMS; retención: notificaciones leídas se purgan a los 12 meses y `envios` a los 6 (job programado); al borrar una cuenta se borran sus notificaciones.
11. **Contenido seguro.** Texto del usuario (el detalle de una justificación) dentro de correos y de la campana: siempre escapado, y `url` solo rutas internas.
12. **Límites de proveedores.** Resend y Meta limitan mensajes por segundo. → `concurrency` en la tarea de envío y reintento con backoff exponencial ante 429.
13. **Observabilidad.** → vista "Envíos fallidos" en el panel y, más adelante, un aviso al equipo si fallan más de N en una hora.
14. **Crecimiento de `payload-jobs`.** → `deleteJobOnComplete` (el registro útil queda en `envios`).
15. **Pruebas.** El proyecto no tiene runner de tests. → las recetas son funciones puras de `ctx`; se prueban con un script `tsx`, y el canal consola permite ver cada mensaje en desarrollo sin enviar nada.

## Verificación de correo (hecha, 2026-09-15)

Evento `cuenta.verificar-correo`, receta `cuenta-verificar-correo`.

- **No se usa el `verify` de Payload** porque ese bloquea el ingreso. Acá la persona entra igual y ve un aviso en su cuenta con botón "Reenviar correo".
- En la cuenta se guarda **solo el hash** del token (`lib/verificacion.ts`); el token en claro viaja en el correo y en los datos del evento, y el envío **borra esos datos apenas sale el mensaje** (bandera `datosSensibles` en la receta).
- La receta es `soloExterno`: queda el registro, pero no aparece como pendiente en la campana (quien no verificó su correo no está mirando su bandeja).
- Token válido 48 h; reenvío limitado a 1 cada 2 min; `/cuenta/verificar?token=…` responde a los cuatro casos (válido, ya usado, vencido, sin token).
- **Todavía no bloquea nada.** Cuando exista el flujo de inscripción en el sitio, ahí se exige el correo verificado.

## Decisiones

1. **Quién del equipo recibe los avisos de Academia:** por ahora todos los usuarios del panel; en la fase 2, cada uno lo ajusta en sus preferencias.
2. **Frecuencia para el equipo:** in-app al instante; correo agrupado por hora (fase 2). Mientras no haya agrupación, el correo sale al instante.
3. **Correo (abierta):** hace falta una API key de Resend y acceso al DNS de aquabioprocess.cl. Mientras tanto, el canal de correo es la consola.
4. **WhatsApp (fase 3, abierta):** número de empresa en Meta Business y quién gestiona la aprobación de plantillas.

## Etapas de construcción

- ✅ **Etapa 1 — Núcleo** (2026-09-15). Cierre de la cola de trabajos (`access/cola.ts`, `jobs.access` + `jobsCollectionOverrides` en `payload.config.ts`); colecciones `notificaciones` y `envios`; `lib/notificaciones/` (tipos, emisor, recetas, canales) con silencio por `req.context.sinNotificaciones`, exclusión del actor, deduplicación por `claveUnica` y revisión de vigencia al enviar; tarea `enviarNotificacion` con 5 reintentos y espera creciente; canal consola; eventos `justificacion.creada` (al equipo) y `justificacion.revisada` (al alumno).
  - **Producción:** definir `CRON_SECRET` y llamar `GET /api/payload-jobs/run` con `Authorization: Bearer $CRON_SECRET` desde un cron externo. En desarrollo la cola corre sola cada minuto.
  - Verificado: aviso al equipo al crear, aviso al alumno al resolver, el admin que aprueba no se avisa a sí mismo, no se duplica al reeditar, los scripts no notifican, y una cuenta pública ya no puede leer ni disparar la cola (401/403).
- ✅ **Etapa 2 — In-app** (2026-09-15). Campana en el header del sitio (`components/cuenta/Campana.tsx`) con contador, últimas 5 y marcado al abrir; sondeo cada 60 s, al navegar y ante el evento `notificaciones:cambio`; sección `/cuenta/notificaciones` con historial y "marcar todo como leído"; badge en el avatar del menú móvil; campana del equipo dentro del panel de Payload (`components/admin/AvisosDelPanel.tsx`, Server Component sin sondeo).
  - Marcar como leída pasa por Server Actions con el destinatario en el filtro: mandar el id de otra persona no cambia nada.
  - `lib/notificaciones/formato.ts` centraliza el tiempo relativo y `rutaSegura` (solo rutas internas: la url viaja en la base de datos).
- **Etapa 3 — Correo real.** Adaptador Resend, plantilla de correo con la marca, `@payloadcms/email-resend`, baja por token, webhook de rebotes.
- ✅ **Etapa 4 — Más eventos y agrupación** (2026-09-15). Eventos `inscripcion.creada` (equipo), `inscripcion.confirmada` (alumno) y `solicitud-consultoria.creada` (equipo). Agrupación: la receta declara `agrupar: { clave, ventanaMinutos }`; mientras hay un envío pendiente con esa clave, los avisos siguientes se suman a ese mensaje en vez de generar otro. La bandeja in-app siempre recibe los avisos uno por uno; el resumen solo afecta a los canales externos.
  - Ventana actual: 60 min para los avisos al equipo (`academia-equipo` y `consultoria-equipo`). Los avisos al alumno no se agrupan.
  - El resumen se arma con lo guardado en cada notificación y revisa la vigencia de cada una: las que dejaron de aplicar no aparecen, y si no queda ninguna el envío se marca `omitido`.
  - `scripts/datos-prueba-cuenta.ts` crea inscripciones con `context: { sinNotificaciones: true }`.
  - Verificado: 3 inscripciones desde el sitio → 2 avisos in-app + **1 solo correo** con el resumen; una inscripción confirmada por el panel → aviso al alumno sin agrupar; solicitud de consultoría → aviso al equipo; y cuando el propio admin crea la inscripción, no se autoavisa.
  - **Pendiente conocido:** si dos eventos entran exactamente al mismo tiempo, podrían crearse dos envíos agrupados en vez de uno (carrera). Con el volumen actual es aceptable; se resuelve con un índice único o bloqueo cuando haga falta.
- **Fase 2 y 3** como arriba (preferencias, programados, WhatsApp/SMS).
