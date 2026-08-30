/**
 * Arranca Payload en development para alinear el esquema SQLite al codigo.
 * Uso en el server (una vez, antes del build):
 *
 *   npm run db:sync
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
await payload.findGlobal({ slug: 'configuracion-sitio' })
console.log('Esquema al dia.')
process.exit(0)
