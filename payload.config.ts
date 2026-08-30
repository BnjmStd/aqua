import path from "path";
import { fileURLToPath } from "url";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

// Transversal
import { Categorias } from "./collections/Categorias";
import { Clientes } from "./collections/Clientes";
import { Cuentas } from "./collections/Cuentas";
import { Media } from "./collections/Media";
import { Paginas } from "./collections/Paginas";
import { Personas } from "./collections/Personas";
import { Testimonios } from "./collections/Testimonios";
import { Users } from "./collections/Users";
// Consulting
import { Bioindicadores } from "./collections/consulting/Bioindicadores";
import { Casos } from "./collections/consulting/Casos";
import { Servicios } from "./collections/consulting/Servicios";
import { SolicitudesConsulting } from "./collections/consulting/SolicitudesConsulting";
// Academy
import { Convocatorias } from "./collections/academy/Convocatorias";
import { Cursos } from "./collections/academy/Cursos";
import { Inscripciones } from "./collections/academy/Inscripciones";
import { Objetivos } from "./collections/academy/Objetivos";
// Technologies
import { Partners } from "./collections/technologies/Partners";
import { Tecnologias } from "./collections/technologies/Tecnologias";
// Insights
import { Articulos } from "./collections/insights/Articulos";
import { NewsletterEdiciones } from "./collections/insights/NewsletterEdiciones";
import { Suscriptores } from "./collections/insights/Suscriptores";
// R&D
import { Proyectos } from "./collections/rnd/Proyectos";
import { Publicaciones } from "./collections/rnd/Publicaciones";
// Globals
import { ConfiguracionSitio } from "./globals/ConfiguracionSitio";
import { Navegacion } from "./globals/Navegacion";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * URL publica del sitio. Payload la usa para los enlaces de los correos
 * (confirmacion de newsletter, recuperar contrasena) y como base de las
 * listas blancas de CORS y CSRF de mas abajo.
 */
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export default buildConfig({
    serverURL,

    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
        meta: {
            titleSuffix: " — aquabioprocess.cl",
        },
    },

    collections: [
        // Transversal
        Paginas,
        Personas,
        Clientes,
        Testimonios,
        Categorias,
        // Consulting
        Servicios,
        Casos,
        Bioindicadores,
        SolicitudesConsulting,
        // Academy
        Cursos,
        Objetivos,
        Convocatorias,
        Inscripciones,
        // Technologies
        Partners,
        Tecnologias,
        // Insights
        Articulos,
        NewsletterEdiciones,
        Suscriptores,
        // R&D
        Proyectos,
        Publicaciones,
        // Sistema
        Media,
        Users,
        Cuentas,
    ],

    globals: [ConfiguracionSitio, Navegacion],

    editor: lexicalEditor(),

    /**
     * CSRF — lista blanca de origenes desde los que se aceptan cookies de
     * Payload. Sin esto, otro sitio podria intentar operar la API montado
     * sobre la sesion abierta de un administrador.
     */
    csrf: [serverURL],

    /**
     * CORS — solo el propio sitio. Nunca '*' en un proyecto con panel:
     * abriria la API autenticada a cualquier origen.
     */
    cors: [serverURL],

    /**
     * GraphQL apagado: el frontend consulta con la Local API de Payload
     * (`payload.find()`) directo desde los Server Components, sin pasar por
     * HTTP. Manteniendolo activo solo se sumaba superficie de ataque.
     * Para reactivarlo, borrar este bloque y restaurar las rutas en (payload).
     */
    graphQL: {
        disable: true,
    },

    /**
     * Profundidad de poblado de relaciones. El limite superior evita que
     * alguien pida `?depth=50` en la API publica y arrastre media base en
     * una sola consulta.
     */
    defaultDepth: 1,
    maxDepth: 4,

    /** Sin telemetria hacia Payload. */
    telemetry: false,

    i18n: {
        fallbackLanguage: "es",
    },

    /**
     * LOCALIZACION — apagada por ahora (el sitio es solo espanol).
     *
     * Los campos traducibles ya estan marcados con `traducible()` en todo el
     * codebase. Para activar ingles:
     *   1. `LOCALIZACION_ACTIVA = true` en lib/localizacion.ts
     *   2. Descomentar este bloque
     *   3. `npx payload migrate:create` y revisar la migracion
     *
     * localization: {
     *   locales: [
     *     { label: 'Espanol', code: 'es' },
     *     { label: 'English', code: 'en' },
     *   ],
     *   defaultLocale: 'es',
     *   fallback: true,
     * },
     */

    /**
     * Jobs queue. Sin esto, "programar publicacion" se guarda pero nunca se
     * ejecuta: el job queda encolado y nadie lo corre.
     *
     * En produccion serverless (Vercel) el autoRun no sobrevive entre requests:
     * hay que llamar a /api/payload-jobs/run desde un cron externo.
     */
    jobs: {
        autoRun: [
            {
                cron: "*/5 * * * *",
                queue: "default",
                limit: 10,
            },
        ],
        shouldAutoRun: () => process.env.NODE_ENV !== "production",
    },

    secret: process.env.PAYLOAD_SECRET || "",

    typescript: {
        outputFile: path.resolve(dirname, "payload-types.ts"),
    },

    /**
     * Para migrar a Postgres mas adelante, este es el unico bloque que cambia:
     *   import { postgresAdapter } from '@payloadcms/db-postgres'
     *   db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })
     * Ambos adaptadores usan Drizzle y comparten el mismo mapeo de campos a columnas.
     */
    db: sqliteAdapter({
        client: {
            url: process.env.DATABASE_URI || "file:./aquabioprocess.db",
        },
        // Un solo proceso + SQLite: el esquema se alinea al codigo al arrancar
        // (build y start). Sin esto, `next build` en production no crea tablas
        // nuevas y explota al pre-renderizar /academy.
        push: true,
        // 'uuid' en vez de enteros autoincrementales: los IDs quedan portables
        // entre SQLite y Postgres, sin secuencias que reajustar al migrar.
        idType: "uuid",
    }),

    sharp,
    plugins: [],
});
