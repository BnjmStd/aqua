/**
 * Arranca Payload en development para alinear el esquema SQLite al codigo.
 *
 *   npm run db:sync
 *
 * CI=true evita que drizzle-kit se quede esperando confirmacion en la terminal.
 */
process.env.NODE_ENV = 'development'
process.env.CI = 'true'

import { getPayload } from 'payload'
import config from '@payload-config'

console.log('Sincronizando esquema (puede tardar 1-2 min)...')
const payload = await getPayload({ config })
await payload.findGlobal({ slug: 'configuracion-sitio' })
console.log('Esquema al dia.')
process.exit(0)
