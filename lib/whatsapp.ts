import { obtenerPayload } from "./payload";

const WHATSAPP_URL_BASE = "https://wa.me";

export type MotivoWhatsapp =
    | "general"
    | "asesor"
    | "consultoria"
    | "fundador"
    | "cv"
    | "academy"
    | "curso"
    | "servicio";

export type ConfiguracionWhatsapp = {
    numero: string;
    mensajePorDefecto: string;
};

const MOTIVOS: readonly MotivoWhatsapp[] = [
    "general",
    "asesor",
    "consultoria",
    "fundador",
    "cv",
    "academy",
    "curso",
    "servicio",
];

export const MENSAJE_WHATSAPP_GENERAL =
    "Hola Dr. Salinas, le escribo desde aquabioprocess.cl. Me gustaría solicitar información sobre tratamiento de aguas o efluentes.";

const CIERRE = "\n\nSaludos cordiales.";

/** wa.me exige solo digitos (sin '+', espacios ni guiones). */
function normalizarNumero(numero: string): string {
    return numero.replace(/\D/g, "");
}

export function construirUrlWhatsapp(numero: string, mensaje: string): string {
    const parametros = new URLSearchParams({ text: mensaje });
    return `${WHATSAPP_URL_BASE}/${normalizarNumero(numero)}?${parametros.toString()}`;
}

export function esMotivoWhatsapp(
    valor: string | undefined,
): valor is MotivoWhatsapp {
    return valor != null && (MOTIVOS as readonly string[]).includes(valor);
}

/** Mailto al correo que venga del CMS (`correoParaMotivo`). */
export function rutaContacto(
    email: string,
    motivo: MotivoWhatsapp = "general",
    extra?: { nombre?: string },
): string {
    return urlMailto(email, motivo, extra);
}

/**
 * Convierte un `/contacto?motivo=` o `/consultoria/solicitud` viejo del CMS en
 * mailto. `/consulting/solicitud` es la misma ruta antes de pasar las URLs a
 * español; sigue guardada en bloques existentes.
 */
export function resolverMailto(href: string, email: string): string {
    if (
        href.startsWith("/consultoria/solicitud") ||
        href.startsWith("/consulting/solicitud")
    ) {
        const params = new URL(href, "http://localhost").searchParams;
        const nombre =
            params.get("nombre") ?? params.get("servicio") ?? undefined;
        return urlMailto(email, nombre ? "servicio" : "consultoria", {
            nombre,
        });
    }
    if (!href.startsWith("/contacto")) return href;
    const params = new URL(href, "http://localhost").searchParams;
    const motivo = params.get("motivo") ?? "general";
    const nombre = params.get("nombre") ?? undefined;
    return urlMailto(email, motivo, { nombre });
}

export function asuntoPorMotivo(
    motivo: string | undefined,
    extra?: { nombre?: string },
): string {
    const clave = esMotivoWhatsapp(motivo) ? motivo : "general";
    if (clave === "curso" && extra?.nombre) {
        return `Solicitud de información: ${extra.nombre} — AquaBioProcess Academy`;
    }
    if (clave === "servicio" && extra?.nombre) {
        return `Solicitud de información: ${extra.nombre} — AquaBioProcess Consulting`;
    }
    const asuntos: Record<MotivoWhatsapp, string> = {
        general: "Solicitud de información — AquaBioProcess",
        asesor: "Solicitud de información con un asesor — AquaBioProcess",
        consultoria: "Solicitud de información — AquaBioProcess Consulting",
        fundador: "Solicitud de información — Dr. Miguel Salinas",
        cv: "Solicitud de CV técnico — Dr. Miguel Salinas",
        academy: "Solicitud de información — AquaBioProcess Academy",
        curso: "Solicitud de información — AquaBioProcess Academy",
        servicio: "Solicitud de información — AquaBioProcess Consulting",
    };
    return asuntos[clave];
}

export function urlMailto(
    email: string,
    motivo?: string,
    extra?: { nombre?: string },
): string {
    const params = new URLSearchParams({
        subject: asuntoPorMotivo(motivo, extra),
        body: mensajePorMotivo(motivo, extra),
    });
    return `mailto:${email}?${params.toString()}`;
}

/** Cuerpo corto: Hola + un parrafo + Saludos cordiales. Nada mas. */
export const mensajesWhatsapp = {
    general:
        "Hola Dr. Salinas,\n\nLe escribo desde aquabioprocess.cl. Me gustaría solicitar información sobre sus servicios en tratamiento de aguas o efluentes." +
        CIERRE,

    asesor:
        "Hola Dr. Salinas,\n\nMe gustaría solicitar información con un asesor de AquaBioProcess sobre la operación de una planta de tratamiento / efluente industrial." +
        CIERRE,

    consultoria:
        "Hola Dr. Salinas,\n\nQuiero solicitar información sobre los servicios de AquaBioProcess Consulting." +
        CIERRE,

    fundador:
        "Hola Dr. Salinas,\n\nLe contacto desde aquabioprocess.cl para solicitar información." +
        CIERRE,

    cv:
        "Hola Dr. Salinas,\n\nLe escribo desde aquabioprocess.cl. ¿Me podría compartir su CV técnico?" +
        CIERRE,

    academy:
        "Hola Dr. Salinas,\n\nMe gustaría solicitar información sobre las capacitaciones de AquaBioProcess Academy." +
        CIERRE,

    curso: (nombreCurso: string) =>
        `Hola Dr. Salinas,\n\nMe gustaría solicitar información sobre el curso "${nombreCurso}" de AquaBioProcess Academy.` +
        CIERRE,

    servicio: (nombreServicio: string) =>
        `Hola Dr. Salinas,\n\nMe gustaría solicitar información sobre el servicio "${nombreServicio}" de AquaBioProcess Consulting.` +
        CIERRE,
};

export function mensajePorMotivo(
    motivo: string | undefined,
    extra?: { nombre?: string },
): string {
    const clave = esMotivoWhatsapp(motivo) ? motivo : "general";
    if (clave === "curso") {
        return extra?.nombre
            ? mensajesWhatsapp.curso(extra.nombre)
            : mensajesWhatsapp.academy;
    }
    if (clave === "servicio") {
        return extra?.nombre
            ? mensajesWhatsapp.servicio(extra.nombre)
            : mensajesWhatsapp.consultoria;
    }
    return mensajesWhatsapp[clave];
}

/**
 * Numero y mensaje base vienen de Configuracion del sitio (admin), asi el
 * usuario los cambia sin tocar codigo. Devuelve null si no hay numero
 * cargado, para que los componentes puedan ocultar el boton flotante.
 */
export async function obtenerConfiguracionWhatsapp(): Promise<ConfiguracionWhatsapp | null> {
    const payload = await obtenerPayload();
    const configuracion = await payload.findGlobal({
        slug: "configuracion-sitio",
    });
    const numero = configuracion.whatsapp?.numero;

    if (!numero) return null;

    return {
        numero,
        mensajePorDefecto:
            configuracion.whatsapp?.mensajePorDefecto ||
            MENSAJE_WHATSAPP_GENERAL,
    };
}

export async function obtenerUrlWhatsapp(
    motivo?: string,
    extra?: { nombre?: string },
): Promise<string | null> {
    const configuracion = await obtenerConfiguracionWhatsapp();
    if (!configuracion) return null;
    return construirUrlWhatsapp(
        configuracion.numero,
        mensajePorMotivo(motivo, extra),
    );
}
