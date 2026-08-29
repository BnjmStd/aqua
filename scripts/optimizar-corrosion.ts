import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

/**
 * Optimiza la seleccion de fotos de terreno de corrosion (carpeta docs/) hacia
 * public/ con el prefijo `corrosion-`. Mismo criterio conservador que
 * scripts/optimizar-bioindicadores.ts: reorienta por EXIF, redimensiona y
 * comprime, sin recortes ni ajustes de color. scripts/seed.ts las sube a Media
 * y arma el articulo de Insights.
 *
 *   npx tsx scripts/optimizar-corrosion.ts
 */

const RAIZ = process.cwd()
const ORIGEN = path.join(RAIZ, 'docs', 'IMAGENES WEBPAGE AQUABIOPROCESS', 'mantencion')
const DESTINO = path.join(RAIZ, 'public')

const SELECCION: { archivo: string; slug: string }[] = [
  { archivo: '10.1 Ingenieria Mantencion Corrosion.jpg', slug: 'estructura-consumida' },
  { archivo: '10.2 Ingenieria Mantencion Corrosion.jpg', slug: 'fuga-en-union' },
  { archivo: '10.5 Ingenieria Mantencion Corrosion.jpg', slug: 'ampollas-recubrimiento' },
  { archivo: '10.3 Ingenieria Mantencion Corrosion.jpg', slug: 'zona-de-dificil-acceso' },
  { archivo: '10.4 Ingenieria Mantencion Corrosion.jpg', slug: 'inspeccion-soldadura' },
]

async function main() {
  await mkdir(DESTINO, { recursive: true })

  for (const { archivo, slug } of SELECCION) {
    const nombre = `corrosion-${slug}.jpg`
    await sharp(path.join(ORIGEN, archivo))
      .rotate() // respeta la orientacion EXIF
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(path.join(DESTINO, nombre))
    console.log(`  ${nombre}`)
  }

  console.log('corrosion: listo')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
