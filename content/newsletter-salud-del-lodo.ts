/**
 * Contenido estructurado de la edicion 01 del newsletter «Salud del Lodo».
 * Sale del PDF del tio; la pagina lo renderiza en tarjetas (no solo texto plano).
 * Las imagenes viven en public/ (extraidas con scripts/extract-cambios-pdfs.py).
 */

export const SALUD_DEL_LODO = {
  slug: 'salud-del-lodo',
  titulo: 'Salud del Lodo',
  bajada: 'El pulso biológico que define el desempeño del tratamiento',
  intro:
    'De la carga afluente a la calidad efluente: leer, diagnosticar y proteger la biomasa antes de que el proceso falle.',
  // Marcas que colaboran en esta edicion (no son items de menu).
  lineas: ['Academy', 'Insights', 'Technologies'] as const,
  vision: {
    titulo: 'Una visión más amplia que “sedimentar bien”',
    texto:
      'En lodos activados, MBBR, IFAS y sistemas RAS de piscicultura, la Salud del Lodo —o, con mayor precisión, la salud de la biomasa biológica— describe la aptitud integral del ecosistema microbiano para transformar los contaminantes objetivo, conservar una estructura funcional y responder con estabilidad a las condiciones reales de operación.',
  },
  definicion: {
    titulo: 'Definición operacional',
    texto:
      'Un lodo o biofilm saludable posee la cantidad, estructura, diversidad y actividad metabólica necesarias para remover de manera estable los contaminantes objetivo, retener la biomasa dentro del sistema y producir consistentemente la calidad de efluente requerida.',
  },
  // Infografias del PDF (mostrar enteras). El logo/ilustracion de marca se omite a proposito.
  imagenInteraccion: {
    src: '/newsletter-salud-2.jpg',
    alt: 'Interacción afluente / efluente y su impacto en la salud del lodo.',
    width: 1600,
    height: 1066,
  },
  imagenSoporte: {
    src: '/newsletter-salud-3.jpg',
    alt: 'Ingeniería, equipos e instrumentación que sostienen el proceso biológico.',
    width: 1600,
    height: 1066,
  },
  dimensiones: [
    {
      titulo: 'Afluente',
      detalle: 'DBO/DQO, NH4-N, SST, C:N:P, pH, alcalinidad, temperatura, salinidad e inhibidores.',
    },
    {
      titulo: 'Fisiología',
      detalle: 'OUR/SOUR, consumo de sustrato, nitrificación, desnitrificación y respuesta metabólica.',
    },
    {
      titulo: 'Microbiología',
      detalle: 'Flóculo, filamentosas, bacterias dispersas, protozoos, metazoos y condición del biofilm.',
    },
    {
      titulo: 'Estructura física',
      detalle: 'Tamaño y compactación del flóculo, EPS, biofilm, sloughing, SV30 e IVL.',
    },
    {
      titulo: 'Inventario',
      detalle: 'MLSS/MLVSS, SRT, purga, retención efectiva y masa de biofilm.',
    },
    {
      titulo: 'Ambiente reactor',
      detalle: 'OD, pH, alcalinidad, temperatura, mezcla, F/M, carga volumétrica y HRT.',
    },
    {
      titulo: 'Ingeniería / equipos',
      detalle: 'Aireación, mezcla, bombeo, RAS/WAS, carriers, clarificación, instrumentación y mantenimiento.',
    },
    {
      titulo: 'Efluente',
      detalle: 'DBO/DQO, SST, NH4-N, NO2-N, NO3-N, N/P, turbidez y estabilidad de calidad.',
    },
  ],
  diagnostico: {
    titulo: 'Diagnóstico integrado: del microscopio al desempeño',
    intro:
      'La microscopía es una herramienta de diagnóstico; la confirmación proviene de integrar biología, hidráulica, química y resultado efluente.',
    microscopia: [
      'Registrar flóculo: tamaño, compactación, bordes, puentes filamentosos, bacterias dispersas y diversidad.',
      'En lodos activados, curva de sedimentación en probeta de 1 L: 0, 5, 10, 15, 20, 25 y 30 min.',
      'Interpretar SV30 e IVL junto con MLSS y SRT; un SV30 alto, por sí solo, no demuestra bulking filamentoso.',
      'Confirmar con sobrenadante, interfase, sólidos flotantes y desempeño del clarificador.',
    ],
    signos: [
      { titulo: 'Alimento', detalle: 'Carga aplicada y fracción biodegradable.' },
      { titulo: 'Respiración', detalle: 'OD + OUR/SOUR.' },
      { titulo: 'Nutrición', detalle: 'C:N:P y alcalinidad.' },
      { titulo: 'Edad y cantidad', detalle: 'SRT + MLSS/MLVSS o inventario de biofilm.' },
      { titulo: 'Estructura', detalle: 'Flóculo / biofilm / EPS / filamentos.' },
      { titulo: 'Resultado', detalle: 'DQO/DBO, SST, NH4, NO2, NO3 y P según el objetivo.' },
    ],
    clave:
      '“Tener biomasa” no significa “tener biomasa activa”. El MLSS debe interpretarse junto con actividad, estructura y rendimiento.',
  },
  tecnologias: [
    {
      titulo: 'Lodos activados',
      detalle:
        'Biomasa suspendida. Priorizar flóculo, filamentos, SV30/IVL, SRT, RAS/WAS, clarificador y OUR/SOUR.',
    },
    {
      titulo: 'MBBR',
      detalle:
        'Biomasa adherida. Priorizar cobertura y espesor de biofilm, movimiento de carriers, sloughing, transferencia de O₂ y tasa de remoción.',
    },
    {
      titulo: 'IFAS',
      detalle:
        'Dos ecosistemas: suspendido + adherido. Evaluar ambos; el biofilm puede sostener nitrificación aun con un SRT suspendido menor.',
    },
    {
      titulo: 'RAS piscicultura',
      detalle:
        'Prioridad: proteger peces — TAN/NH₃, NO2-N, NO3-N, OD, pH, alcalinidad y confiabilidad del biofiltro.',
    },
  ],
  soporte: {
    titulo: 'Soporte vital = ingeniería + equipos + instrumentación + mantenimiento',
    texto:
      'Difusores, sopladores, mezcladores, bombas, RAS/WAS, retención de carriers, clarificación, sensores, alarmas y respaldo energético son parte del sistema biológico: una falla mecánica puede convertirse rápidamente en una falla microbiológica.',
  },
  cierre:
    'Dr. Miguel Salinas Maldonado — Founder & Principal Consultant | AquaBioProcess. Science behind the process. Experience behind the solution.',
} as const
