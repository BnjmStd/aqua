import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const enProduccion = process.env.NODE_ENV === "production";

/**
 * Cabeceras de seguridad aplicadas a todo el sitio.
 *
 * Van en next.config y no en proxy.ts a proposito: son estaticas, no
 * dependen del request, y aca las aplica el servidor sin ejecutar
 * JavaScript por cada visita.
 *
 * Falta una Content-Security-Policy. No la agrego a ciegas: el panel de
 * Payload necesita reglas propias y una CSP mal calibrada lo rompe entero.
 * Conviene definirla cuando exista el frontend real, con dominios concretos.
 */
const cabecerasDeSeguridad = [
  // Impide que el navegador adivine el tipo de archivo, vector clasico de XSS.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nadie puede montar el sitio dentro de un iframe (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // No filtrar la URL completa al navegar hacia otros dominios.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva APIs del navegador que el sitio no usa.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // HSTS solo en produccion: en localhost forzaria HTTPS y romperia el dev.
  ...(enProduccion
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // No anunciar que el sitio corre sobre Next.js.
  poweredByHeader: false,

  // Por si algo corre en modo dev detrás del dominio real.
  allowedDevOrigins: [
    "aquabioprocess.cl",
    "www.aquabioprocess.cl",
    "https://aquabioprocess.cl",
    "https://www.aquabioprocess.cl",
  ],

  images: {
    // El optimizador solo toca imagenes locales de estas rutas.
    // - /api/media/file/**: archivos de Payload. Sin `search` para dejar
    //   pasar el `?v=<updatedAt>` que agrega collections/Media.ts (necesario
    //   para invalidar cache cuando se reemplaza un archivo con el mismo
    //   nombre). La ruta ya esta acotada a nuestro endpoint de media.
    // - /**: assets estaticos de /public, siempre sin query string.
    localPatterns: [
      { pathname: "/api/media/file/**" },
      { pathname: "/**", search: "" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: cabecerasDeSeguridad,
      },
      {
        // El panel y la API no deben aparecer en buscadores.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
