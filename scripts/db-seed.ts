import { copyFileSync, existsSync, rmSync } from 'fs'

/**
 * Restaura la BD de desarrollo desde la semilla versionada.
 *
 *   npm run db:seed          # solo si no hay BD (arranque de un clon nuevo)
 *   npm run db:seed -- --force   # descarta la BD actual y vuelve a la semilla
 *
 * La semilla trae el admin, la configuracion del sitio y las paginas base
 * (inicio, consulting, fundador). Ver scripts/seed.ts para regenerarla.
 */

const VIVA = process.env.DB_FILE ?? 'aquabioprocess.db'
const SEMILLA = 'aquabioprocess.seed.db'
const force = process.argv.includes('--force')

if (!existsSync(SEMILLA)) {
  console.error(`No existe ${SEMILLA} en el repo.`)
  process.exit(1)
}

if (existsSync(VIVA) && !force) {
  console.log(`${VIVA} ya existe; no se toca. Usa --force para reemplazarla por la semilla.`)
  process.exit(0)
}

for (const sufijo of ['', '-wal', '-shm']) {
  const f = `${VIVA}${sufijo}`
  if (existsSync(f)) rmSync(f)
}

copyFileSync(SEMILLA, VIVA)
console.log(`BD restaurada desde ${SEMILLA}. Entra a /admin con el admin de la semilla.`)
