/**
 * Prepara la BD para correr la app (local o server de deploy).
 *
 * NO copia la semilla vieja a ciegas: crea el esquema actual desde cero
 * y despues puebla con seed.ts. Asi aparecen tablas nuevas
 * (quienes_somos, correos, etc.).
 *
 *   npm run db:prepare
 */
import { existsSync, rmSync } from 'fs'
import { spawnSync } from 'child_process'
import { createClient } from '@libsql/client'
import { getPayload } from 'payload'
import config from '@payload-config'

const VIVA = process.env.DB_FILE ?? 'aquabioprocess.db'

const TABLAS_CRITICAS = [
  'configuracion_sitio',
  'configuracion_sitio_correos',
  'paginas',
  'paginas_blocks_quienes_somos',
  'paginas_blocks_pasos',
  'paginas_blocks_sectores',
]

function borrarViva() {
  for (const sufijo of ['', '-wal', '-shm']) {
    const f = `${VIVA}${sufijo}`
    if (existsSync(f)) rmSync(f)
  }
}

async function verificarTablas() {
  const db = createClient({ url: `file:${VIVA}` })
  const faltan: string[] = []
  for (const nombre of TABLAS_CRITICAS) {
    const r = await db.execute({
      sql: `SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = ?`,
      args: [nombre],
    })
    if (!r.rows.length) faltan.push(nombre)
  }
  db.close()
  if (faltan.length) {
    throw new Error(`Faltan tablas: ${faltan.join(', ')}`)
  }
}

async function main() {
  console.log('1/3 BD vacia + esquema actual...')
  borrarViva()
  const payload = await getPayload({ config })
  await payload.findGlobal({ slug: 'configuracion-sitio', overrideAccess: true })
  console.log('1/3 Esquema OK')

  console.log('2/3 Contenido (seed.ts --force)...')
  const r = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--env-file=.env', 'scripts/seed.ts', '--force'],
    {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development', CI: 'true' },
    },
  )
  if (r.status !== 0) process.exit(r.status ?? 1)

  console.log('3/3 Verificando tablas...')
  await verificarTablas()
  console.log('Listo. BD preparada.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
