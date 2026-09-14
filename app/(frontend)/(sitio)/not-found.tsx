import { PantallaError } from '@/components/errores/PantallaError'
import { Button } from '@/components/ui/Button'

/**
 * 404 del sitio. Cubre dos casos: las paginas que llaman a `notFound()` (un
 * articulo o curso que no existe) y cualquier URL sin ruta, que llega aca a
 * traves de [...ruta]/page.tsx.
 */
export default function NoEncontrada() {
  return (
    <>
      <title>Página no encontrada · aquabioprocess.cl</title>
      <PantallaError
        codigo="404"
        etiqueta="Error 404"
        titulo="No encontramos esta página"
        descripcion="Puede que el enlace esté roto o que la página se haya movido. Desde el inicio puedes llegar a todas nuestras unidades."
        acciones={
          <>
            <Button href="/" variant="navy">
              Volver al inicio
            </Button>
            <Button href="/insights" variant="secundario">
              Explorar Insights
            </Button>
          </>
        }
      />
    </>
  )
}
