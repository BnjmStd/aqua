import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { SALUD_DEL_LODO } from '@/content/newsletter-salud-del-lodo'
import { cn } from '@/lib/cn'

const data = SALUD_DEL_LODO

/** Infografia del PDF: siempre completa, sin redondeo ni object-cover. */
function Infografia({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
}) {
  return (
    <div className={cn('border border-border bg-white shadow-sm', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full object-contain"
        sizes="(min-width: 1024px) 64rem, 100vw"
        priority={priority}
      />
    </div>
  )
}

/**
 * Layout editorial cercano al PDF de la edicion 01.
 * Las lineas Academy / Insights / Technologies son sellos de marca de la
 * pieza (no items de navegacion). El newsletter vive bajo Insights.
 */
export function EdicionSaludDelLodo({
  numero,
  fechaEnvio,
}: {
  numero: number
  fechaEnvio?: string | null
}) {
  return (
    <article>
      <div className="border-b border-brand-200 bg-navy-950 text-white">
        <Container className="py-8 sm:py-10">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
            <span>AquaBioProcess</span>
            {data.lineas.map((linea) => (
              <span
                key={linea}
                className="rounded-full border border-brand-400/40 bg-navy-900 px-2.5 py-0.5 text-brand-200"
              >
                {linea}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-navy-300">
            Newsletter técnico · Edición {String(numero).padStart(2, '0')}
            {fechaEnvio
              ? ` · ${new Date(fechaEnvio).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                })}`
              : ' · 2026'}
          </p>
          <Heading level={1} className="mt-3 text-white">
            {data.titulo}
          </Heading>
          <Text tone="lead" className="mt-3 max-w-2xl text-navy-100">
            {data.bajada}
          </Text>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-300">{data.intro}</p>
        </Container>
      </div>

      <Container className="max-w-5xl py-12 sm:py-16">
        <section>
          <Heading level={2}>{data.vision.titulo}</Heading>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/75 md:text-base">
            {data.vision.texto}
          </p>
          <div className="mt-6 max-w-3xl rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
              {data.definicion.titulo}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{data.definicion.texto}</p>
          </div>
        </section>

        <section className="mt-16">
          <Heading level={2}>Las 8 dimensiones de la Salud del Lodo</Heading>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.dimensiones.map((item, i) => (
              <div
                key={item.titulo}
                className={cn(
                  'rounded-xl border p-4 shadow-sm',
                  i % 2 === 0
                    ? 'border-brand-200 bg-brand-50'
                    : 'border-navy-200 bg-navy-50',
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-serif text-lg font-semibold text-navy-900">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{item.detalle}</p>
              </div>
            ))}
          </div>
        </section>

        <Infografia
          className="mt-12"
          src={data.imagenInteraccion.src}
          alt={data.imagenInteraccion.alt}
          width={data.imagenInteraccion.width}
          height={data.imagenInteraccion.height}
        />

        <section className="mt-16">
          <Heading level={2}>{data.diagnostico.titulo}</Heading>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/75 md:text-base">
            {data.diagnostico.intro}
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="font-serif text-xl font-semibold text-navy-900">
                Microscopía + sedimentación
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/75">
                {data.diagnostico.microscopia.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-brand-200 bg-brand-50 p-6">
              <h3 className="font-serif text-xl font-semibold text-navy-900">
                Signos vitales de la biomasa
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {data.diagnostico.signos.map((item) => (
                  <div key={item.titulo} className="rounded-lg bg-white/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                      {item.titulo}
                    </p>
                    <p className="mt-1 text-sm text-foreground/75">{item.detalle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 rounded-xl border-l-4 border-brand-500 bg-navy-950 px-5 py-4 text-sm leading-relaxed text-navy-100">
            <span className="font-semibold text-brand-300">Clave: </span>
            {data.diagnostico.clave}
          </p>
        </section>

        <section className="mt-16">
          <Heading level={2}>Afluente → biomasa → efluente</Heading>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/75">
            La salud biológica resulta de la interacción entre calidad de alimentación, diseño,
            equipos, operación y capacidad de recuperación. El diagnóstico cambia según la
            tecnología.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.tecnologias.map((item) => (
              <div
                key={item.titulo}
                className="rounded-xl border border-navy-200 bg-gradient-to-br from-navy-50 to-brand-50 p-5"
              >
                <h3 className="font-serif text-lg font-semibold text-navy-900">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{item.detalle}</p>
              </div>
            ))}
          </div>
        </section>

        <Infografia
          className="mt-12"
          src={data.imagenSoporte.src}
          alt={data.imagenSoporte.alt}
          width={data.imagenSoporte.width}
          height={data.imagenSoporte.height}
        />

        <section className="mt-12 rounded-xl bg-navy-950 px-6 py-8 text-white sm:px-8">
          <h2 className="font-serif text-2xl font-semibold">{data.soporte.titulo}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-navy-200">{data.soporte.texto}</p>
          <p className="mt-8 text-sm text-brand-300">{data.cierre}</p>
        </section>
      </Container>
    </article>
  )
}
