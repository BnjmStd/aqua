import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { exigirCuenta } from '@/lib/auth'
import { FormularioDatos, FormularioPassword } from './formularios'

export default async function MisDatosPage() {
  const cuenta = await exigirCuenta('/cuenta/datos')

  return (
    <div>
      <Heading level={2}>Mis datos</Heading>
      <Text tone="muted" className="mt-2">
        Los usamos para prellenar tus inscripciones y para contactarte.
      </Text>

      <Card className="mt-8 hover:shadow-soft">
        <Heading level={4} as="h3">
          Datos personales
        </Heading>
        <FormularioDatos
          email={cuenta.email}
          inicial={{ nombre: cuenta.nombre, telefono: cuenta.telefono ?? '', rut: cuenta.rut ?? '' }}
        />
      </Card>

      <Card className="mt-6 hover:shadow-soft">
        <Heading level={4} as="h3">
          Contraseña
        </Heading>
        <FormularioPassword email={cuenta.email} />
      </Card>
    </div>
  )
}
