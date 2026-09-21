# Plan SEO — aquabioprocess.cl

> Diagnóstico hecho sobre el sitio publicado el **14 de septiembre de 2026**.
> Stack: Next.js 16 · Payload CMS · Cloudflare. Mercado: Chile, en español.

## Resumen

Hoy Google puede rastrear el sitio, pero el sitio le da muy pocas señales: la portada se llama «Inicio», no hay sitemap, los enlaces compartidos salen sin imagen y la versión `http://` responde con error.

| Área | Estado | Por qué |
|---|---|---|
| Base técnica | Sólida | HTTPS con HSTS, `lang="es"`, un H1 por página y 404 reales |
| Señales para buscadores | Casi ausentes | No hay sitemap, canonical, Open Graph ni datos estructurados |
| Contenido indexable | Escaso | Dos artículos en Insights y un catálogo de cursos de ~60 palabras |

---

## 1. Diagnóstico

| Prioridad | Hallazgo | Evidencia |
|---|---|---|
| 🔴 Crítico | `http://` no carga | `http://aquabioprocess.cl` y `http://www…` devuelven un error 520 de Cloudflare |
| 🔴 Crítico | Dos sitios en vez de uno | `www` y el dominio sin `www` responden 200, sin redirección ni `canonical`, y compiten entre sí |
| 🔴 Crítico | No hay sitemap | `/sitemap.xml` da 404. El `robots.txt` lo genera Cloudflare y no apunta a ningún sitemap |
| 🔴 Crítico | La portada no tiene título ni descripción | `<title>Inicio</title>` y ninguna `description`. A Consultoría y Fundador también les falta la descripción. Los títulos no usan un sufijo uniforme |
| 🔴 Crítico | Sin vista previa al compartir | Ninguna página tiene imagen Open Graph, `og:url` ni `og:locale`. En LinkedIn y WhatsApp el enlace sale sin imagen |
| 🟠 Importante | Sin datos estructurados | No hay JSON-LD: Google no sabe que es una empresa chilena, quién es el fundador ni qué son los cursos |
| 🟠 Importante | Faltan palabras clave en la portada | El H1 está en inglés («Science behind the process…») y no menciona «tratamiento de aguas». Los títulos dicen «Consulting» y «Academy», pero el menú dice Consultoría y Academia |
| 🟠 Importante | Ninguna página usa caché | Todas responden `cache-control: private, no-store` y tardan 0,5–1,5 s. El Header lee la sesión (`obtenerCuentaActual` → `headers()`) en cada visita, y eso vuelve dinámico todo el sitio |
| ⚪ Menor | Las páginas de cuenta se pueden indexar | `/cuenta/ingresar` y `/cuenta/registro` no tienen `noindex` ni H1 |
| ⚪ Menor | Detalles de contenido | Descripciones sin tildes («microscopia», «guia»), el Footer enlaza a `/privacidad` (da 404) y algunas imágenes tienen `alt` vacío |

**Lo que ya funciona y se mantiene**

- Los artículos y cursos generan título, descripción y etiquetas sociales desde el CMS (`lib/seo.ts`, grupo SEO en `fields/seo.ts`).
- `/admin` y `/api` envían `X-Robots-Tag: noindex, nofollow`.
- Las páginas 404 y 500 nuevas están listas y falta desplegarlas.

---

## 2. Metas

Se miden en Google Search Console, salvo el rendimiento, que se mide con PageSpeed Insights. La línea base se toma en la primera semana después de la Fase 0.

| Métrica | Meta | Nota |
|---|---|---|
| Búsqueda de marca «aquabioprocess» | Posición 1 | En una búsqueda de prueba apareció el repositorio de GitHub y no el sitio |
| Cobertura del índice | 100 % de las URLs del sitemap | Sin duplicados de `www` |
| Core Web Vitals (móvil) | LCP < 2,5 s · CLS < 0,1 · TTFB < 0,8 s | Umbral «bueno» de Google |
| Resultados enriquecidos | 0 errores | Organization, Article y Course |
| Impresiones de búsquedas sin la marca (6 meses) | Tendencia al alza | Señal de que el contenido está funcionando |
| Contactos desde búsqueda orgánica | Registrados | Clics en «Contactar» y WhatsApp |

---

## 3. Temas y términos objetivo

Es una propuesta inicial basada en el rubro. Hay que validarla con los datos de Search Console a los 30 días.

| Tema | Página destino | Términos |
|---|---|---|
| Tratamiento de aguas industriales | Portada · `/consultoria` | tratamiento de riles, efluentes industriales Chile, consultoría en tratamiento de aguas, planta de tratamiento de riles |
| Normativa de descarga | Insights · servicios | DS 90, DS 609, DS 46, cumplimiento normativo riles |
| Procesos biológicos | Insights · casos | lodos activados, bioindicadores, microscopía de lodos, bulking filamentoso |
| Formación técnica | `/academia` · cursos | curso operación de plantas, capacitación tratamiento de aguas, curso PTAS |

Cada tema necesita una página propia que lo trate en profundidad. Mencionarlo de pasada en la portada no alcanza para posicionar.

---

## 4. Hoja de ruta

Las fases van en orden porque cada una depende de la anterior: no sirve crear contenido si Google indexa dos copias del sitio. Las duraciones son estimaciones de trabajo efectivo.

### Fase 0 — Infraestructura en Cloudflare

**Duración:** 1 hora · **Quién:** dueño del dominio · **Código:** ninguno

- [ ] **Forzar HTTPS.** En SSL/TLS, usar el modo *Full (strict)* y activar *Always Use HTTPS*. Así desaparece el error 520 en `http://`.
- [ ] **Dejar un solo dominio.** Crear una Redirect Rule 301 de `www.aquabioprocess.cl/*` a `https://aquabioprocess.cl/$1`, conservando la ruta.
- [ ] **Search Console.** Registrar una propiedad de tipo *Dominio* y verificarla con un registro TXT en el DNS de Cloudflare. Así cubre `http`, `https` y `www`.
- [ ] **Bing Webmaster Tools.** Importar la propiedad desde Search Console.

**Verificación:** `curl -I http://www.aquabioprocess.cl` responde 301 hacia `https://aquabioprocess.cl/`.

### Fase 1 — Fundamentos técnicos

**Duración:** 1–2 días · **Quién:** desarrollo

- [ ] **Metadatos base** en `app/(frontend)/layout.tsx`: `metadataBase`, la plantilla de títulos `%s · aquabioprocess.cl`, `openGraph.siteName` y `locale: 'es_CL'`.
- [ ] **Canonical por página**, agregado en `metadataDesdeSeo` (`lib/seo.ts`).
- [ ] **Título y descripción en todas las páginas.** Usar `metadataDesdeSeo` también en la portada, Consultoría, Fundador, Academia e Insights. Llenar el grupo SEO de la página «inicio» en el CMS.
- [ ] **Títulos en español:** Consultoría y Academia. Insights y R&D quedan en inglés.
- [x] **URLs en español:** `/consulting` → `/consultoria` y `/academy` → `/academia`, con 301 desde las rutas anteriores (`next.config.ts`). El mapa está en `RUTA_UNIDAD` (`fields/unidad.ts`).
- [ ] **`app/sitemap.ts`** con las páginas fijas y los artículos y cursos publicados. `lastModified` sale de `updatedAt` y se omiten los documentos con `noIndexar`.
- [ ] **`app/robots.ts`** que bloquee `/admin`, `/api` y `/cuenta` y declare el sitemap. Cloudflare pone sus reglas antes de este archivo, así que conviven ([docs](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)).
- [ ] **Imagen para compartir:** `opengraph-image.tsx` con `next/og` en la paleta navy y teal. Los documentos que tengan imagen SEO en el CMS usan la suya.
- [ ] **`noindex` en `/cuenta`**.
- [ ] **Desplegar** las páginas 404 y 500 nuevas.

**Verificación:** Search Console acepta el sitemap y la portada muestra imagen en el [Post Inspector de LinkedIn](https://www.linkedin.com/post-inspector/).

### Fase 2 — Datos estructurados (JSON-LD)

**Duración:** 1 día · **Quién:** desarrollo · **Fuente:** global `ConfiguracionSitio`

- [ ] **Portada — `ProfessionalService` + `WebSite`:** razón social, logo, correos, `areaServed: Chile` y `sameAs` con el LinkedIn guardado en «Redes sociales».
- [ ] **`/fundador` — `Person`:** Dr. Miguel Salinas Maldonado como fundador, con cargo, especialidades y perfiles profesionales.
- [ ] **Insights — `Article`:** autor, fechas de publicación y modificación, e imagen.
- [ ] **Academia — `Course`:** nombre, descripción y proveedor.
- [ ] **`BreadcrumbList`** en artículos y cursos.

**Verificación:** cero errores en la [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) para una URL de cada tipo.

### Fase 3 — Velocidad

**Duración:** 1–2 días · **Quién:** desarrollo

- [ ] **Sacar la sesión del render del servidor.** Pasar el botón «Ingresar / Mi cuenta» del Header a un componente cliente pequeño, para que las páginas públicas dejen de ser dinámicas.
- [ ] **Regenerar solo al publicar.** Agregar hooks `afterChange` en Payload que llamen a `revalidatePath` cuando se edita una página, un artículo o un curso.
- [ ] **Caché en Cloudflare**, una vez que las páginas se puedan cachear.
- [ ] **Imagen principal y fuentes.** Ajustar `sizes` del hero (hoy `100vw`, con variantes de hasta 3840 px) y revisar cómo cargan las tres familias tipográficas en móvil.

**Verificación:** la portada responde con `cf-cache-status: HIT` y PageSpeed en móvil marca un LCP menor a 2,5 s.

### Fase 4 — Contenido y autoridad

**Duración:** continuo · **Quién:** equipo técnico + desarrollo · **Ritmo:** 2 piezas al mes

- [ ] **H1 de la portada en español** que diga qué hace la empresa. El lema en inglés puede quedar como frase de marca.
- [ ] **Una página por servicio de Consultoría:** qué problema resuelve, normativa aplicable, metodología y un caso.
- [ ] **Insights como centro de conocimiento:** dos artículos técnicos al mes, organizados por los temas de la sección 3 y enlazados a los servicios.
- [ ] **Orden en el contenido del CMS:** tildes, `alt` descriptivo, página `/privacidad` y enlaces internos entre artículos.
- [ ] **Señales externas:** página de empresa en LinkedIn, artículos del fundador que citen Insights, asociaciones y directorios del sector, y enlaces desde clientes e instituciones.

**Verificación:** informe mensual de Search Console con consultas nuevas, páginas con más impresiones y clics hacia contacto.

---

## 5. Seguimiento

| Frecuencia | Qué se revisa |
|---|---|
| Semanal (primer mes) | Errores de cobertura e indexación en Search Console |
| Mensual | Consultas, impresiones, CTR y páginas de entrada; ajustar el calendario editorial |
| Trimestral | Core Web Vitals, términos objetivo y qué servicios necesitan página propia |

**Qué esperar:** los cambios de las fases 0 a 3 se notan en semanas, a medida que Google vuelve a rastrear el sitio. El posicionamiento en temas técnicos llega con la Fase 4 y suele tomar de 3 a 6 meses de publicación constante.

---

## 6. Preguntas abiertas

- [ ] **¿Queremos aparecer en respuestas de asistentes de IA?** El `robots.txt` que administra Cloudflare bloquea a GPTBot, ClaudeBot, Google-Extended y otros. Eso evita que usen el contenido para entrenar modelos, pero también reduce la probabilidad de que el sitio aparezca citado en sus respuestas.
- [ ] **¿Habrá versión en inglés?** El CMS ya está preparado (`LOCALIZACION_ACTIVA` en `lib/localizacion.ts`). Si se activa, hay que agregar `hreflang` y rutas por idioma. Conviene decidirlo **antes de la Fase 1** para no rehacer las URLs.
- [ ] **¿Hay oficina que atienda público?** Si la hay, conviene crear un perfil de Google Business. Si no, basta con `areaServed`.
- [ ] **¿El repositorio de GitHub debe ser público?** En la búsqueda de prueba por la marca apareció en lugar del sitio.
