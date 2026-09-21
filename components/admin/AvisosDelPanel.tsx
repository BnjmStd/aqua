import type { ServerProps } from 'payload'

/**
 * Campana del equipo, arriba a la derecha del panel de Payload
 * (`admin.components.actions` en payload.config.ts).
 *
 * Es un Server Component: cuenta los avisos sin leer del usuario en cada
 * carga de pagina. Sin sondeo ni estado en el cliente — para el equipo basta,
 * y evita traerse Tailwind (el panel tiene su propio CSS) a este componente.
 */
export async function AvisosDelPanel({ payload, user }: ServerProps) {
  if (!user || user.collection !== 'users') return null

  const { totalDocs } = await payload.count({
    collection: 'notificaciones',
    where: {
      and: [
        { 'destinatario.value': { equals: user.id } },
        { 'destinatario.relationTo': { equals: 'users' } },
        { leidaEl: { exists: false } },
      ],
    },
  })

  const sinLeer = totalDocs > 0
  const enlace = `/admin/collections/notificaciones?limit=25&sort=-createdAt${sinLeer ? '&where[leidaEl][exists]=false' : ''}`

  return (
    <a
      href={enlace}
      title={sinLeer ? `${totalDocs} avisos sin leer` : 'Notificaciones'}
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        gap: '.4rem',
        padding: '.35rem .6rem',
        borderRadius: '9999px',
        border: '1px solid var(--theme-elevation-150)',
        background: sinLeer ? 'var(--theme-success-100, #e6f4ea)' : 'transparent',
        color: 'var(--theme-elevation-800)',
        fontSize: '.8rem',
        textDecoration: 'none',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5M13.7 19a2 2 0 0 1-3.4 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {sinLeer ? <strong>{totalDocs}</strong> : null}
      <span>{sinLeer ? 'sin leer' : 'Avisos'}</span>
    </a>
  )
}
