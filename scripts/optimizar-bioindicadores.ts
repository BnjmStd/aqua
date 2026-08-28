import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

/**
 * Optimiza la seleccion de microscopia de lodo activado (carpeta docs/) hacia
 * public/ con el prefijo `bioindicador-`. Conservador: reorienta por EXIF,
 * redimensiona y comprime, sin tocar color (el tinte de brightfield puede ser
 * diagnostico). Los archivos resultantes los sube scripts/seed.ts a Media.
 *
 *   npx tsx scripts/optimizar-bioindicadores.ts
 */

const RAIZ = process.cwd()
const ORIGEN = path.join(RAIZ, 'docs', 'IMAGENES WEBPAGE AQUABIOPROCESS', 'bacterias')
const DESTINO = path.join(RAIZ, 'public')

const SELECCION: { archivo: string; slug: string }[] = [
  { archivo: '5 Activated sludge microscopy floc protozoaSalida aireación.jpg', slug: 'floculo-sano' },
  { archivo: '5 Activated sludge microscopy floc protozoaOpercularia-Colonia 30.JPG', slug: 'ciliados-pedunculados' },
  { archivo: '5 Activated sludge microscopy floc protozoaRotifero-Rotaria 4.JPG', slug: 'rotifero' },
  { archivo: '5 Activated sludge microscopy floc protozoaAmeba-Arcella 1.jpg', slug: 'ameba-testacea' },
  { archivo: '5 Activated sludge microscopy floc protozoaGastrotrichia-Chaetonotus 12.JPG', slug: 'gastrotrico' },
  { archivo: '5 Activated sludge microscopy floc protozoaHongos-Hifas 12.JPG', slug: 'bacterias-filamentosas' },
  { archivo: '5 Activated sludge microscopy floc protozoa Punto 1 aireación.jpg', slug: 'crecimiento-disperso' },
]

async function main() {
  await mkdir(DESTINO, { recursive: true })

  for (const { archivo, slug } of SELECCION) {
    const nombre = `bioindicador-${slug}.jpg`
    await sharp(path.join(ORIGEN, archivo))
      .rotate() // respeta la orientacion EXIF
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(path.join(DESTINO, nombre))
    console.log(`  ${nombre}`)
  }

  console.log('bioindicadores: listo')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
