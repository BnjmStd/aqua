import { AbrirCorreo } from '@/components/contacto/AbrirCorreo'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'

export default async function SolicitudConsultingPage() {
  const sitio = await obtenerConfiguracionSitio()
  return <AbrirCorreo href={rutaContacto(correoParaMotivo(sitio), 'consultoria')} />
}
