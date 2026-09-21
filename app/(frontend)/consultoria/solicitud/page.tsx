import { AbrirCorreo } from '@/components/contacto/AbrirCorreo'
import { correoParaMotivo, obtenerConfiguracionSitio } from '@/lib/sitio'
import { rutaContacto } from '@/lib/whatsapp'

type Props = {
  searchParams: Promise<{ nombre?: string; servicio?: string }>
}

export default async function SolicitudConsultingPage({ searchParams }: Props) {
  const sitio = await obtenerConfiguracionSitio()
  const params = await searchParams
  const nombre = params.nombre ?? params.servicio
  const href = nombre
    ? rutaContacto(correoParaMotivo(sitio), 'servicio', { nombre })
    : rutaContacto(correoParaMotivo(sitio), 'consultoria')
  return <AbrirCorreo href={href} />
}
