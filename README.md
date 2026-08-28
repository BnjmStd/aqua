# aquabioprocess.cl

Sitio de Salinas Aquabioprocess Expert Consulting.
Next.js 16 + Payload CMS + SQLite (sin Docker).

## Puesta en marcha

```bash
npm install
cp .env.example .env        # y poné un PAYLOAD_SECRET real
npm run db:seed             # crea la BD local desde la semilla versionada
npm run dev
```

- Sitio: http://localhost:3000
- Panel: http://localhost:3000/admin (usuario admin de la semilla)

Si ya tenés una BD local y querés empezar de cero:

```bash
npm run db:seed -- --force  # descarta aquabioprocess.db y la vuelve a la semilla
```

## Comandos

| comando | qué hace |
| --- | --- |
| `npm run dev` | servidor de desarrollo |
| `npm run build` | build de producción |
| `npm run db:seed` | restaura `aquabioprocess.db` desde la semilla (no toca una BD existente) |
| `npm run db:seed -- --force` | descarta la BD local y la vuelve a la semilla |
| `npm run db:seed:contenido` | regenera el contenido base en la BD viva (`-- --force` reescribe páginas) |
| `npm run db:snapshot` | congela la BD viva actual como `aquabioprocess.seed.db` |
| `npm run generate:types` | regenera `payload-types.ts` tras cambiar una colección |

## Actualizar la semilla versionada

`aquabioprocess.db` es tu BD de trabajo (ignorada por git). `aquabioprocess.seed.db`
es la copia commiteada que usan los clones nuevos. Para sincronizarlas después de
cambiar contenido base:

```bash
npm run db:seed:contenido -- --force
npm run db:snapshot
git add aquabioprocess.seed.db media/
```
