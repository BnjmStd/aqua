import path from 'node:path'

import sharp from 'sharp'

/**
 * Optimiza el retrato del fundador (`docs/marca/fundador-retrato.jpeg`) hacia
 * `public/fundador.jpg`. El bloque `perfil` lo enmarca en 4:5, asi que basta
 * con reorientar por EXIF, acotar el ancho y comprimir. scripts/seed.ts lo
 * sube a Media.
 *
 *   npx tsx scripts/optimizar-fundador.ts
 *
 * Para cambiar la foto: reemplaza el archivo en docs/marca/, corre esto y
 * despues `npm run db:seed:contenido -- --force` + `npm run db:snapshot`.
 */

const RAIZ = process.cwd()
const ORIGEN = path.join(RAIZ, 'docs', 'marca', 'fundador-retrato.jpeg')
const DESTINO = path.join(RAIZ, 'public', 'fundador.jpg')

async function main() {
  await sharp(ORIGEN)
    .rotate() // respeta la orientacion EXIF
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(DESTINO)
  console.log('fundador: listo')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
