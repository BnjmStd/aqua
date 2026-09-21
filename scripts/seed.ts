import { existsSync } from "fs";
import { join } from "path";

import config from "@payload-config";
import { getPayload, type Payload } from "payload";

import type { Articulo, Pagina } from "@/payload-types";

type BloquesPagina = NonNullable<Pagina["bloques"]>;

/**
 * Puebla una BD de desarrollo con el contenido base: configuracion del sitio,
 * un admin y las paginas de bloques (inicio, consulting, fundador).
 *
 *   npm run db:seed:contenido            # crea lo que falte, no pisa nada
 *   npm run db:seed:contenido -- --force # reescribe las paginas existentes
 *
 * Flujo para actualizar la semilla versionada:
 *   1. npm run db:seed:contenido -- --force
 *   2. npm run db:snapshot
 *   3. commitear aquabioprocess.seed.db
 *
 * Corre con `tsx --env-file=.env` (ver package.json).
 */

const force = process.argv.includes("--force");

const ADMIN = {
    email: process.env.ADMIN_EMAIL ?? "admin@aquabioprocess.cl",
    password: process.env.ADMIN_PASSWORD ?? "aquabio-dev-2026",
    nombre: process.env.ADMIN_NOMBRE ?? "Administrador",
};

/** Un parrafo suelto en el formato lexical que espera el campo richText. */
function parrafo(texto: string) {
    return {
        root: {
            type: "root",
            direction: "ltr" as const,
            format: "" as const,
            indent: 0,
            version: 1,
            children: [
                {
                    type: "paragraph",
                    direction: "ltr" as const,
                    format: "" as const,
                    indent: 0,
                    version: 1,
                    children: [
                        {
                            type: "text",
                            version: 1,
                            text: texto,
                            format: 0,
                            detail: 0,
                            mode: "normal",
                            style: "",
                        },
                    ],
                },
            ],
        },
    };
}

/**
 * Sube una imagen de `public/` a la coleccion Media (idempotente por nombre
 * de archivo) y devuelve su id, para usarlo como `imagenFondo` de un hero.
 * Los archivos resultantes en `/media/` se versionan (ver .gitignore) para
 * que la semilla renderice con imagen en un clon nuevo.
 */
async function upsertMedia(
    payload: Payload,
    archivo: string,
    alt: string,
): Promise<string> {
    const rutaFisica = join(process.cwd(), "public", archivo);
    const existentes = await payload.find({
        collection: "media",
        where: { filename: { equals: archivo } },
        limit: 1,
        depth: 0,
    });
    const rowFileOk =
        existentes.docs[0] && existsSync(join(process.cwd(), "media", archivo));
    if (rowFileOk) {
        console.log(`  media ${archivo}: ya existe`);
        return existentes.docs[0].id;
    }
    if (existentes.docs[0]) {
        await payload.delete({
            collection: "media",
            id: existentes.docs[0].id,
            overrideAccess: true,
        });
    }
    const creada = await payload.create({
        collection: "media",
        data: { alt },
        filePath: rutaFisica,
        overrideAccess: true,
    });
    console.log(`  media ${archivo}: subida`);
    return creada.id;
}

type DatosPagina = {
    slug: string;
    titulo: string;
    bloques: Record<string, unknown>[];
};

const PAGINAS: DatosPagina[] = [
    {
        slug: "inicio",
        titulo: "Inicio",
        bloques: [
            {
                blockType: "hero",
                // imagenFondo se enchufa en main() con la imagen recien subida.
                adorno: "esquema",
                antetitulo: "Salinas Aquabioprocess Expert Consulting SpA.",
                titulo: "Science behind the process. Experience behind the solution.",
                bajada: "Consultoría científico-técnica para transformar datos, biología y experiencia industrial en decisiones operacionales.",
                acciones: [
                    {
                        texto: "Conversemos",
                        enlace: "/contacto?motivo=general",
                        estilo: "primario",
                    },
                    {
                        texto: "Ver servicios",
                        enlace: "/consultoria",
                        estilo: "secundario",
                    },
                ],
            },
            {
                blockType: "quienesSomos",
                antetitulo: "Quiénes somos",
                titulo: "Experiencia industrial convertida en soluciones",
                bajada:
                    "Una consultora nacida desde la operación real, la ciencia aplicada y el conocimiento de procesos.",
                texto:
                    "AquaBioProcess es una empresa chilena de consultoría especializada en tratamiento de aguas y efluentes industriales, procesos biológicos, microbiología aplicada, optimización operacional, innovación tecnológica y desarrollo de competencias.\n\nNuestro foco es acompañar a industrias y empresas de ingeniería a comprender el comportamiento de sus sistemas, identificar causas de desviaciones y convertir el diagnóstico en acciones concretas de mejora.",
                cierre:
                    "No entregamos sólo un informe: buscamos transformar conocimiento en decisiones y resultados.",
                bases: [
                    {
                        icono: "molecula",
                        titulo: "Base científica",
                        descripcion:
                            "Bioquímica, microbiología, método científico y análisis de procesos.",
                    },
                    {
                        icono: "casco",
                        titulo: "Experiencia industrial",
                        descripcion:
                            "Más de dos décadas enfrentando operación, contingencias, partidas y optimización.",
                    },
                    {
                        icono: "ajustes",
                        titulo: "Visión sistémica",
                        descripcion:
                            "Integramos diseño, operación, biología, datos, equipos y personas.",
                    },
                    {
                        icono: "birrete",
                        titulo: "Transferencia",
                        descripcion:
                            "Las soluciones deben dejar capacidades instaladas en los equipos del cliente.",
                    },
                ],
            },
            {
                blockType: "pasos",
                antetitulo: "Propuesta de valor",
                titulo: "Comprender antes de intervenir",
                bajada:
                    "La planta entrega señales. AquaBioProcess ayuda a interpretarlas y convertirlas en oportunidades.",
                pasos: [
                    {
                        titulo: "¿Qué está ocurriendo?",
                        descripcion:
                            "Caracterizamos el comportamiento real del sistema y sus desviaciones.",
                    },
                    {
                        titulo: "¿Por qué ocurre?",
                        descripcion:
                            "Buscamos causas, relaciones y restricciones; no sólo síntomas.",
                    },
                    {
                        titulo: "¿Qué riesgo u oportunidad existe?",
                        descripcion:
                            "Priorizamos impacto operacional, ambiental, económico y de continuidad.",
                    },
                    {
                        titulo: "¿Qué hacer?",
                        descripcion:
                            "Construimos acciones factibles, medibles y técnicamente sustentadas.",
                    },
                ],
                cierre:
                    "Resultado esperado: una operación más estable, eficiente, segura, sustentable y económicamente competitiva. Optimizar antes de invertir. Diferenciar causa raíz de síntoma. Integrar a quienes operan la planta. Medir con indicadores antes y después.",
            },
            {
                blockType: "unidades",
                titulo: "Soluciones integrales",
                bajada: "Nuestra arquitectura de marca abarca todas las áreas críticas para el éxito sostenible en el tratamiento de aguas y efluentes industriales.",
                tarjetas: [
                    {
                        unidad: "consulting",
                        descripcion:
                            "Auditorías especializadas, diagnóstico de sistemas y optimización de procesos operativos para garantizar eficiencia técnica y regulatoria.",
                    },
                    {
                        unidad: "academy",
                        descripcion:
                            "Programas de formación técnica y capacitación operativa en modalidades online, in-company y presencial, diseñados a medida.",
                    },
                    {
                        unidad: "technologies",
                        descripcion:
                            "Representación, evaluación y validación de tecnologías avanzadas e innovadoras aplicables al tratamiento de aguas y lodos.",
                    },
                    {
                        unidad: "insights",
                        descripcion:
                            "Difusión de conocimiento a través de artículos técnicos, presencia activa en LinkedIn y nuestro newsletter especializado.",
                    },
                    {
                        unidad: "rnd",
                        descripcion:
                            "Investigación aplicada, desarrollo de pilotajes y fomento de la innovación técnica continua para resolver desafíos complejos.",
                    },
                ],
            },
            {
                blockType: "proceso",
                titulo: "Del efluente crudo al agua tratada",
                bajada: "Cada etapa —reactor biológico, aireación, clarificación— se controla con ciencia, datos y experiencia operacional.",
            },
            {
                blockType: "propuesta",
                titulo: "Propuesta de valor",
                bajada: "Integramos conocimiento técnico y datos operativos para transformar el tratamiento de efluentes industriales en un proceso predecible y eficiente.",
                pilares: [
                    {
                        icono: "molecula",
                        titulo: "Ciencia + Biología",
                        descripcion:
                            "Fundamentos microbiológicos aplicados a la ingeniería de procesos.",
                    },
                    {
                        icono: "ajustes",
                        titulo: "Proceso",
                        descripcion:
                            "Optimización continua y estabilidad operativa.",
                    },
                    {
                        icono: "grafico",
                        titulo: "Datos",
                        descripcion:
                            "Análisis métrico para toma de decisiones precisas.",
                    },
                    {
                        icono: "casco",
                        titulo: "Experiencia operacional",
                        descripcion:
                            "Años en campo garantizando que las soluciones teóricas funcionen en la práctica industrial.",
                    },
                ],
            },
            {
                blockType: "sectores",
                titulo: "Una especialidad transferible a distintas industrias",
                bajada:
                    "Experiencia profunda en celulosa y papel, con aplicación a sectores intensivos en agua y tratamiento biológico.",
                sectores: [
                    {
                        nombre: "Celulosa y papel",
                        descripcion:
                            "Industria de origen y principal experiencia: efluentes complejos, lodos activados y excelencia operacional.",
                    },
                    {
                        nombre: "Forestal, química y agroindustria",
                        descripcion:
                            "Procesos con efluentes industriales complejos y alta exigencia de estabilidad.",
                    },
                    {
                        nombre: "Alimentos y bebidas",
                        descripcion:
                            "Alta carga orgánica y necesidad de un proceso biológico predecible.",
                    },
                    {
                        nombre: "Salmonicultura y acuicultura",
                        descripcion:
                            "Gestión de agua, nutrientes y tratamiento de efluentes.",
                    },
                    {
                        nombre: "Minería",
                        descripcion:
                            "Gestión hídrica, tratamiento y optimización de sistemas de agua.",
                    },
                    {
                        nombre: "Sanitarias y PTAR municipales",
                        descripcion:
                            "Procesos biológicos, lodos, control operacional y capacitación.",
                    },
                    {
                        nombre: "Empresas de ingeniería",
                        descripcion:
                            "Revisión técnica, commissioning y soporte experto durante el proyecto.",
                    },
                    {
                        nombre: "Proveedores tecnológicos",
                        descripcion:
                            "Validación, aplicación y representación técnica de soluciones.",
                    },
                ],
            },
            {
                blockType: "faq",
                titulo: "Preguntas frecuentes",
                preguntas: [
                    {
                        pregunta: "¿Trabajan con empresas fuera de Chile?",
                        respuesta: parrafo(
                            "Sí. Prestamos consultoría remota y presencial en Chile, Latinoamérica e internacionalmente, según el alcance del desafío.",
                        ),
                    },
                    {
                        pregunta: "¿Cómo empieza un proyecto con AquaBioProcess?",
                        respuesta: parrafo(
                            "Con una conversación inicial para entender el problema y la experiencia del equipo de planta. Luego observamos instalaciones, biomasa y prácticas, y recién entonces diagnosticamos causas —no solo síntomas— para proponer un roadmap de acciones.",
                        ),
                    },
                    {
                        pregunta: "¿Van a planta o el trabajo es solo de escritorio?",
                        respuesta: parrafo(
                            "El método incluye escuchar, observar e integrar datos de laboratorio, diseño y operación. Cuando el caso lo requiere, el trabajo es en terreno: reactor, aireación, clarificación y sala de control. También hay diagnósticos y seguimiento remoto.",
                        ),
                    },
                    {
                        pregunta: "¿En qué industrias tienen más experiencia?",
                        respuesta: parrafo(
                            "La experiencia de origen es celulosa y papel (Valdivia, Nueva Aldea, Constitución, Licancel, Arauco/MAPA y Montes del Plata). Ese conocimiento se transfiere a forestal, química, agroindustria, alimentos, salmonicultura, minería, sanitarias y empresas de ingeniería.",
                        ),
                    },
                    {
                        pregunta: "¿Hacen puesta en marcha y commissioning?",
                        respuesta: parrafo(
                            "Sí. Una de las líneas de Consulting cubre design review, pre-commissioning, inoculación, ramp-up, pruebas de capacidad y optimización post partida.",
                        ),
                    },
                    {
                        pregunta: "¿Para qué sirve la microscopía del lodo activado?",
                        respuesta: parrafo(
                            "Adelanta lo que los análisis fisicoquímicos confirman días después. El flóculo, los ciliados, los filamentos y el crecimiento disperso indican edad del lodo, aireación, carga y riesgo de bulking o efluente turbio. El microscopio, los datos y la operación deben contar la misma historia.",
                        ),
                    },
                    {
                        pregunta: "¿Dejan capacidad instalada en el equipo del cliente?",
                        respuesta: parrafo(
                            "Esa es una de las bases de AquaBioProcess. El último paso del método es transferir: capacitación, coaching y criterios para que la mejora no se vaya con el informe.",
                        ),
                    },
                    {
                        pregunta: "¿Trabajan con ingenierías y proveedores de tecnología?",
                        respuesta: parrafo(
                            "Sí. Revisamos diseño, acompañamos commissioning y evaluamos tecnologías, productos químicos e instrumentación de forma independiente antes de escalarlas.",
                        ),
                    },
                ],
            },
            {
                blockType: "cta",
                titulo: "¿Tienes un desafío operacional en mente?",
                texto: "Agenda una conversación inicial sin costo con nuestro equipo técnico.",
                textoBoton: "Escríbenos",
                enlace: "/contacto?motivo=general",
            },
        ],
    },
    {
        slug: "consulting",
        titulo: "Consulting",
        bloques: [
            {
                blockType: "hero",
                adorno: "causaRaiz",
                antetitulo: "Consulting",
                titulo: "Decidir antes de invertir",
                bajada: "Auditorías, diagnósticos, causa raíz y optimización de procesos biológicos. Ciencia, datos y experiencia operacional.",
                acciones: [
                    {
                        texto: "Solicitar una consultoría",
                        enlace: "/contacto?motivo=consultoria",
                        estilo: "primario",
                    },
                    {
                        texto: "Hablar con un asesor",
                        enlace: "/contacto?motivo=asesor",
                        estilo: "secundario",
                    },
                ],
            },
            {
                blockType: "pasos",
                antetitulo: "Wastewater Biology",
                titulo: "La biología de los lodos activados como herramienta de decisión",
                bajada:
                    "AquaBioProcess integra microbiología, bioquímica y variables de proceso para comprender qué ocurre dentro del reactor y cómo eso se refleja en sedimentabilidad, remoción, estabilidad y calidad del efluente.",
                pasos: [
                    {
                        titulo: "Actividad biológica",
                        descripcion:
                            "OUR / SOUR, respirometría, recuperación de actividad, toxicidad e inhibición.",
                    },
                    {
                        titulo: "Estado de la biomasa",
                        descripcion:
                            "SRT, F/M, nutrientes N/P, producción y pérdida de biomasa.",
                    },
                    {
                        titulo: "Sedimentabilidad",
                        descripcion:
                            "IVL/SVI, filamentosas, bulking, foaming y clarificación secundaria.",
                    },
                    {
                        titulo: "Biodegradabilidad",
                        descripcion:
                            "Fraccionamiento de DQO, ensayos de tratabilidad, modelación biológica y BioWin.",
                    },
                ],
                cierre:
                    "El microscopio, los datos y la operación deben contar la misma historia. Esa ventaja de tiempo permite anticipar problemas y orientar la decisión.",
            },
            {
                blockType: "bioindicadores",
                titulo: "Lo que dice el microscopio",
                bajada: "En un diagnóstico biológico, la microscopía del lodo activado adelanta lo que los análisis fisicoquímicos confirman días después. Cada organismo es una señal sobre la edad del lodo, la aireación y la carga.",
            },
            {
                blockType: "pasos",
                antetitulo: "Método AquaBioProcess",
                titulo: "Del problema operacional a una mejora verificable",
                bajada:
                    "Un proceso estructurado: no se interviene a ciegas. Primero se comprende, después se actúa, al final se verifica y se transfiere.",
                pasos: [
                    {
                        titulo: "Escuchar",
                        descripcion:
                            "Comprender el problema y la experiencia del equipo de planta.",
                    },
                    {
                        titulo: "Observar",
                        descripcion:
                            "Revisar instalaciones, equipos, biomasa y prácticas operacionales.",
                    },
                    {
                        titulo: "Analizar",
                        descripcion:
                            "Integrar tendencias, balances, laboratorio, diseño y biología.",
                    },
                    {
                        titulo: "Diagnosticar",
                        descripcion:
                            "Identificar causas y separar síntomas de problemas estructurales.",
                    },
                    {
                        titulo: "Proponer",
                        descripcion:
                            "Priorizar alternativas técnicamente sustentadas.",
                    },
                    {
                        titulo: "Implementar",
                        descripcion:
                            "Acompañar la ejecución cuando el cliente lo requiera.",
                    },
                    {
                        titulo: "Verificar",
                        descripcion:
                            "Comparar el desempeño antes y después mediante KPI.",
                    },
                    {
                        titulo: "Transferir",
                        descripcion:
                            "Dejar conocimiento instalado en la organización.",
                    },
                ],
                cierre:
                    "Roadmap AquaBioProcess: acciones inmediatas, corto plazo, mediano plazo y proyectos de inversión.",
            },
            {
                blockType: "cta",
                titulo: "¿Tienes un desafío operacional en mente?",
                texto: "Cuéntanos qué necesitas y coordinamos un diagnóstico inicial.",
                textoBoton: "Solicitar consultoría",
                enlace: "/contacto?motivo=consultoria",
            },
        ],
    },
    {
        slug: "fundador",
        titulo: "Fundador",
        bloques: [
            {
                blockType: "perfil",
                antetitulo: "Fundador y consultor principal",
                nombre: "Dr. Miguel Salinas Maldonado",
                subtitulo:
                    "Bioquímico · Doctor en Ciencias · Especialista senior en aguas y efluentes industriales",
                texto: "Más de 20 años de experiencia en la industria de celulosa, con funciones de alta responsabilidad como Subgerente, Ingeniero Experto e Ingeniero Senior en sistemas de tratamiento de aguas y efluentes. Una trayectoria que conecta laboratorio, biología, ingeniería de procesos y la realidad de la planta.",
                acciones: [
                    {
                        texto: "Contactar al Dr. Salinas",
                        enlace: "/contacto?motivo=fundador",
                        estilo: "primario",
                    },
                ],
                estadisticas: [
                    { etiqueta: "Experiencia", valor: "20+ años" },
                    { etiqueta: "Especialidad", valor: "Celulosa" },
                    { etiqueta: "Presencia", valor: "Chile y Uruguay" },
                ],
            },
            {
                blockType: "propuesta",
                titulo: "Una trayectoria que cruza laboratorio y planta",
                bajada:
                    "Ciencia, procesos, gestión y formación: el mismo criterio, desde el microscopio hasta la sala de control.",
                pilares: [
                    {
                        icono: "molecula",
                        titulo: "Ciencia",
                        descripcion:
                            "Formación en Bioquímica y Doctorado en Ciencias, con base en microbiología, fisiología y análisis científico.",
                    },
                    {
                        icono: "ajustes",
                        titulo: "Procesos",
                        descripcion:
                            "Tratamiento de aguas y efluentes, lodos activados, MBBR/IFAS, lagunas, clarificación y tratamiento terciario.",
                    },
                    {
                        icono: "casco",
                        titulo: "Gestión",
                        descripcion:
                            "Soporte transversal a operaciones, ingeniería, mantenimiento, medio ambiente, seguridad y laboratorios.",
                    },
                    {
                        icono: "birrete",
                        titulo: "Formación",
                        descripcion:
                            "Capacitación, entrenamiento y coaching técnico de operadores, ingenieros, supervisores y ejecutivos.",
                    },
                ],
            },
            {
                blockType: "pasos",
                antetitulo: "Experiencia",
                titulo: "Experiencia construida en plantas reales",
                bajada:
                    "Puesta en marcha, estabilización, contingencias, optimización y desarrollo de capacidades.",
                pasos: [
                    {
                        titulo: "Partidas y start-up",
                        descripcion:
                            "Definición de parámetros, desarrollo de biomasa, estabilización y acompañamiento operacional.",
                    },
                    {
                        titulo: "Contingencias",
                        descripcion:
                            "Derrames, paradas prolongadas, sobrecargas y pérdida de capacidad de remoción biológica.",
                    },
                    {
                        titulo: "Optimización de proceso",
                        descripcion:
                            "KPI operacionales y de calidad de efluente. Parámetros complejos: clorato, aluminio, color y DQO.",
                    },
                    {
                        titulo: "Datos y causa raíz",
                        descripcion:
                            "Control estadístico de variables críticas, balances de agua y análisis causa raíz.",
                    },
                ],
                cierre:
                    "También: evaluación de proyectos, nuevas tecnologías, productos químicos e instrumentación; investigación aplicada, pruebas piloto e industriales, y colaboración con universidades.",
            },
            {
                blockType: "presencia",
                antetitulo: "Presencia industrial",
                titulo: "Huella geográfica",
                bajada: "Impacto regional en Chile y Uruguay, con experiencia transferible a operaciones complejas en toda la zona sur.",
                paises: [
                    {
                        pais: "Chile",
                        plantas: [
                            {
                                nombre: "Planta Valdivia",
                                descripcion:
                                    "Optimización del sistema de lodos activados e implementación de control avanzado para efluentes de celulosa kraft.",
                            },
                            {
                                nombre: "Planta Nueva Aldea",
                                descripcion:
                                    "Diagnóstico integral del tratamiento secundario y capacitación técnica del equipo operativo.",
                            },
                            {
                                nombre: "Planta Constitución",
                                descripcion:
                                    "Experiencia en efluentes de celulosa: operación, estabilización y soporte técnico en planta.",
                            },
                            {
                                nombre: "Planta Licancel",
                                descripcion:
                                    "Tratamiento de aguas y efluentes en celulosa, con foco en continuidad operacional y calidad de descarga.",
                            },
                            {
                                nombre: "Proyecto MAPA (Arauco)",
                                descripcion:
                                    "Asesoría durante el comisionamiento y la puesta en marcha del tratamiento de efluentes de la línea 3.",
                                insignia: true,
                            },
                        ],
                    },
                    {
                        pais: "Uruguay",
                        plantas: [
                            {
                                nombre: "Montes del Plata",
                                descripcion:
                                    "Auditoría de desempeño del sistema biológico y protocolos de respuesta ante variaciones de carga orgánica.",
                            },
                        ],
                    },
                ],
            },
            {
                blockType: "cta",
                titulo: "¿Necesitas experiencia técnica en tu planta?",
                texto: "Coordinemos una conversación inicial para dimensionar el desafío.",
                textoBoton: "Conversemos",
                enlace: "/contacto?motivo=fundador",
            },
        ],
    },
];

const SERVICIOS_CONSULTING: {
    slug: string
    titulo: string
    resumen: string
    tipo: 'auditoria' | 'diagnostico' | 'implementacion' | 'asesoria'
    orden: number
    entregables?: string[]
    beneficios?: string[]
    imagen?: string
    imagenAlt?: string
}[] = [
    {
        slug: 'consulting-process-assessment',
        titulo: 'Consulting & Process Assessment',
        resumen:
            'Auditorías, diagnósticos, revisión de diseño, KPI, balances, análisis histórico, causa raíz y roadmap de mejoramiento.',
        tipo: 'auditoria',
        orden: 1,
        imagen: 'hero-consulting.jpg',
        imagenAlt:
            'Reactor biológico de lodos activados en operación, con espuma superficial y pasarela metálica.',
        entregables: [
            'Diagnóstico de proceso y causa raíz documentada',
            'KPI y balances de masa/energía',
            'Roadmap de mejoramiento priorizado',
        ],
        beneficios: [
            'Decidir con datos antes de invertir',
            'Alinear operación, diseño y cumplimiento',
        ],
    },
    {
        slug: 'process-optimization-troubleshooting',
        titulo: 'Process Optimization & Troubleshooting',
        resumen:
            'Estabilización, recuperación de capacidad, aireación, nutrientes, sedimentación, costos, calidad del efluente y contingencias.',
        tipo: 'diagnostico',
        orden: 2,
        imagen: 'bioindicador-floculo-sano.jpg',
        imagenAlt: 'Flóculo de lodo activado sano observado al microscopio.',
        entregables: [
            'Plan de estabilización y ajustes operacionales',
            'Recomendaciones de aireación, nutrientes y sedimentación',
            'Seguimiento de calidad de efluente y costos',
        ],
        beneficios: [
            'Recuperar capacidad y estabilidad',
            'Reducir contingencias y sobrecostos',
        ],
    },
    {
        slug: 'commissioning-start-up',
        titulo: 'Commissioning & Start-up',
        resumen:
            'Design review, pre-commissioning, puesta en marcha, inoculación, ramp-up, pruebas de capacidad y optimización post partida.',
        tipo: 'implementacion',
        orden: 3,
        imagen: 'hero-planta.jpg',
        imagenAlt:
            'Planta de tratamiento de aguas industriales con estanques, tableros de control y laboratorio.',
        entregables: [
            'Design review y checklist de pre-commissioning',
            'Protocolo de inoculación y ramp-up',
            'Pruebas de capacidad y optimización post partida',
        ],
        beneficios: [
            'Partida ordenada y verificable',
            'Menor riesgo en el arranque biológico',
        ],
    },
    {
        slug: 'water-wastewater-excellence',
        titulo: 'Water & Wastewater Excellence',
        resumen:
            'Tratamiento de agua, eficiencia hídrica, reúso, instrumentación, control de procesos y excelencia técnica de PTAR/PTA.',
        tipo: 'asesoria',
        orden: 4,
        imagen: 'hero-academy.jpg',
        imagenAlt:
            'Parrilla de difusores en operación en un reactor biológico de lodos activados.',
        entregables: [
            'Diagnóstico de PTA/PTAR y oportunidades de reúso',
            'Recomendaciones de instrumentación y control',
            'Plan de excelencia técnica operativa',
        ],
        beneficios: [
            'Mejorar eficiencia hídrica y control de proceso',
            'Elevar confiabilidad de la planta',
        ],
    },
    {
        slug: 'asset-process-reliability-assessment',
        titulo: 'Auditoría de mantenimiento orientada al proceso',
        resumen:
            'AquaBioProcess Asset & Process Reliability Assessment: evalúa si los activos críticos están disponibles, confiables y operando en condiciones compatibles con el proceso, la continuidad operacional, la eficiencia energética y la calidad del efluente. No sustituye la inspección mecánica especializada.',
        tipo: 'auditoria',
        orden: 5,
        imagen: 'corrosion-estructura-consumida.jpg',
        imagenAlt:
            'Soporte de acero de una planta de tratamiento casi completamente consumido por la corrosión.',
        entregables: [
            'Matriz de criticidad y riesgo proceso-activo',
            'Listado de hallazgos y desviaciones observadas',
            'Priorización de acciones: inmediata, corto plazo, mediano plazo y proyecto de inversión',
            'Recomendaciones de mantenimiento, monitoreo, instrumentación, operación o rediseño',
            'Identificación de estudios especializados requeridos (vibraciones, termografía, alineamiento, END, inspección eléctrica u otros)',
            'Reunión ejecutiva de cierre y transferencia de hallazgos',
        ],
        beneficios: [
            'Reducir el riesgo de paradas imprevistas y pérdida de capacidad de tratamiento',
            'Detectar fallas incipientes y recurrencias antes de que afecten el proceso',
            'Priorizar mantenimiento e inversiones según criticidad operacional y ambiental',
            'Mejorar eficiencia energética y desempeño de equipos asociados al tratamiento',
            'Fortalecer trazabilidad, planes preventivos y confiabilidad de la instrumentación',
            'Conectar mantenimiento, operación, proceso y cumplimiento ambiental en una sola evaluación',
        ],
    },
]

/**
 * Bioindicadores del lodo activado (colección `bioindicadores`). Imágenes
 * optimizadas por scripts/optimizar-bioindicadores.ts. Los textos de `queIndica`
 * son interpretación estándar de microscopía y quedan sujetos a revisión del
 * equipo técnico.
 */
const BIOINDICADORES: {
    slug: string;
    archivo: string;
    alt: string;
    nombre: string;
    nombreCientifico?: string;
    grupo: "floculo" | "ciliado" | "ameba" | "metazoo" | "filamentosa" | "hongo";
    condicion: "buena" | "alerta" | "problema";
    queIndica: string;
    orden: number;
}[] = [
    {
        slug: "floculo-sano",
        archivo: "bioindicador-floculo-sano.jpg",
        alt: "Microscopía de lodo activado: flóculo compacto con ciliados pedunculados fijos en su borde.",
        nombre: "Flóculo con ciliados fijos",
        grupo: "floculo",
        condicion: "buena",
        queIndica:
            "Flóculo firme y bien colonizado, con biomasa activa. Buena sedimentabilidad y efluente clarificado: es la estructura de referencia de un lodo sano.",
        orden: 1,
    },
    {
        slug: "ciliados-pedunculados",
        archivo: "bioindicador-ciliados-pedunculados.jpg",
        alt: "Colonia de ciliados pedunculados Opercularia adherida a un flóculo de lodo activado.",
        nombre: "Ciliados pedunculados",
        nombreCientifico: "Opercularia sp.",
        grupo: "ciliado",
        condicion: "buena",
        queIndica:
            "Fijos al flóculo, depredan bacterias dispersas. Indican lodo maduro y bien oxigenado, con carga orgánica moderada y efluente de baja turbidez.",
        orden: 2,
    },
    {
        slug: "rotifero",
        archivo: "bioindicador-rotifero.jpg",
        alt: "Rotífero del género Rotaria observado al microscopio en una muestra de lodo activado.",
        nombre: "Rotíferos",
        nombreCientifico: "Rotaria sp.",
        grupo: "metazoo",
        condicion: "alerta",
        queIndica:
            "Aparecen con lodos de edad alta (SRT largo) y relación alimento/microorganismos muy baja. Buena nitrificación y efluente de alta calidad; en exceso, señal de sobre-oxidación y pérdida de flóculo.",
        orden: 3,
    },
    {
        slug: "ameba-testacea",
        archivo: "bioindicador-ameba-testacea.jpg",
        alt: "Ameba testácea Arcella junto a un ciliado reptante y flóculos de lodo activado.",
        nombre: "Amebas testáceas",
        nombreCientifico: "Arcella sp.",
        grupo: "ameba",
        condicion: "buena",
        queIndica:
            "Toleran bien condiciones estables y de baja carga. Su presencia acompaña a lodos con buena nitrificación y edad media-alta.",
        orden: 4,
    },
    {
        slug: "gastrotrico",
        archivo: "bioindicador-gastrotrico.jpg",
        alt: "Gastrotrico del género Chaetonotus en una muestra de lodo activado.",
        nombre: "Gastrotricos",
        nombreCientifico: "Chaetonotus sp.",
        grupo: "metazoo",
        condicion: "buena",
        queIndica:
            "Metazoos asociados a lodos limpios, poco cargados y bien estabilizados, con efluente de buena calidad.",
        orden: 5,
    },
    {
        slug: "bacterias-filamentosas",
        archivo: "bioindicador-bacterias-filamentosas.jpg",
        alt: "Bacterias filamentosas extendiéndose desde un flóculo de lodo activado.",
        nombre: "Bacterias filamentosas",
        grupo: "filamentosa",
        condicion: "problema",
        queIndica:
            "El crecimiento de bacterias filamentosas en el lodo activado significa que existe un desequilibrio en la biología del sistema, el cual puede ser normal y beneficioso en pequeñas cantidades, o perjudicial si hay una proliferación excesiva, provocando bulking filamentoso, arrastre de sólidos, aumento de consumo de polímero en desaguado de lodos, entre otros problemas.",
        orden: 6,
    },
    {
        slug: "hongos-hifas",
        archivo: "bioindicador-hongos-hifas.jpg",
        alt: "Crecimiento de hifas de hongos en una muestra de lodo activado observada al microscopio.",
        nombre: "Hongos (hifas)",
        grupo: "hongo",
        condicion: "problema",
        queIndica:
            "Crecimiento de hifas de hongos en el lodo activado es un indicador biológico de que el sistema está perdiendo su equilibrio operativo. Los hongos proliferan con bajo pH, deficiencia de nutrientes, alzas de cargas orgánicas basadas en carbohidratos, bajo oxígeno disuelto (OD) y edad del lodo elevada.",
        orden: 7,
    },
    {
        slug: "crecimiento-disperso",
        archivo: "bioindicador-crecimiento-disperso.jpg",
        alt: "Lodo activado con crecimiento bacteriano disperso y filamentos libres, sin flóculos definidos.",
        nombre: "Crecimiento disperso",
        grupo: "floculo",
        condicion: "problema",
        queIndica:
            "Bacterias que no se agregan en flóculo: efluente turbio y mala sedimentación. Suele indicar lodo muy joven (SRT corto), choque tóxico o sobrecarga orgánica.",
        orden: 8,
    },
];

async function upsertBioindicador(
    payload: Payload,
    datos: (typeof BIOINDICADORES)[number],
): Promise<string> {
    const imagen = await upsertMedia(payload, datos.archivo, datos.alt);
    const existentes = await payload.find({
        collection: "bioindicadores",
        where: { slug: { equals: datos.slug } },
        limit: 1,
        depth: 0,
    });
    const data = {
        nombre: datos.nombre,
        nombreCientifico: datos.nombreCientifico,
        slug: datos.slug,
        imagen,
        grupo: datos.grupo,
        condicion: datos.condicion,
        queIndica: datos.queIndica,
        orden: datos.orden,
        _status: "published" as const,
    };
    const existente = existentes.docs[0];
    if (existente) {
        if (force) {
            await payload.update({
                collection: "bioindicadores",
                id: existente.id,
                data,
                overrideAccess: true,
            });
            console.log(`  bioindicador ${datos.slug}: actualizado`);
        } else {
            console.log(`  bioindicador ${datos.slug}: ya existe`);
        }
    } else {
        await payload.create({
            collection: "bioindicadores",
            data,
            overrideAccess: true,
        });
        console.log(`  bioindicador ${datos.slug}: creado`);
    }
    return imagen;
}

/**
 * Fotos de terreno de corrosion para el articulo de Insights. Imagenes
 * optimizadas por scripts/optimizar-corrosion.ts. El texto del articulo es
 * criterio general de inspeccion de integridad y queda sujeto a revision del
 * equipo tecnico.
 */
const CORROSION_IMAGENES: { slug: string; archivo: string; alt: string }[] = [
    {
        slug: "estructura-consumida",
        archivo: "corrosion-estructura-consumida.jpg",
        alt: "Soporte de acero de una planta de tratamiento casi completamente consumido por la corrosion, con herrumbre en capas.",
    },
    {
        slug: "fuga-en-union",
        archivo: "corrosion-fuga-en-union.jpg",
        alt: "Union bridada de una tuberia con corrosion avanzada y una fuga de agua activa en la soldadura de la boquilla.",
    },
    {
        slug: "ampollas-recubrimiento",
        archivo: "corrosion-ampollas-recubrimiento.jpg",
        alt: "Recubrimiento de una superficie en contacto con el efluente, con ampollas y zonas desprendidas.",
    },
    {
        slug: "zona-de-dificil-acceso",
        archivo: "corrosion-zona-de-dificil-acceso.jpg",
        alt: "Soportes y bridas de tuberia bajo una losa de hormigon, con corrosion generalizada y pintura perdida.",
    },
    {
        slug: "inspeccion-soldadura",
        archivo: "corrosion-inspeccion-soldadura.jpg",
        alt: "Detalle de una soldadura con la superficie recien granallada junto a un tramo con recubrimiento antiguo y oxido.",
    },
];

/** Nodo de texto lexical. */
function lexTexto(texto: string) {
    return {
        type: "text",
        version: 1,
        text: texto,
        format: 0,
        style: "",
        mode: "normal",
        detail: 0,
    };
}

/** Nodos lexical de nivel raiz para el `contenido` de un articulo. */
function lexParrafo(texto: string) {
    return {
        type: "paragraph",
        version: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        children: [lexTexto(texto)],
    };
}

function lexEncabezado(texto: string, tag: "h2" | "h3" = "h2") {
    return {
        type: "heading",
        tag,
        version: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        children: [lexTexto(texto)],
    };
}

function lexImagen(mediaId: string) {
    return {
        type: "upload",
        version: 3,
        relationTo: "media",
        value: mediaId,
        fields: null,
        format: "",
    };
}

function lexDocumento(nodos: Record<string, unknown>[]) {
    return {
        root: {
            type: "root",
            version: 1,
            direction: "ltr" as const,
            format: "" as const,
            indent: 0,
            children: nodos,
        },
    };
}

async function upsertArticulo(
    payload: Payload,
    imagenesBio: Record<string, string>,
) {
    const SLUG = "bioindicadores-lodo-activado";
    const contenido = lexDocumento([
        lexParrafo(
            "En un diagnostico biologico, la microscopia del lodo activado es la primera lectura del estado del proceso. Mientras los analisis fisicoquimicos tardan dias, una muestra al microscopio muestra en minutos si el flóculo esta sano, si la aireacion alcanza y si la edad del lodo es la adecuada. Los organismos que aparecen —y los que faltan— son un indicador anticipado.",
        ),
        lexEncabezado("El flóculo, primero"),
        lexImagen(imagenesBio["floculo-sano"]),
        lexParrafo(
            "Antes de mirar quien vive en el lodo, se mira como esta armado. Un flóculo compacto, firme y bien definido, con bacterias formadoras dominando, sedimenta bien y deja un efluente clarificado. Es la estructura de referencia contra la que se compara todo lo demas.",
        ),
        lexEncabezado("Los que traen buenas noticias"),
        lexParrafo(
            "Los ciliados pedunculados —Opercularia, Vorticella y parientes— se fijan al flóculo y filtran bacterias dispersas del liquido. Su presencia indica un lodo maduro, bien oxigenado, con carga organica moderada y un efluente de baja turbidez.",
        ),
        lexImagen(imagenesBio["ciliados-pedunculados"]),
        lexParrafo(
            "Mas arriba en la escala de estabilizacion aparecen los metazoos. Los rotiferos son propios de lodos de edad alta y relacion alimento/microorganismos muy baja: buena nitrificacion y efluente de alta calidad. En exceso, sin embargo, son senal de sobre-oxidacion y de un lodo que empieza a perder estructura.",
        ),
        lexImagen(imagenesBio["rotifero"]),
        lexParrafo(
            "Las amebas testaceas como Arcella y los gastrotricos completan el cuadro de un lodo estable y poco cargado, con buena nitrificacion y edad media-alta.",
        ),
        lexImagen(imagenesBio["gastrotrico"]),
        lexEncabezado("Las senales de alarma"),
        lexParrafo(
            "El crecimiento de bacterias filamentosas en el lodo activado significa que existe un desequilibrio en la biologia del sistema: puede ser normal y beneficioso en pequenas cantidades, o perjudicial si hay una proliferacion excesiva, provocando bulking filamentoso, arrastre de solidos, aumento de consumo de polimero en desaguado de lodos, entre otros problemas.",
        ),
        lexImagen(imagenesBio["bacterias-filamentosas"]),
        lexParrafo(
            "El crecimiento de hifas de hongos en el lodo activado indica que el sistema esta perdiendo su equilibrio operativo. Los hongos proliferan con bajo pH, deficiencia de nutrientes, alzas de cargas organicas basadas en carbohidratos, bajo oxigeno disuelto y edad del lodo elevada.",
        ),
        lexImagen(imagenesBio["hongos-hifas"]),
        lexParrafo(
            "En el otro extremo esta el crecimiento disperso: bacterias que no llegan a agregarse en flóculo. El efluente sale turbio y la sedimentacion es mala. Suele indicar un lodo muy joven, un choque toxico o una sobrecarga organica reciente.",
        ),
        lexImagen(imagenesBio["crecimiento-disperso"]),
        lexEncabezado("Del microscopio a la decision"),
        lexParrafo(
            "Ninguna de estas observaciones se lee sola: se cruzan con el SVI, el oxigeno disuelto, la edad del lodo y la carga. Pero permiten anticipar. Cuando la poblacion de ciliados cae o los filamentos empiezan a dominar, hay dias de margen para ajustar aireacion, purga o dosificacion antes de que el problema llegue al punto de descarga. Esa ventaja de tiempo es el valor de mirar.",
        ),
    ]);

    const data = {
        titulo: "Bioindicadores del lodo activado: lo que el microscopio adelanta",
        bajada: "Antes de que lleguen los resultados de laboratorio, la microscopia del lodo ya muestra si el proceso esta sano. Una guia visual de los organismos que importan.",
        contenido: contenido as unknown as NonNullable<Articulo["contenido"]>,
        tipo: "analisis" as const,
        fechaPublicacion: new Date("2026-08-01T12:00:00Z").toISOString(),
        unidades: ["insights"] as NonNullable<Articulo["unidades"]>,
        slug: SLUG,
        imagenDestacada: imagenesBio["ciliados-pedunculados"],
        tiempoLecturaMinutos: 4,
        destacado: true,
        _status: "published" as const,
    };

    const existentes = await payload.find({
        collection: "articulos",
        where: { slug: { equals: SLUG } },
        limit: 1,
        depth: 0,
    });
    const existente = existentes.docs[0];
    if (existente) {
        if (force) {
            await payload.update({
                collection: "articulos",
                id: existente.id,
                data,
                overrideAccess: true,
            });
            console.log(`  articulo ${SLUG}: actualizado`);
        } else {
            console.log(`  articulo ${SLUG}: ya existe`);
        }
    } else {
        await payload.create({
            collection: "articulos",
            data,
            overrideAccess: true,
        });
        console.log(`  articulo ${SLUG}: creado`);
    }
}

async function upsertArticuloCorrosion(payload: Payload) {
    const SLUG = "corrosion-plantas-tratamiento";

    const img: Record<string, string> = {};
    for (const { slug, archivo, alt } of CORROSION_IMAGENES) {
        img[slug] = await upsertMedia(payload, archivo, alt);
    }

    const contenido = lexDocumento([
        lexParrafo(
            "En una planta de tratamiento la corrosion no es un problema de mantencion aislado: es parte del proceso. El agua residual aporta cloruros, sulfatos y solidos; la humedad y la condensacion mantienen las superficies mojadas; y la actividad biologica genera sulfuro de hidrogeno. Sobre ese fondo, estructuras de acero al carbono y hormigon que en otro contexto durarian decadas se degradan en pocos anos si no se protegen y se revisan.",
        ),
        lexEncabezado("Cada zona se corroe distinto"),
        lexParrafo(
            "Un mismo estanque tiene ambientes muy diferentes segun la altura. La zona sumergida sufre corrosion mas o menos uniforme y ataque localizado bajo depositos. La franja de salpicadura —mojado y secado alternados, con oxigeno siempre disponible— es la mas agresiva para el acero y donde primero fallan los recubrimientos. La zona atmosferica se deteriora por condensacion. Y el espacio de gas sobre el liquido, en camaras y estructuras cerradas, concentra el sulfuro de hidrogeno.",
        ),
        lexEncabezado("Del sulfuro al acido: la corrosion biogenica"),
        lexParrafo(
            "En las zonas sin oxigeno —camaras de llegada, impulsiones, digestion, lodos septicos— las bacterias sulfato-reductoras producen sulfuro de hidrogeno. El gas pasa al aire del recinto y, sobre las paredes humedas, otras bacterias lo oxidan a acido sulfurico. El pH de la superficie puede bajar a valores de 1 a 2. Ese acido disuelve la pasta de cemento del hormigon —deja los aridos a la vista y expone la armadura— y ataca el acero de barandas, compuertas y ductos en la parte alta de la estructura, justo donde es mas dificil inspeccionar.",
        ),
        lexImagen(img["zona-de-dificil-acceso"]),
        lexParrafo(
            "Union bridada y soportes bajo una losa: corrosion generalizada y recubrimiento perdido en un punto de dificil acceso, tipico de donde el deterioro avanza sin que nadie lo vea.",
        ),
        lexEncabezado("Lo que se busca en terreno"),
        lexParrafo(
            "La inspeccion visual ordena el resto del trabajo. Hay cuatro senales que se registran y fotografian.",
        ),
        lexParrafo(
            "Perdida de seccion. Escamas gruesas, laminacion del acero (herrumbre en hojaldre) y elementos que ya no conservan su espesor original. Cuando un perfil o un soporte llega a este estado, la reparacion local rara vez alcanza.",
        ),
        lexImagen(img["estructura-consumida"]),
        lexParrafo(
            "Soporte de acero practicamente consumido por la corrosion, con herrumbre laminar. A esta altura del deterioro el elemento se reemplaza, no se repara.",
        ),
        lexParrafo(
            "Fugas en uniones. Bridas, soldaduras de boquillas y juntas apernadas son puntos de corrosion por rendija: el ataque avanza escondido en la junta hasta que aparece el goteo. Una fuga pequena en una linea de aire o de recirculacion tiene efecto directo en el proceso.",
        ),
        lexImagen(img["fuga-en-union"]),
        lexParrafo(
            "Fuga activa en la union de una tuberia: la corrosion progreso desde la soldadura de la boquilla hasta perforar. El punto ya estaba comprometido mucho antes de que se viera el agua.",
        ),
        lexParrafo(
            "Falla del recubrimiento. Ampollas, desprendimiento y oxido que se mete bajo la pintura son el aviso temprano, cuando todavia no hay dano estructural. Intervenir el recubrimiento en esta etapa es mucho mas barato que esperar a que el metal quede expuesto.",
        ),
        lexImagen(img["ampollas-recubrimiento"]),
        lexParrafo(
            "Ampollamiento y desprendimiento del recubrimiento en una superficie en contacto con el efluente: el momento para intervenir es este, antes de que el acero quede al descubierto.",
        ),
        lexParrafo(
            "Zonas ciegas. Cara inferior de pasarelas, apoyos de tuberia, pernos de anclaje, empotramientos: donde no se ve y no se limpia, la corrosion corre mas rapido. Son los puntos que hay que ir a buscar a proposito.",
        ),
        lexEncabezado("De la inspeccion a la decision"),
        lexParrafo(
            "El registro visual se complementa con medicion de espesores por ultrasonido en los puntos criticos. Con el espesor remanente y el original se estima la velocidad de corrosion y la vida util que queda. Eso permite ordenar las intervenciones por consecuencia —no es lo mismo un elemento estructural que un pasamanos— y definir la ventana: reparar recubrimiento ahora, reemplazar un tramo en la proxima parada, o dejar un punto en seguimiento con proxima medicion agendada.",
        ),
        lexImagen(img["inspeccion-soldadura"]),
        lexParrafo(
            "Inspeccion de una soldadura: superficie recien preparada junto al recubrimiento antiguo con oxido. Sobre metal limpio se mide espesor y se decide si el elemento sigue, se refuerza o se cambia.",
        ),
        lexParrafo(
            "Y como todo en una planta, la integridad mecanica y el proceso biologico son el mismo problema. Una linea de aire que pierde por corrosion baja el oxigeno disuelto en el reactor; una compuerta que no cierra descontrola un reparto de caudal; un puente de clarificador comprometido limita la operacion. Revisar el deterioro a tiempo es, tambien, cuidar el desempeno del tratamiento.",
        ),
    ]);

    const data = {
        titulo:
            "Corrosión en plantas de tratamiento de efluentes y en cañerías de distribución de aguas industriales: ¿sabes por qué ocurre y cómo evitarlo?",
        bajada:
            "El efluente, las condiciones ambientales y químicas de los líquidos son agresivos para el acero y el hormigón. Conocimientos y guía visual de lo que se busca en una inspección integral y de control para evitar pérdidas y cuidar la continuidad operativa.",
        contenido: contenido as unknown as NonNullable<Articulo["contenido"]>,
        tipo: "analisis" as const,
        fechaPublicacion: new Date("2026-08-29T12:00:00Z").toISOString(),
        unidades: ["insights", "consulting"] as NonNullable<
            Articulo["unidades"]
        >,
        slug: SLUG,
        imagenDestacada: img["fuga-en-union"],
        tiempoLecturaMinutos: 5,
        destacado: false,
        _status: "published" as const,
    };

    const existentes = await payload.find({
        collection: "articulos",
        where: { slug: { equals: SLUG } },
        limit: 1,
        depth: 0,
    });
    const existente = existentes.docs[0];
    if (existente) {
        if (force) {
            await payload.update({
                collection: "articulos",
                id: existente.id,
                data,
                overrideAccess: true,
            });
            console.log(`  articulo ${SLUG}: actualizado`);
        } else {
            console.log(`  articulo ${SLUG}: ya existe`);
        }
    } else {
        await payload.create({
            collection: "articulos",
            data,
            overrideAccess: true,
        });
        console.log(`  articulo ${SLUG}: creado`);
    }
}

async function descripcionAuditoriaMantenimiento(payload: Payload) {
    const imgProceso = await upsertMedia(
        payload,
        "corrosion-zona-de-dificil-acceso.jpg",
        "Zona de dificil acceso con corrosion generalizada en soportes y bridas de una planta de tratamiento.",
    )
    const imgFuga = await upsertMedia(
        payload,
        "corrosion-fuga-en-union.jpg",
        "Fuga activa en una union bridada por corrosion avanzada.",
    )

    return lexDocumento([
        lexParrafo(
            "AquaBioProcess incorpora una linea de auditoria tecnico-operacional del mantenimiento de equipos e instalaciones de tratamiento de aguas y efluentes. El servicio no pretende sustituir la inspeccion mecanica especializada ni certificar la integridad interna de un equipo. Su foco es evaluar si los activos criticos estan disponibles, confiables y operando en condiciones compatibles con las necesidades del proceso, la continuidad operacional, la eficiencia energetica y la calidad del agua o efluente.",
        ),
        lexParrafo(
            "El valor diferencial es conectar la condicion del activo con su consecuencia sobre el proceso: una bomba, soplador, agitador, sistema de aireacion, dosificadora, filtro, membrana o instrumento se evalua no solo por su funcionamiento aparente, sino por su capacidad de entregar el caudal, presion, mezcla, transferencia, dosificacion o senal que el tratamiento requiere.",
        ),
        lexImagen(imgProceso),
        lexEncabezado("Alcance de la auditoria"),
        lexParrafo(
            "Auditoria de suficiencia y desempeno: contraste entre condiciones de diseno, condicion operacional y demanda actual del proceso.",
        ),
        lexParrafo(
            "Equipos criticos: bombas, sopladores, agitadores, motores, reductores, sistemas de aireacion, dosificacion, valvulas y equipos de separacion.",
        ),
        lexParrafo(
            "Instrumentacion y control: revision de estado, trazabilidad y planes de calibracion de pH, conductividad, caudal, nivel, presion, oxigeno disuelto y otras variables criticas.",
        ),
        lexParrafo(
            "Filtros y membranas: analisis de presion diferencial, caudales, ensuciamiento, incrustacion, limpiezas quimicas/CIP y tendencias de desempeno.",
        ),
        lexParrafo(
            "Corrosion, incrustaciones y compatibilidad de materiales: identificacion de senales asociadas a pH, cloruros, sulfatos, reactivos y condiciones del fluido.",
        ),
        lexParrafo(
            "Eficiencia de transferencia y energia: revision de aireacion y relacion entre demanda de oxigeno, desempeno del proceso y consumo energetico.",
        ),
        lexParrafo(
            "Gestion del mantenimiento: analisis de historial de fallas, mantenimiento preventivo/correctivo, backlog, criticidad, repuestos, bitacoras y recurrencia de eventos.",
        ),
        lexParrafo(
            "Interfaz operacion-mantenimiento: identificacion de fallas repetitivas cuya causa pueda estar asociada a condiciones de proceso, seleccion, operacion o control.",
        ),
        lexImagen(imgFuga),
        lexEncabezado("Metodologia en tres fases"),
        lexParrafo(
            "FASE 1 | Datos y documentos — diseno, historial de fallas, ordenes de trabajo, tendencias, consumos, calibraciones y mantenimiento.",
        ),
        lexParrafo(
            "FASE 2 | Inspeccion operacional — inspeccion visual y funcional, observacion de senales, contraste equipo-proceso y entrevistas con operacion/mantenimiento.",
        ),
        lexParrafo(
            "FASE 3 | Riesgos y roadmap — matriz activo-proceso, criticidad, hallazgos, acciones inmediatas, recomendaciones y necesidades de especialista.",
        ),
        lexEncabezado("Modelo de trabajo interdisciplinario"),
        lexParrafo(
            "Cuando el alcance requiera diagnostico mecanico, electrico o predictivo especializado, AquaBioProcess puede coordinar profesionales o empresas partner. El especialista emite su diagnostico dentro de su disciplina y AquaBioProcess integra los resultados con la condicion de proceso, el riesgo ambiental y la continuidad operacional.",
        ),
        lexParrafo(
            "Posicionamiento: no reemplazamos al especialista mecanico. Integramos mantenimiento y proceso para determinar si los activos criticos estan entregando lo que la planta necesita y que riesgo representa una desviacion para la operacion y el efluente.",
        ),
    ])
}

async function upsertServicio(
    payload: Payload,
    datos: (typeof SERVICIOS_CONSULTING)[number],
) {
    const existentes = await payload.find({
        collection: "servicios",
        where: { slug: { equals: datos.slug } },
        limit: 1,
        depth: 0,
    })

    const imagenDestacada = datos.imagen
        ? await upsertMedia(payload, datos.imagen, datos.imagenAlt ?? datos.titulo)
        : undefined

    const descripcion =
        datos.slug === "asset-process-reliability-assessment"
            ? await descripcionAuditoriaMantenimiento(payload)
            : undefined

    const data = {
        titulo: datos.titulo,
        resumen: datos.resumen,
        tipo: datos.tipo,
        unidad: "consulting" as const,
        slug: datos.slug,
        orden: datos.orden,
        entregables: (datos.entregables ?? []).map((entregable) => ({ entregable })),
        beneficios: (datos.beneficios ?? []).map((beneficio) => ({ beneficio })),
        ...(imagenDestacada ? { imagenDestacada } : {}),
        ...(descripcion
            ? { descripcion: descripcion as never }
            : {}),
        _status: "published" as const,
    }
    const existente = existentes.docs[0]
    if (existente) {
        if (force) {
            await payload.update({
                collection: "servicios",
                id: existente.id,
                data,
                overrideAccess: true,
            })
            console.log(`  servicio ${datos.slug}: actualizado`)
        } else {
            console.log(`  servicio ${datos.slug}: ya existe`)
        }
    } else {
        await payload.create({
            collection: "servicios",
            data,
            overrideAccess: true,
        })
        console.log(`  servicio ${datos.slug}: creado`)
    }
}

/** Catalogo base de Academia (pedido en docs/CAMBIOS). */
const CURSOS_ACADEMIA: {
    slug: string
    codigo: string
    titulo: string
    resumen: string
    duracionHoras: number
    nivel: "introductorio" | "intermedio" | "avanzado"
    imagen: string
    imagenAlt: string
}[] = [
    {
        slug: "fundamentos-sistemas-tratamiento-efluentes",
        codigo: "ACAD-001",
        titulo: "Fundamentos de Sistemas de Tratamiento de Efluentes",
        resumen:
            "Bases de proceso, operación y control de sistemas de tratamiento de efluentes industriales y municipales.",
        duracionHoras: 12,
        nivel: "introductorio",
        imagen: "hero-planta.jpg",
        imagenAlt:
            "Planta de tratamiento de aguas industriales con estanques y tableros de control.",
    },
    {
        slug: "observacion-microscopica-lodos-activados",
        codigo: "ACAD-002",
        titulo: "Observación Microscópica y de Lodos Activados",
        resumen:
            "Lectura operacional del microscopio: flóculo, bioindicadores y señales tempranas del proceso biológico.",
        duracionHoras: 8,
        nivel: "intermedio",
        imagen: "bioindicador-ciliados-pedunculados.jpg",
        imagenAlt: "Colonia de ciliados pedunculados en lodo activado al microscopio.",
    },
    {
        slug: "control-avanzado-procesos-tratamiento-efluentes",
        codigo: "ACAD-003",
        titulo: "Control Avanzado de Procesos Sistema de Tratamiento de Efluentes",
        resumen:
            "Control de aireación, nutrientes, edad del lodo y variables críticas para estabilizar el efluente.",
        duracionHoras: 6,
        nivel: "avanzado",
        imagen: "hero-consulting.jpg",
        imagenAlt: "Reactor biológico de lodos activados en operación.",
    },
    {
        slug: "estudio-resolucion-casos",
        codigo: "ACAD-004",
        titulo: "Estudio y Resolución de Casos",
        resumen:
            "Metodología de causa raíz aplicada a fallas reales de PTAR/PTA y planes de acción verificables.",
        duracionHoras: 8,
        nivel: "intermedio",
        imagen: "hero-academy.jpg",
        imagenAlt: "Parrilla de difusores en un reactor biológico vista desde arriba.",
    },
    {
        slug: "estrategias-condiciones-alteradas-tratamiento-efluentes",
        codigo: "ACAD-005",
        titulo: "Estrategias para condiciones alteradas en Sistema de Tratamientos de Efluentes",
        resumen:
            "Respuesta ante sobrecargas, toxicidad, bulking, foaming y otras condiciones alteradas del proceso.",
        duracionHoras: 6,
        nivel: "avanzado",
        imagen: "bioindicador-bacterias-filamentosas.jpg",
        imagenAlt: "Bacterias filamentosas en una muestra de lodo activado.",
    },
]

async function upsertCurso(
    payload: Payload,
    datos: (typeof CURSOS_ACADEMIA)[number],
) {
    const imagenDestacada = await upsertMedia(payload, datos.imagen, datos.imagenAlt)
    const existentes = await payload.find({
        collection: "cursos",
        where: { slug: { equals: datos.slug } },
        limit: 1,
        depth: 0,
    })
    const data = {
        titulo: datos.titulo,
        resumen: datos.resumen,
        slug: datos.slug,
        codigo: datos.codigo,
        duracionHoras: datos.duracionHoras,
        asistenciaMinima: 75,
        nivel: datos.nivel,
        imagenDestacada,
        modalidadesDisponibles: ["presencial", "online_vivo", "incompany"] as (
            | "presencial"
            | "online_vivo"
            | "incompany"
        )[],
        estadoProducto: "activo" as const,
        _status: "published" as const,
    }
    const existente = existentes.docs[0]
    if (existente) {
        if (force) {
            await payload.update({
                collection: "cursos",
                id: existente.id,
                data,
                overrideAccess: true,
            })
            console.log(`  curso ${datos.slug}: actualizado`)
        } else {
            console.log(`  curso ${datos.slug}: ya existe`)
        }
    } else {
        await payload.create({
            collection: "cursos",
            data,
            overrideAccess: true,
        })
        console.log(`  curso ${datos.slug}: creado`)
    }
}

/** Newsletter tecnico Edicion 01 — titulo fijo: Salud del Lodo.
 *  El layout visual vive en components/insights/EdicionSaludDelLodo.tsx
 *  (content/newsletter-salud-del-lodo.ts). Aqui solo el registro CMS. */
async function upsertNewsletterSaludDelLodo(payload: Payload) {
    const SLUG = "salud-del-lodo"

    const contenido = lexDocumento([
        lexParrafo(
            "Edicion 01 | 2026. El pulso biologico que define el desempeno del tratamiento. La presentacion completa de esta edicion se muestra en la pagina publica del newsletter (layout editorial).",
        ),
        lexParrafo(
            "Temas: vision integral de la Salud del Lodo, ocho dimensiones, diagnostico integrado (microscopia + signos vitales) y lectura segun tecnologia (lodos activados, MBBR, IFAS, RAS).",
        ),
    ])

    const data = {
        numero: 1,
        titulo: "Salud del Lodo",
        slug: SLUG,
        asunto: "Salud del Lodo — el pulso biologico del tratamiento",
        preheader:
            "El pulso biologico que define el desempeno del tratamiento. Edicion 01 | 2026.",
        contenido: contenido as never,
        segmentacion: ["insights", "academy"] as ("insights" | "academy")[],
        estadoEnvio: "enviada" as const,
        fechaEnvio: new Date("2026-01-15T12:00:00Z").toISOString(),
        destinatarios: 0,
    }

    const existentes = await payload.find({
        collection: "newsletter-ediciones",
        where: { slug: { equals: SLUG } },
        limit: 1,
        depth: 0,
    })
    const existente = existentes.docs[0]
    if (existente) {
        if (force) {
            await payload.delete({
                collection: "newsletter-ediciones",
                id: existente.id,
                overrideAccess: true,
            })
            await payload.create({
                collection: "newsletter-ediciones",
                data,
                overrideAccess: true,
            })
            console.log(`  newsletter ${SLUG}: recreada`)
        } else {
            console.log(`  newsletter ${SLUG}: ya existe`)
        }
    } else {
        await payload.create({
            collection: "newsletter-ediciones",
            data,
            overrideAccess: true,
        })
        console.log(`  newsletter ${SLUG}: creada`)
    }
}

async function upsertAdmin(payload: Payload) {
    const existentes = await payload.find({
        collection: "users",
        where: { email: { equals: ADMIN.email } },
        limit: 1,
        depth: 0,
    });
    if (existentes.docs[0]) {
        console.log(`  admin ${ADMIN.email}: ya existe`);
        return;
    }
    await payload.create({
        collection: "users",
        data: { ...ADMIN, rol: "admin" },
        overrideAccess: true,
    });
    console.log(`  admin ${ADMIN.email}: creado`);
}

/**
 * Media que un bloque de una pagina ya tiene puesta (normalmente desde el
 * admin), para que `--force` NO la pise con la del seed. Devuelve el id, o
 * null si la pagina/bloque/campo no existe o el media fue borrado.
 *
 * `blockType` en vez de indice: sobrevive a que reordenen los bloques.
 */
async function mediaDeBloque(
    payload: Payload,
    slug: string,
    blockType: string,
    campo: string,
): Promise<string | null> {
    const { docs } = await payload.find({
        collection: "paginas",
        where: { slug: { equals: slug } },
        depth: 0,
        limit: 1,
    });
    const bloques = (docs[0]?.bloques ?? []) as {
        blockType?: string;
        [k: string]: unknown;
    }[];
    const valor = bloques.find((b) => b.blockType === blockType)?.[campo];
    if (typeof valor !== "string") return null;
    const existe = await payload
        .findByID({ collection: "media", id: valor, depth: 0 })
        .catch(() => null);
    return existe ? valor : null;
}

async function upsertPagina(payload: Payload, datos: DatosPagina) {
    const existentes = await payload.find({
        collection: "paginas",
        where: { slug: { equals: datos.slug } },
        limit: 1,
        depth: 0,
    });
    const existente = existentes.docs[0];
    const data = {
        titulo: datos.titulo,
        slug: datos.slug,
        bloques: datos.bloques as unknown as BloquesPagina,
        _status: "published" as const,
    };

    if (existente) {
        if (!force) {
            console.log(
                `  pagina ${datos.slug}: ya existe (usa --force para reescribir)`,
            );
            return;
        }
        await payload.update({
            collection: "paginas",
            id: existente.id,
            data,
            overrideAccess: true,
        });
        console.log(`  pagina ${datos.slug}: actualizada`);
    } else {
        await payload.create({
            collection: "paginas",
            data,
            overrideAccess: true,
        });
        console.log(`  pagina ${datos.slug}: creada`);
    }
}

async function main() {
    const payload = await getPayload({ config });

    console.log("Media...");
    const logoMarca = await upsertMedia(
        payload,
        "logo.png",
        "Logotipo de Salinas Aquabioprocess Expert Consulting: una gota de agua con una hoja verde junto al nombre de la empresa.",
    );
    const fotoFundador = await upsertMedia(
        payload,
        "fundador.jpg",
        "Consultor sonriendo, con casco blanco y chaleco reflectante, sosteniendo una carpeta frente a los estanques de aireacion de una planta de tratamiento de aguas.",
    );
    const heroInicio = await upsertMedia(
        payload,
        "hero-planta.jpg",
        "Planta de tratamiento de aguas industriales con estanques de acero, tableros de control y laboratorio de analisis.",
    );
    const heroConsulting = await upsertMedia(
        payload,
        "hero-consulting.jpg",
        "Reactor biologico de lodos activados en operacion, con espuma superficial y una pasarela metalica cruzando el estanque.",
    );

    console.log("Configuracion del sitio...");
    await payload.updateGlobal({
        slug: "configuracion-sitio",
        data: {
            nombreComercial: "aquabioprocess.cl",
            razonSocial: "SALINAS AQUABIOPROCESS EXPERT CONSULTING SpA",
            email: "msalinas@aquabioprocess.cl",
            correos: [
                { email: "msalinas@aquabioprocess.cl", etiqueta: "Fundador" },
            ],
            logo: logoMarca,
            telefono: "+56 9 6218 8751",
            whatsapp: {
                numero: "+56 9 6218 8751",
                mensajePorDefecto:
                    "Hola Dr. Salinas, le escribo desde aquabioprocess.cl. Me gustaría conversar sobre un desafío en tratamiento de aguas o efluentes.",
            },
        },
        overrideAccess: true,
    });

    console.log("Admin...");
    await upsertAdmin(payload);

    console.log("Servicios...");
    for (const servicio of SERVICIOS_CONSULTING) {
        await upsertServicio(payload, servicio);
    }

    console.log("Cursos Academia...");
    for (const curso of CURSOS_ACADEMIA) {
        await upsertCurso(payload, curso);
    }

    console.log("Bioindicadores...");
    const imagenesBio: Record<string, string> = {};
    for (const datos of BIOINDICADORES) {
        imagenesBio[datos.slug] = await upsertBioindicador(payload, datos);
    }

    console.log("Insights...");
    await upsertArticulo(payload, imagenesBio);
    await upsertArticuloCorrosion(payload);
    await upsertNewsletterSaludDelLodo(payload);

    console.log("Paginas...");
    for (const datos of PAGINAS) {
        // Las imagenes de estos bloques se enchufan aca (los ids de Media son
        // dinamicos). Si el bloque YA tiene una imagen puesta desde el admin, se
        // respeta: el seed solo aporta la de arranque.
        if (datos.slug === "inicio") {
            const actual = await mediaDeBloque(
                payload,
                "inicio",
                "hero",
                "imagenFondo",
            );
            Object.assign(datos.bloques[0], {
                imagenFondo: actual ?? heroInicio,
            });
            const quienes = datos.bloques.find((b) => b.blockType === "quienesSomos");
            if (quienes) {
                const actualQuienes = await mediaDeBloque(
                    payload,
                    "inicio",
                    "quienesSomos",
                    "imagen",
                );
                Object.assign(quienes, { imagen: actualQuienes ?? heroConsulting });
            }
        }
        if (datos.slug === "consulting") {
            const actual = await mediaDeBloque(
                payload,
                "consulting",
                "hero",
                "imagenFondo",
            );
            Object.assign(datos.bloques[0], {
                imagenFondo: actual ?? heroConsulting,
            });
        }
        if (datos.slug === "fundador") {
            const actual = await mediaDeBloque(
                payload,
                "fundador",
                "perfil",
                "foto",
            );
            Object.assign(datos.bloques[0], { foto: actual ?? fotoFundador });
        }
        await upsertPagina(payload, datos);
    }

    console.log("Listo.");
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
