import { construirUrlWhatsapp, obtenerConfiguracionWhatsapp } from '@/lib/whatsapp'

export async function WhatsAppFlotante() {
  const configuracion = await obtenerConfiguracionWhatsapp()

  if (!configuracion) return null

  const url = construirUrlWhatsapp(configuracion.numero, configuracion.mensajePorDefecto)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform motion-safe:hover:scale-110"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
        <path d="M16.001 3C9.11 3 3.5 8.611 3.5 15.5c0 2.31.63 4.474 1.727 6.332L3 29l7.353-2.183A12.46 12.46 0 0 0 16.001 28C22.892 28 28.5 22.39 28.5 15.5S22.892 3 16.001 3Zm0 22.6a10.06 10.06 0 0 1-5.14-1.41l-.369-.219-4.365 1.296 1.318-4.255-.24-.379a10.06 10.06 0 0 1-1.554-5.383c0-5.577 4.535-10.112 10.35-10.112 5.814 0 10.349 4.535 10.349 10.112 0 5.578-4.535 10.35-10.349 10.35Zm5.674-7.647c-.31-.156-1.834-.905-2.119-1.009-.284-.104-.492-.156-.699.156-.207.311-.802 1.009-.984 1.216-.181.207-.362.233-.673.078-.31-.156-1.31-.483-2.496-1.54-.923-.823-1.546-1.84-1.727-2.15-.181-.312-.019-.48.137-.635.14-.14.311-.363.466-.545.155-.181.207-.311.31-.518.104-.207.052-.389-.026-.545-.078-.156-.699-1.684-.958-2.306-.253-.607-.51-.525-.699-.535-.181-.008-.388-.01-.596-.01-.207 0-.545.078-.83.39-.284.311-1.086 1.06-1.086 2.587s1.112 3.001 1.267 3.208c.156.207 2.19 3.343 5.306 4.688.741.32 1.32.512 1.771.655.744.237 1.42.203 1.955.123.596-.089 1.834-.75 2.093-1.474.259-.725.259-1.346.181-1.474-.078-.13-.284-.207-.596-.363Z"/>
      </svg>
    </a>
  )
}
