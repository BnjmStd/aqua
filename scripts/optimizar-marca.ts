import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

/** Envuelve un PNG en un contenedor .ico de una sola entrada (valido desde Vista). */
function pngAIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2) // tipo: icono
  header.writeUInt16LE(1, 4) // cantidad
  const entrada = Buffer.alloc(16)
  entrada.writeUInt8(size >= 256 ? 0 : size, 0)
  entrada.writeUInt8(size >= 256 ? 0 : size, 1)
  entrada.writeUInt16LE(1, 4) // planos
  entrada.writeUInt16LE(32, 6) // bits por pixel
  entrada.writeUInt32LE(png.length, 8)
  entrada.writeUInt32LE(header.length + entrada.length, 12)
  return Buffer.concat([header, entrada, png])
}

/**
 * Deriva los assets de marca a partir del master `docs/marca/logo_sin_fondo_2k.png`:
 *
 *   - public/logo.png            lockup completo, liviano, para el header
 *   - app/(frontend)/icon.png    simbolo (gota + hoja) para la pestaña
 *   - app/(frontend)/apple-icon.png
 *   - scripts/.tmp-favicon-*.png  intermedios para armar el .ico (los borra el caller)
 *
 * Correr con: npx tsx scripts/optimizar-marca.ts
 */

const RAIZ = process.cwd()
const MASTER = path.join(RAIZ, 'docs', 'marca', 'logo_sin_fondo_2k.png')
const APP = path.join(RAIZ, 'app')
// icon/apple-icon van en el grupo del frontend; favicon.ico solo funciona en
// la raiz de `app/` (Next no lo sirve desde un route group).
const FRONTEND = path.join(APP, '(frontend)')

// Recorte del simbolo dentro del master de 1942x809 (medido a ojo sobre la gota).
const SIMBOLO = { left: 28, top: 10, width: 545, height: 795 }

const transparente = { r: 0, g: 0, b: 0, alpha: 0 }

async function main() {
  await mkdir(path.join(RAIZ, 'public'), { recursive: true })

  // Header: mismo lockup, ~600px de ancho (cubre 3x del alto real en la barra).
  await sharp(MASTER)
    .resize({ width: 600, withoutEnlargement: true })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(RAIZ, 'public', 'logo.png'))

  const simbolo = () => sharp(MASTER).extract(SIMBOLO)

  // Favicon principal: simbolo centrado en un cuadrado transparente. 256px y
  // paleta alcanzan de sobra para el tamaño real de una pestaña.
  await simbolo()
    .resize(256, 256, { fit: 'contain', background: transparente })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(FRONTEND, 'icon.png'))

  // Apple touch icon: iOS ignora la transparencia, va sobre blanco.
  await simbolo()
    .resize(160, 160, { fit: 'contain', background: transparente })
    .flatten({ background: '#ffffff' })
    .extend({ top: 10, bottom: 10, left: 10, right: 10, background: '#ffffff' })
    .png()
    .toFile(path.join(FRONTEND, 'apple-icon.png'))

  // favicon.ico para clientes que piden /favicon.ico a pelo (un PNG de 48 dentro).
  const png48 = await simbolo()
    .resize(48, 48, { fit: 'contain', background: transparente })
    .png({ compressionLevel: 9 })
    .toBuffer()
  await writeFile(path.join(APP, 'favicon.ico'), pngAIco(png48, 48))

  console.log('marca: assets generados')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
