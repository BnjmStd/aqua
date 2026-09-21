import type { AdaptadorCanal } from '../tipos'

/**
 * Canal de desarrollo: imprime el mensaje en la terminal en vez de enviarlo.
 * Es el que se usa mientras no haya credenciales del proveedor real, para
 * poder probar el flujo completo sin mandarle correos a nadie.
 */
export const canalConsola = (id: AdaptadorCanal['id']): AdaptadorCanal => ({
  id,
  nombre: `${id} (consola)`,
  enviar: async ({ destino, contenido, req }) => {
    const correo = contenido.email
    const lineas = [
      `─── ${id.toUpperCase()} → ${destino} ─────────────────────────`,
      correo ? `Asunto: ${correo.asunto}` : `Aviso: ${contenido.inApp.titulo}`,
      correo ? correo.titulo : '',
      ...(correo ? correo.parrafos : [contenido.inApp.cuerpo ?? '']),
      correo?.accion ? `→ ${correo.accion.texto}: ${correo.accion.url}` : '',
      '───────────────────────────────────────────────────────────',
    ].filter(Boolean)

    req.payload.logger.info(`\n${lineas.join('\n')}`)
    return { idProveedor: `consola-${Date.now()}` }
  },
})
