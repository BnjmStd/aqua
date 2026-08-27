import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Crea (o reajusta) un usuario del panel de Payload con rol `admin`.
 *
 * Uso:
 *   npm run crear-admin -- --email a@b.cl --password "secreta123" --nombre "Nombre"
 *   npm run crear-admin              # toma ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NOMBRE del entorno
 *
 * Si el email ya existe, no se pisa nada salvo que pases --reset, que
 * actualiza la contrasena y fuerza rol admin.
 *
 * Corre con `tsx --env-file=.env` (ver el script "crear-admin" del
 * package.json): tsx resuelve el alias @payload-config del tsconfig y
 * --env-file carga PAYLOAD_SECRET y DATABASE_URI.
 */

function leerArg(nombre: string): string | undefined {
  const prefijo = `--${nombre}=`
  const conIgual = process.argv.find((a) => a.startsWith(prefijo))
  if (conIgual) return conIgual.slice(prefijo.length)
  const i = process.argv.indexOf(`--${nombre}`)
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1]
  }
  return undefined
}

const tieneFlag = (nombre: string) => process.argv.includes(`--${nombre}`)

async function main() {
  const email = (leerArg('email') ?? process.env.ADMIN_EMAIL)?.trim().toLowerCase()
  const password = leerArg('password') ?? process.env.ADMIN_PASSWORD
  const nombre = leerArg('nombre') ?? process.env.ADMIN_NOMBRE ?? 'Administrador'
  const reset = tieneFlag('reset')

  if (!email || !password) {
    console.error(
      'Falta --email o --password (o las variables ADMIN_EMAIL / ADMIN_PASSWORD).\n' +
        'Ejemplo: npm run crear-admin -- --email tu@correo.cl --password "unaClaveLarga"',
    )
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('La contrasena debe tener al menos 8 caracteres.')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  const existentes = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  })
  const existente = existentes.docs[0]

  if (existente) {
    if (!reset) {
      console.error(
        `Ya existe un usuario con ${email}. Usa --reset para actualizar su contrasena y dejarlo como admin.`,
      )
      process.exit(1)
    }
    await payload.update({
      collection: 'users',
      id: existente.id,
      data: { password, rol: 'admin' },
      overrideAccess: true,
    })
    console.log(`Actualizado: ${email} (rol admin, contrasena nueva).`)
  } else {
    await payload.create({
      collection: 'users',
      data: { email, password, nombre, rol: 'admin' },
      overrideAccess: true,
    })
    console.log(`Creado: ${email} (rol admin).`)
  }

  console.log('Entra en /admin con ese correo y contrasena.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
