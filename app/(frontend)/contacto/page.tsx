import { AbrirCorreo } from '@/components/contacto/AbrirCorreo'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { urlMailto } from '@/lib/whatsapp'

/**
 * Fallback por si un enlace viejo del CMS todavia apunta aca.
 * Los botones nuevos usan mailto directo y no llegan a esta pagina.
 */
export default async function ContactoPage(props: PageProps<'/contacto'>) {
  const params = await props.searchParams
  const motivo = typeof params.motivo === 'string' ? params.motivo : 'general'
  const nombre = typeof params.nombre === 'string' ? params.nombre : undefined
  const sitio = await obtenerConfiguracionSitio()

  return <AbrirCorreo href={urlMailto(correoParaMotivo(sitio), motivo, { nombre })} />
}
