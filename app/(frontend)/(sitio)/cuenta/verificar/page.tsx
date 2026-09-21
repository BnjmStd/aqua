import Link from 'next/link'

import { BotonReenviarVerificacion } from '@/components/cuenta/BotonReenviarVerificacion'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { obtenerCuentaActual } from '@/lib/auth'
import { verificarCorreoConToken } from '../actions'

const MENSAJES = {
  ok: {
    titulo: '¡Listo! Tu correo quedó verificado',
    texto: 'Ya podemos avisarte de tus cursos, pagos y solicitudes.',
  },
  vencido: {
    titulo: 'El enlace venció',
    texto: 'Los enlaces duran 48 horas. Pide uno nuevo y revisa tu correo.',
  },
  invalido: {
    titulo: 'Este enlace no sirve',
    texto: 'Puede que ya lo hayas usado o que esté incompleto. Pide uno nuevo desde tu cuenta.',
  },
  sinToken: {
    titulo: 'Falta el enlace',
    texto: 'Abre el enlace que te enviamos por correo para confirmar tu dirección.',
  },
} as const

export default async function VerificarCorreoPage(props: PageProps<'/cuenta/verificar'>) {
  const { token } = await props.searchParams
  const resultado = typeof token === 'string' && token ? await verificarCorreoConToken(token) : 'sinToken'
  const { titulo, texto } = MENSAJES[resultado]
  const cuenta = await obtenerCuentaActual()

  return (
    <Section>
      <Container className="max-w-md text-center">
        <Heading level={2}>{titulo}</Heading>
        <Text tone="muted" className="mt-3">
          {texto}
        </Text>

        <div className="mt-8 flex flex-col items-center gap-3">
          {resultado === 'ok' ? (
            <Button href={cuenta ? '/cuenta' : '/cuenta/ingresar'} size="lg">
              {cuenta ? 'Ir a mi cuenta' : 'Ingresar'}
            </Button>
          ) : cuenta ? (
            <BotonReenviarVerificacion />
          ) : (
            <>
              <Button href="/cuenta/ingresar" size="lg">
                Ingresar para pedir otro
              </Button>
              <Text tone="muted">
                ¿No tienes cuenta?{' '}
                <Link href="/cuenta/registro" className="text-brand-700 underline">
                  Regístrate
                </Link>
                .
              </Text>
            </>
          )}
        </div>
      </Container>
    </Section>
  )
}
