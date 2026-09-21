/** Error general del formulario (no atribuible a un campo). */
export function MensajeFormulario({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null

  return (
    <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {mensaje}
    </p>
  )
}
