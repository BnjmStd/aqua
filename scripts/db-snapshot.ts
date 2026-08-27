import { copyFileSync, existsSync } from 'fs'

import { createClient } from '@libsql/client'

/**
 * Congela la BD de desarrollo actual como semilla versionada.
 *
 *   npm run db:snapshot
 *
 * `aquabioprocess.db` (viva, ignorada por git) -> `aquabioprocess.seed.db`
 * (committeada). Antes hace un checkpoint TRUNCATE del WAL para que todo
 * quede dentro del archivo principal y el snapshot sea un unico .db limpio.
 *
 * Regeneralo cuando cambien los datos base (paginas, configuracion del
 * sitio, admin). No incluye media: los archivos de /media no se versionan.
 */

const VIVA = process.env.DB_FILE ?? 'aquabioprocess.db'
const SEMILLA = 'aquabioprocess.seed.db'

async function main() {
  if (!existsSync(VIVA)) {
    console.error(`No existe ${VIVA}. Levanta el panel una vez para crearla.`)
    process.exit(1)
  }

  const client = createClient({ url: `file:${VIVA}` })
  await client.execute('PRAGMA wal_checkpoint(TRUNCATE)')
  client.close()

  copyFileSync(VIVA, SEMILLA)
  console.log(`Snapshot: ${VIVA} -> ${SEMILLA}`)
  console.log('Revisa el diff y commitealo.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
