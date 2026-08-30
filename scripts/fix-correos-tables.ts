/**
 * Crea las tablas que faltan en la semilla vieja.
 * Uso en el server, DESPUES de db:seed:
 *
 *   npx tsx scripts/fix-correos-tables.ts
 */
import { createClient } from "@libsql/client";

const db = createClient({ url: "file:aquabioprocess.db" });

await db.execute(`
  CREATE TABLE IF NOT EXISTS configuracion_sitio_correos (
    id TEXT PRIMARY KEY NOT NULL,
    _order INTEGER NOT NULL,
    _parent_id TEXT NOT NULL,
    email TEXT NOT NULL,
    etiqueta TEXT
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS configuracion_sitio_redes (
    id TEXT PRIMARY KEY NOT NULL,
    _order INTEGER NOT NULL,
    _parent_id TEXT NOT NULL,
    plataforma TEXT NOT NULL,
    url TEXT NOT NULL
  )
`);

console.log("Tablas correos/redes OK");
process.exit(0);
