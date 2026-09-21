/**
 * URL de reproductor embebible para una grabacion, segun el enlace que se
 * pego en el recurso. El proveedor NO se configura en ningun lado: se deduce
 * de cada URL, asi que se pueden mezclar (videos viejos en YouTube, nuevos en
 * Vimeo) y cambiar de proveedor es solo cambiar el enlace del recurso.
 *
 * Devuelve null si el servicio no se reconoce: el aula lo muestra como enlace
 * normal en vez de romperse. Para sumar un proveedor, agregar un caso aca.
 */
export function urlEmbebible(enlace: string): string | null {
  let url: URL
  try {
    url = new URL(enlace)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m)\./, '')

  // YouTube: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /live/ID, /shorts/ID
  if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id =
      host === 'youtu.be'
        ? url.pathname.split('/')[1]
        : (url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|live|shorts)\/([\w-]+)/)?.[1])
    if (!id || !/^[\w-]{6,}$/.test(id)) return null
    // nocookie: YouTube no pone cookies de seguimiento hasta que se reproduce.
    const embebido = new URL(`https://www.youtube-nocookie.com/embed/${id}`)
    embebido.searchParams.set('rel', '0') // al terminar, sugerencias solo del mismo canal
    const inicio = segundosDeInicio(url.searchParams.get('t') ?? url.searchParams.get('start'))
    if (inicio) embebido.searchParams.set('start', String(inicio))
    return embebido.toString()
  }

  // Vimeo: vimeo.com/ID, vimeo.com/ID/HASH (video privado), player.vimeo.com/video/ID
  if (host === 'vimeo.com') {
    const [, id, hash] = url.pathname.match(/^\/(\d+)(?:\/([\w]+))?/) ?? []
    if (!id) return null
    return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}`
  }
  if (host === 'player.vimeo.com') return enlace

  // Google Drive: drive.google.com/file/d/ID/view -> /preview
  if (host === 'drive.google.com') {
    const id = url.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] ?? url.searchParams.get('id')
    return id ? `https://drive.google.com/file/d/${id}/preview` : null
  }

  return null
}

/** `t=90`, `t=90s` o `t=1m30s` -> 90. */
function segundosDeInicio(valor: string | null): number | null {
  if (!valor) return null
  if (/^\d+s?$/.test(valor)) return Number.parseInt(valor, 10)
  const [, h, m, s] = valor.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/) ?? []
  const total = Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0)
  return total || null
}
