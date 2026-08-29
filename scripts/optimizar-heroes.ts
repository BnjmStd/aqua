import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

/**
 * Prepara las imagenes de fondo de las portadas (bloque hero / HeroBanner)
 * hacia public/. Se muestran al 40% de opacidad bajo un degradado navy, asi
 * que priorizan textura sobre nitidez: se reorientan por EXIF, se llevan a
 * ~2000 px de ancho y se comprimen. Sin recorte (lo hace object-cover).
 *
 *   npx tsx scripts/optimizar-heroes.ts
 *
 * hero-consulting.jpg la sube scripts/seed.ts a Media y la enchufa como
 * `imagenFondo` del hero de la pagina Consulting. hero-academy.jpg la
 * referencia directo app/(frontend)/academy/page.tsx (esa pagina no viene
 * del CMS).
 */

const RAIZ = process.cwd()
const ORIGEN = path.join(RAIZ, 'docs', 'IMAGENES WEBPAGE AQUABIOPROCESS', 'aireacion')
const DESTINO = path.join(RAIZ, 'public')

const SELECCION: { archivo: string; nombre: string }[] = [
  { archivo: '4.4 Aireacion.jpg', nombre: 'hero-consulting.jpg' },
  { archivo: '4.8 Aireacion.JPG', nombre: 'hero-academy.jpg' },
]

async function main() {
  await mkdir(DESTINO, { recursive: true })

  for (const { archivo, nombre } of SELECCION) {
    await sharp(path.join(ORIGEN, archivo))
      .rotate() // respeta la orientacion EXIF
      .resize({ width: 2000, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(path.join(DESTINO, nombre))
    console.log(`  ${nombre}`)
  }

  console.log('heroes: listo')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
