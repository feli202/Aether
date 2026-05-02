// ============================================================
// AETHER — CONFIG.JS
// ============================================================

const VERSION  = "v0.0.10D";
// En GitHub Pages varios repos comparten origen — prefijamos con el path
const SAVE_KEY = (location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") || "") + "_aether_v0010";

// ── NUMBER FORMATTING ────────────────────────────────────────
const SUFFIXES = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No"];
const NONILLON = 1e30;

function fmt(n) {
  if (!n && n !== 0) return "0";
  if (isNaN(n) || !isFinite(n)) return "∞";
  n = Math.floor(n);
  const mode = (typeof S !== "undefined") ? (S?.prefs?.notacion || "mixed") : "mixed";
  if (mode === "scientific") {
    if (n < 1000) return n.toString();
    const exp = Math.floor(Math.log10(n));
    return (n / Math.pow(10, exp)).toFixed(2) + "e" + exp;
  }
  if (n < 1000) return n.toString();
  if (n < NONILLON) {
    const tier = Math.floor(Math.log10(n) / 3);
    const suf  = SUFFIXES[tier] || "";
    const val  = n / Math.pow(10, tier * 3);
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)) + suf;
  }
  const exp = Math.floor(Math.log10(n));
  return (n / Math.pow(10, exp)).toFixed(2) + "e" + exp;
}

let _fpsLast = Date.now(), _fpsVal = 0;
function calcFPS() {
  const now = Date.now();
  if ((now - _fpsLast) / 1000 > 0.5) {
    _fpsVal  = Math.floor(prodFragmentos() * calcTickspeed());
    _fpsLast = now;
  }
  return _fpsVal;
}

// ============================================================
// INTERNACIONALIZACIÓN
// ─────────────────────────────────────────────────────────────
// Para agregar un idioma nuevo:
//   1. Copiar el bloque "en: { ... }" debajo de "en"
//   2. Cambiar la clave ("fr", "pt", "de", etc.)
//   3. Traducir todos los valores
//   4. En _aplicarTextos() agregar el botón al selector de idioma
// ─────────────────────────────────────────────────────────────
// Para agregar una clave nueva:
//   1. Agregar la clave en TODOS los idiomas (copiar del inglés si falta)
//   2. Llamar con T("clave") en el código
// ============================================================

var STRINGS = {

  // ──────────────────────────────────────────────────────────
  // ESPAÑOL
  // ──────────────────────────────────────────────────────────
  es: {
    // ── Botones principales ──────────────────────────────────
    generar:           "GENERAR",
    nucleo_activo:     "NÚCLEO ACTIVO",
    mejorar_click:     "MEJORAR CLICK",
    click_automatizado:"CLICK AUTOMATIZADO",
    click_maximizado:  "CLICK MAXIMIZADO",
    recolectar:        "Recolectar",
    comprar:           "Comprar",

    // ── Recursos / monedas ───────────────────────────────────
    fragmentos:        "Fragmentos",
    orbes:             "Orbes",
    flujo:             "Flujo",
    pulso:             "Pulso",
    cadencia:          "Cadencia",
    frags_label:       "Fragmentos",
    orbes_label:       "Orbes",
    auto_label:        "AUTO",
    niv:               "Niv",
    niv_label:         "Niv",
    frags_click:       "frags/click",
    frags_temp:        "Frags",
    temp_label:        "(temp)",
    listo:             "LISTO",
    orbes_disponibles: "ORBES DISPONIBLES",

    // ── Paneles y navegación ─────────────────────────────────
    generadores:              "Generadores",
    canalizadores:            "Canalizadores",
    interacciones:            "Interacciones",
    progreso:                 "Progreso",
    arbol:                    "ÁRBOL",
    logros:                   "LOGROS",
    ajustes:                  "AJUSTES",
    estadisticas:             "ESTADÍSTICAS",
    panelTitle_generadores:   "Generadores",
    panelTitle_canalizadores: "Canalizadores",
    panelTitle_interacciones: "Interacciones",
    panelTitle_progreso:      "Progreso",

    // ── Generadores ──────────────────────────────────────────
    gen_g1a:       "Condensador de Vacío",
    gen_g2a:       "Resonador Cuántico",
    gen_g3a:       "Acelerador de Fase",
    gen_bloqueado: "Bloqueado",
    gen_comprar:   "Comprar",
    gen_ts_label:  "TS:",
    gen_total:     "Total",
    gen_manual:    "Manual",
    gen_sint:      "sint",

    // ── Mejoras B ────────────────────────────────────────────
    mb1: "Síntesis Primaria",
    mb2: "Síntesis Secundaria",
    mb3: "Resonancia de Flujo",
    mb4: "Amplificación de Pulso",
    mb5: "Catálisis de Fase",
    mb6: "Singularidad Cadencial",

    // ── Árbol de habilidades — nodos ─────────────────────────
    nodo_poder1:    "Poder I",
    nodo_poder2:    "Poder II",
    nodo_poder3:    "Poder III",
    nodo_poder4:    "Poder IV",
    nodo_resonancia:"Resonancia",
    nodo_amplif:    "Amplificación",
    nodo_vel1:      "Velocidad I",
    nodo_vel2:      "Velocidad II",
    nodo_vel3:      "Velocidad III",
    nodo_vel4:      "Velocidad IV",
    nodo_auto:      "Autoclicker",
    nodo_turboAuto: "Turbo Auto",
    nodo_poderAuto: "Auto Potenciado",
    nodo_sinergia:  "Sinergia",
    nodo_rec_b1:    "+1 Orbe",
    nodo_rec_b2:    "+2 Orbes",
    nodo_rec_b3:    "+5 Orbes",
    nodo_rec_m1:    "x1.5 Orbes",
    nodo_rec_m2:    "x2 Orbes",
    nodo_rec_m3:    "x3 Orbes",
    nodo_rec_r1:    "Eco I",
    nodo_rec_r2:    "Eco II",
    nodo_romper:    "Romper Umbral",

    // ── Click / mejoras ──────────────────────────────────────
    click_no_max:         "Click no maximizado",
    desbloquea_auto:      "Desbloquea Autoclicker",
    nucleo_desc:          "Núcleo activo",
    nucleo_activo_label:  "Núcleo activo",
    click_max_label:      "CLICK MAXIMIZADO",

    // ── Panel de progreso — hitos ────────────────────────────
    h_primera_rec:    "Primera Recolección",
    h_6_cond:         "6 Condensadores",
    h_resonador:      "Resonador activo",
    h_10_res:         "10 Resonadores",
    h_autonomo:       "Sistema autónomo",
    h_canalizadores:  "Canalizadores activos",
    h_cadencia:       "Cadencia iniciada",
    h_ts1:            "Tickspeed x1.000",
    h_ts2:            "Tickspeed x100.000",
    h_singularidad:   "Singularidad",

    // ── Panel de progreso — hints y secciones ────────────────
    h_sec_clicks:          "CLICKS",
    h_sec_energia:         "ENERGÍA",
    h_sec_tickspeed:       "TICKSPEED",
    h_req_requisitos:      "REQUISITOS",
    h_hint_primera:        "Acumulá 1000 Fragmentos y tocá Recolectar",
    h_hint_autonomo:       "Maximizá el click (15 niv. Orbes) y comprá Autoclicker",
    h_hint_canalizadores:  "Comprá 3 Aceleradores de Fase para revelar el Panel B",
    h_hint_cadencia:       "Comprá G2B y luego G3B para iniciar la Cadencia",
    h_hint_ts:             "Acumulá Cadencia — cada umbral multiplica el Tickspeed",
    h_hint_singularidad:   "El Aether Primordial está listo para colapsar",

    h_prisma:           "Primer Prisma",
    h_catalizador:      "Primer Catalizador",
    h_hint_prisma:      "Comprá 3 Aceleradores de Fase para revelar el Prisma",
    h_hint_catalizador: "Comprá tu primer Prisma para revelar el Catalizador",
    h_sec_ts:           "TICKSPEED",
    h_cond_falta:          "más para desbloquear el Resonador Cuántico",
    h_cond_falta2:         "más para el Acelerador de Fase",

    // ── Notificaciones ───────────────────────────────────────
    umbral_roto:               "¡Umbral roto!",
    umbral_roto_desc:          "Los Orbes escalan con tus fragmentos",
    notif_primera_rec:         "¡Primera Recolección!",
    notif_primera_rec_desc:    "Ganaste un Orbe. Abre el ÁRBOL o comprá un Condensador.",
    notif_g2a_unlock:          "Resonador Cuántico desbloqueado",
    notif_g2a_unlock_desc:     "Tu segundo generador está disponible",
    notif_g3a_unlock:          "Acelerador de Fase desbloqueado",
    notif_g3a_unlock_desc:     "Genera muchos fragmentos y potencia el tickspeed",
    notif_panelB:              "Canalizadores disponibles",
    notif_panelB_desc:         "El panel B se reveló",
    notif_g2b:                 "Resonador Cuántico disponible",
    notif_g2b_desc:            "Genera Pulso — amplifica tus fragmentos",
    notif_g3b:                 "Acelerador de Cadencia disponible",
    notif_g3b_desc:            "Escala el tickspeed al límite",
    notif_click_max:           "Click temporal al máximo",
    notif_click_max_desc:      "Estos niveles se resetean al Recolectar",
    notif_click_orbes_max:     "¡Click maximizado!",
    notif_click_orbes_max_desc:"Ya podés desbloquear el Autoclicker en el Árbol",
    notif_nucleo:              "Núcleo Activo",
    notif_nucleo_desc:         "El sistema clickea automáticamente",

    // ── Energías — tooltips ──────────────────────────────────
    tip_ts_actual:      "Tickspeed actual",
    tip_prox_umbral:    "Próx. umbral",
    currencies_flujo:   "Flujo",
    currencies_pulso:   "Pulso",
    currencies_cadencia:"Cadencia",

    // ── Ajustes ──────────────────────────────────────────────
    settings_idioma:          "Idioma",
    settings_notacion:        "Notación numérica",
    settings_notacion_mixed:  "Mixta (M, B, T... / científica al límite)",
    settings_notacion_sci:    "Científica (desde 1e3)",
    settings_export:          "Exportar guardado",
    settings_import:          "Importar guardado",
    settings_audio:           "Audio",
    settings_vol_musica:      "Música",
    settings_vol_efectos:     "Efectos",
    settings_vol_latido:      "Latido del Aether",
    settings_version:         "Versión",
    settings_comunidad:       "Comunidad",
    settings_reportar:        "Reportar un error",
    settings_colaborar:       "Contacto / Colaborar",
    feedback_enviar:          "Enviar",
    feedback_enviado:         "¡Enviado! Gracias.",
    feedback_error:           "Error al enviar. Intentá de nuevo.",
    reset_btn:                "Borrar guardado",
    reset_confirm:            "¿Seguro? Se borrará todo el progreso.",
    feedback_placeholder_bug: "Describí el error que encontraste...",
    feedback_placeholder_col: "¿Querés colaborar o tenés alguna propuesta?",

    // ── Estadísticas ─────────────────────────────────────────
    stats_tiempo:       "Tiempo jugado",
    stats_recolecciones:"Recolecciones",
    stats_frags_total:  "Fragmentos generados",
    stats_orbes_total:  "Orbes acumulados",
    stats_click_nivel:  "Nivel de click",
    stats_gens_a:       "Generadores A",
    stats_gens_b:       "Generadores B",
    stats_nodos:        "Nodos del árbol",
    stats_ts:           "Tickspeed actual",
    stats_prismas:      "Prismas totales",
    stats_catalizadores:"Catalizadores",

    // ── Tutorial ─────────────────────────────────────────────
    tut_bienvenido:  "El Aether te llama.",
    tut_click:       "Tocá GENERAR para crear Fragmentos.",
    tut_mejorar:     "Mejorá tu click para hacerlo más poderoso.",
    tut_recolectar:  "Acumulá 1000 Fragmentos para Recolectar y obtener Orbes.",
    tut_arbol:       "Con Orbes podés desbloquear habilidades permanentes en el Árbol.",
    tut_generadores: "Los generadores producen Fragmentos automáticamente.",
    skip_tut:        "Omitir",
    next_tut:        "Siguiente →",

    // ── Lore — estados cósmicos ──────────────────────────────
    lore_0: "El Aether yace dormido. Sus fragmentos, dispersos. Comienza.",
    lore_1: "Una primera resonancia. El tejido recuerda lo que fue.",
    lore_2: "Las frecuencias se amplifican. El Aether responde a tu presencia.",
    lore_3: "La fase se acelera. La realidad empieza a recordar su forma.",
    lore_4: "El núcleo late solo. El Aether se restaura desde adentro.",
    lore_5: "El tejido está listo para fracturarse. Los Fragmentos de Realidad te aguardan.",

    // ── Intro ────────────────────────────────────────────────
    intro_l1:        "El tejido de la realidad se deshace en silencio.",
    intro_l2:        "Solo una presencia puede detenerlo.",
    intro_l3:        "Ya llegaste.",
    intro_despertar: "DESPERTAR",
    intro_hint:      "toca en cualquier lugar",

    // ── Simulación offline ───────────────────────────────────
    offline_afuera:  "Estuviste fuera por",
    offline_resuena: "El Aether siguió resonando.",
    offline_silencio:"El Aether aguardó en silencio.",
    offline_tejido:  "El tejido te espera.",
    offline_ganaste: "Ganaste:",

    // ── Prestige / colapso ───────────────────────────────────
    prestige_aviso_titulo: "El tejido se resquebraja.",
    prestige_aviso_desc:   "Lo que fue construido no puede sostenerse. Tu camino continúa — pero el Aether Primordial debe colapsar. Todo lo acumulado se disuelve en el vacío.",
    prestige_confirmar:    "Entiendo. Colapsar.",
    prestige_cancelar:     "Aún no.",
    colapso_final_titulo:  "El primer Fragmento de Aether existe.",
    colapso_final_desc:    "El Aether Primordial ha colapsado.<br>Sus fragmentos flotan en el vacío, esperando ser recogidos.<br><span style='color:rgba(80,130,255,0.4);font-size:0.9em'>La Capa 1 se aproxima.</span>",
    colapso_volver:        "VOLVER AL MENÚ",
    prestige_btn:          "FRACTURAR SEMI-AETHER",
    // Overlay headers
    arbol_titulo:    "ÁRBOL DE HABILIDADES",
    centrar:         "CENTRAR",
    leyenda_clicks:  "Clicks",
    leyenda_rec:     "Recolección",
    logros_titulo:   "LOGROS",
    ajustes_titulo:  "AJUSTES",
    stats_titulo:    "ESTADÍSTICAS",

    // ── Logros ───────────────────────────────────────────────
    logro_primera_rec:   "Primera Luz",
    logro_primera_rec_d: "Tu primera Recolección.",
    logro_rec_10:        "Ciclo Establecido",
    logro_rec_10_d:      "10 Recolecciones.",
    logro_rec_100:       "El Loop Infinito",
    logro_rec_100_d:     "100 Recolecciones.",
    logro_g1a_10:           "Condensación",
    logro_g1a_10_d:         "10 Condensadores comprados.",
    logro_g2a_1:         "Primera Resonancia",
    logro_g2a_1_d:       "Tu primer Resonador Cuántico.",
    logro_g3a_1:         "Aceleración",
    logro_g3a_1_d:       "Tu primer Acelerador de Fase.",
    logro_g1b_1:         "Flujo Inicial",
    logro_g1b_1_d:       "Tu primer Canalizador.",
    logro_g3b_1:         "Cadencia",
    logro_g3b_1_d:       "Tu primer Acelerador de Cadencia.",
    logro_auto_on:          "Manos Libres",
    logro_auto_on_d:        "El click se automatizó.",
    logro_romper_on:        "Sin Límites",
    logro_romper_on_d:      "Rompiste el umbral.",
    logro_cad_100:        "Primer Umbral",
    logro_cad_100_d:      "Cadencia llegó a 100.",
    logro_cad_1k:         "Resonancia Total",
    logro_cad_1k_d:       "Cadencia llegó a 1000.",
    logro_orbes_1k:         "Coleccionista",
    logro_orbes_1k_d:       "1000 Orbes acumulados.",

    // ── Overlays — títulos y botones ────────────────────────────
    arbol_titulo:      "ÁRBOL DE HABILIDADES",
    centrar:           "CENTRAR",
    cerrar:            "CERRAR",
    ajustes_titulo:    "AJUSTES",
    stats_titulo:      "ESTADÍSTICAS",
    logros_titulo:     "LOGROS",
    leyenda_clicks:    "Clicks",
    leyenda_rec:       "Recolección",
    recoleccion_label: "Recolección",

    // ── Prisma / Catalizador ─────────────────────────────────────
    prisma_nombre:           "Prisma",
    catalizador_nombre:      "Catalizador",
    prisma_info:             "Resetea Frags y GA. Multiplica producción.",
    catalizador_info:        "Resetea Prismas. Multiplica Tickspeed permanente.",
    prisma_mult:             "Producción GA",
    catalizador_mult:        "Tickspeed",
    prisma_costo_label:      "Costo",
    prisma_req_label:        "Requiere",
    prisma_activos:          "Activos",
    prisma_total:            "Total",
    notif_prisma:            "¡Prisma activado!",
    notif_prisma_desc:       "Multiplicador",
    notif_prisma_unlock:     "El Aether puede fracturarse.",
    notif_prisma_unlock_desc:"En la fractura, crece. Comprar un Prisma resetea tus generadores — pero multiplica todo lo que producen.",
    notif_catalizador:       "¡Catalizador activado!",
    notif_catalizador_unlock:"Catalizador disponible",
    notif_catalizador_unlock_desc:"Compra tu primer Catalizador",
    logro_prisma_1:          "Primera Fractura",
    logro_prisma_1_d:        "Tu primer Prisma.",
    logro_cat_1:             "Catálisis",
    logro_cat_1_d:           "Tu primer Catalizador.",
    // ── Árbol — estado y descripciones ───────────────────────────
    nodo_comprado:       "Comprado",
    desc_poder1:    "Click +3 frags base",
    desc_poder2:    "Click x1.5",
    desc_poder3:    "Click x2",
    desc_poder4:    "Click x3",
    desc_resonancia:"+15% click por recolección (máx +300%)",
    desc_amplif:    "Cada 5 mejoras de click +8% al poder",
    desc_vel1:      "Cooldown -25%",
    desc_vel2:      "Cooldown -25% adicional",
    desc_vel3:      "Cooldown -20% adicional",
    desc_vel4:      "Cooldown -20% adicional",
    desc_auto:      "10 clicks/s. Requiere click al máximo.",
    desc_turboAuto: "20 clicks/s",
    desc_poderAuto: "Clicks automáticos x2",
    desc_sinergia:  "Cada nivel de velocidad suma +1 frag/click",
    desc_rec_b1:    "+1 Orbe por recolección",
    desc_rec_b2:    "+2 Orbes por recolección",
    desc_rec_b3:    "+5 Orbes por recolección",
    desc_rec_m1:    "Orbes x1.5",
    desc_rec_m2:    "Orbes x2",
    desc_rec_m3:    "Orbes x3",
    desc_rec_r1:    "Orbes x Rec^0.1",
    desc_rec_r2:    "Orbes x Rec^0.2 adicional",
    desc_romper:    "Orbes escalan con Fragmentos",
  },

  // ──────────────────────────────────────────────────────────
  // ENGLISH
  // ──────────────────────────────────────────────────────────
  en: {
    // ── Main buttons ─────────────────────────────────────────
    generar:           "GENERATE",
    nucleo_activo:     "ACTIVE CORE",
    mejorar_click:     "ENHANCE CLICK",
    click_automatizado:"AUTOMATED CLICK",
    click_maximizado:  "CLICK MAXIMIZED",
    recolectar:        "Harvest",
    comprar:           "Buy",

    // ── Resources / currencies ───────────────────────────────
    fragmentos:        "Fragments",
    orbes:             "Orbs",
    flujo:             "Flow",
    pulso:             "Pulse",
    cadencia:          "Cadence",
    frags_label:       "Fragments",
    orbes_label:       "Orbs",
    auto_label:        "AUTO",
    niv:               "Lv",
    niv_label:         "Lv",
    frags_click:       "frags/click",
    frags_temp:        "Frags",
    temp_label:        "(temp)",
    listo:             "READY",
    orbes_disponibles: "ORBS AVAILABLE",

    // ── Panels and navigation ────────────────────────────────
    generadores:              "Generators",
    canalizadores:            "Channelers",
    interacciones:            "Interactions",
    progreso:                 "Progress",
    arbol:                    "TREE",
    logros:                   "ACHIEVEMENTS",
    ajustes:                  "SETTINGS",
    estadisticas:             "STATISTICS",
    panelTitle_generadores:   "Generators",
    panelTitle_canalizadores: "Channelers",
    panelTitle_interacciones: "Interactions",
    panelTitle_progreso:      "Progress",

    // ── Generators ───────────────────────────────────────────
    gen_g1a:       "Void Condenser",
    gen_g2a:       "Quantum Resonator",
    gen_g3a:       "Phase Accelerator",
    gen_bloqueado: "Locked",
    gen_comprar:   "Buy",
    gen_ts_label:  "TS:",
    gen_total:     "Total",
    gen_manual:    "Manual",
    gen_sint:      "synth",

    // ── B upgrades ───────────────────────────────────────────
    mb1: "Primary Synthesis",
    mb2: "Secondary Synthesis",
    mb3: "Flow Resonance",
    mb4: "Pulse Amplification",
    mb5: "Phase Catalysis",
    mb6: "Cadential Singularity",

    // ── Skill tree — nodes ───────────────────────────────────
    nodo_poder1:    "Power I",
    nodo_poder2:    "Power II",
    nodo_poder3:    "Power III",
    nodo_poder4:    "Power IV",
    nodo_resonancia:"Resonance",
    nodo_amplif:    "Amplification",
    nodo_vel1:      "Speed I",
    nodo_vel2:      "Speed II",
    nodo_vel3:      "Speed III",
    nodo_vel4:      "Speed IV",
    nodo_auto:      "Autoclicker",
    nodo_turboAuto: "Turbo Auto",
    nodo_poderAuto: "Powered Auto",
    nodo_sinergia:  "Synergy",
    nodo_rec_b1:    "+1 Orb",
    nodo_rec_b2:    "+2 Orbs",
    nodo_rec_b3:    "+5 Orbs",
    nodo_rec_m1:    "x1.5 Orbs",
    nodo_rec_m2:    "x2 Orbs",
    nodo_rec_m3:    "x3 Orbs",
    nodo_rec_r1:    "Echo I",
    nodo_rec_r2:    "Echo II",
    nodo_romper:    "Break Threshold",

    // ── Click / upgrades ─────────────────────────────────────
    click_no_max:        "Click not maximized",
    desbloquea_auto:     "Unlock Autoclicker",
    nucleo_desc:         "Core active",
    nucleo_activo_label: "Core active",
    click_max_label:     "CLICK MAXIMIZED",

    // ── Progress panel — milestones ──────────────────────────
    h_primera_rec:   "First Harvest",
    h_6_cond:        "6 Condensers",
    h_resonador:     "Resonator active",
    h_10_res:        "10 Resonators",
    h_autonomo:      "Autonomous system",
    h_canalizadores: "Channelers active",
    h_cadencia:      "Cadence initiated",
    h_ts1:           "Tickspeed x1,000",
    h_ts2:           "Tickspeed x100,000",
    h_singularidad:  "Singularity",

    // ── Progress panel — hints and sections ──────────────────
    h_sec_clicks:         "CLICKS",
    h_sec_energia:        "ENERGY",
    h_sec_tickspeed:      "TICKSPEED",
    h_req_requisitos:     "REQUIREMENTS",
    h_hint_primera:       "Accumulate 1000 Fragments and touch Harvest",
    h_hint_autonomo:      "Maximize click (15 Orb levels) and buy Autoclicker",
    h_hint_canalizadores: "Buy 3 Phase Accelerators to reveal Panel B",
    h_hint_cadencia:      "Buy G2B then G3B to initiate Cadence",
    h_hint_ts:            "Accumulate Cadence — each threshold multiplies Tickspeed",
    h_hint_singularidad:  "The Primordial Aether is ready to collapse",

    h_prisma:           "First Prism",
    h_catalizador:      "First Catalyst",
    h_hint_prisma:      "Buy 3 Phase Accelerators to reveal the Prism",
    h_hint_catalizador: "Buy your first Prism to reveal the Catalyst",
    h_sec_ts:           "TICKSPEED",
    h_cond_falta:         "more to unlock the Quantum Resonator",
    h_cond_falta2:        "more to unlock the Phase Accelerator",

    // ── Notifications ────────────────────────────────────────
    umbral_roto:               "Threshold broken!",
    umbral_roto_desc:          "Orbs now scale with your Fragments",
    notif_primera_rec:         "First Harvest!",
    notif_primera_rec_desc:    "You gained an Orb. Open the TREE or buy a Condenser.",
    notif_g2a_unlock:          "Quantum Resonator unlocked",
    notif_g2a_unlock_desc:     "Your second generator is available",
    notif_g3a_unlock:          "Phase Accelerator unlocked",
    notif_g3a_unlock_desc:     "Generates many fragments and powers the tickspeed",
    notif_panelB:              "Channelers available",
    notif_panelB_desc:         "Panel B has been revealed",
    notif_g2b:                 "Quantum Resonator available",
    notif_g2b_desc:            "Generates Pulse — amplifies your fragments",
    notif_g3b:                 "Cadence Accelerator available",
    notif_g3b_desc:            "Scales the tickspeed to the limit",
    notif_click_max:           "Temporary click maximized",
    notif_click_max_desc:      "These levels reset on Harvest",
    notif_click_orbes_max:     "Click maximized!",
    notif_click_orbes_max_desc:"You can now unlock the Autoclicker in the Tree",
    notif_nucleo:              "Active Core",
    notif_nucleo_desc:         "The system clicks automatically",

    // ── Energies — tooltips ──────────────────────────────────
    tip_ts_actual:       "Current tickspeed",
    tip_prox_umbral:     "Next threshold",
    currencies_flujo:    "Flow",
    currencies_pulso:    "Pulse",
    currencies_cadencia: "Cadence",

    // ── Settings ─────────────────────────────────────────────
    settings_idioma:         "Language",
    settings_notacion:       "Number notation",
    settings_notacion_mixed: "Mixed (M, B, T... / scientific at limit)",
    settings_notacion_sci:   "Scientific (from 1e3)",
    settings_export:         "Export save",
    settings_import:         "Import save",
    settings_audio:          "Audio",
    settings_vol_musica:     "Music",
    settings_vol_efectos:    "Effects",
    settings_vol_latido:     "Aether Heartbeat",
    settings_version:        "Version",
    settings_comunidad:      "Community",
    settings_reportar:       "Report a bug",
    settings_colaborar:      "Contact / Collaborate",
    feedback_enviar:         "Send",
    feedback_enviado:        "Sent! Thank you.",
    feedback_error:          "Failed to send. Please try again.",
    reset_btn:               "Delete save",
    reset_confirm:           "Are you sure? All progress will be lost.",
    feedback_placeholder_bug:"Describe the bug you found...",
    feedback_placeholder_col:"Want to collaborate or have a proposal?",

    // ── Statistics ───────────────────────────────────────────
    stats_tiempo:       "Time played",
    stats_recolecciones:"Harvests",
    stats_frags_total:  "Fragments generated",
    stats_orbes_total:  "Orbs accumulated",
    stats_click_nivel:  "Click level",
    stats_gens_a:       "Generators A",
    stats_gens_b:       "Generators B",
    stats_nodos:        "Tree nodes",
    stats_ts:           "Current tickspeed",
    stats_prismas:      "Total Prisms",
    stats_catalizadores:"Catalysts",

    // ── Tutorial ─────────────────────────────────────────────
    tut_bienvenido:  "The Aether calls to you.",
    tut_click:       "Touch GENERATE to create Fragments.",
    tut_mejorar:     "Enhance your click to make it more powerful.",
    tut_recolectar:  "Accumulate 1000 Fragments to Harvest and receive Orbs.",
    tut_arbol:       "With Orbs you can unlock permanent abilities in the Tree.",
    tut_generadores: "Generators produce Fragments automatically.",
    skip_tut:        "Skip",
    next_tut:        "Next →",

    // ── Lore — cosmic states ─────────────────────────────────
    lore_0: "The Aether lies dormant. Its fragments, scattered. Begin.",
    lore_1: "A first resonance. The fabric remembers what it once was.",
    lore_2: "The frequencies amplify. The Aether responds to your presence.",
    lore_3: "The phase accelerates. Reality begins to recall its form.",
    lore_4: "The core beats alone. The Aether restores itself from within.",
    lore_5: "The fabric is ready to fracture. The Fragments of Reality await.",

    // ── Intro ────────────────────────────────────────────────
    intro_l1:        "The fabric of reality unravels in silence.",
    intro_l2:        "Only one presence can stop it.",
    intro_l3:        "You have arrived.",
    intro_despertar: "AWAKEN",
    intro_hint:      "touch anywhere",

    // ── Offline simulation ───────────────────────────────────
    offline_afuera:  "You were away for",
    offline_resuena: "The Aether kept resonating.",
    offline_silencio:"The Aether waited in silence.",
    offline_tejido:  "The fabric awaits you.",
    offline_ganaste: "You gained:",

    // ── Prestige / collapse ──────────────────────────────────
    prestige_aviso_titulo: "The fabric begins to fracture.",
    prestige_aviso_desc:   "What has been built cannot sustain itself. Your path continues — but the Primordial Aether must collapse. All that was gathered dissolves into the void.",
    prestige_confirmar:    "I understand. Collapse.",
    prestige_cancelar:     "Not yet.",
    colapso_final_titulo:  "The first Aether Fragment exists.",
    colapso_final_desc:    "The Primordial Aether has collapsed.<br>Its fragments drift in the void, waiting to be gathered.<br><span style='color:rgba(80,130,255,0.4);font-size:0.9em'>Layer 1 approaches.</span>",
    colapso_volver:        "RETURN TO MENU",
    prestige_btn:          "FRACTURE SEMI-AETHER",
    // Overlay headers
    arbol_titulo:    "SKILL TREE",
    centrar:         "CENTER",
    leyenda_clicks:  "Clicks",
    leyenda_rec:     "Harvest",
    logros_titulo:   "ACHIEVEMENTS",
    ajustes_titulo:  "SETTINGS",
    stats_titulo:    "STATISTICS",

    // ── Achievements ─────────────────────────────────────────
    logro_primera_rec:   "First Light",
    logro_primera_rec_d: "Your first Harvest.",
    logro_rec_10:        "Cycle Established",
    logro_rec_10_d:      "10 Harvests.",
    logro_rec_100:       "The Infinite Loop",
    logro_rec_100_d:     "100 Harvests.",
    logro_g1a_10:           "Condensation",
    logro_g1a_10_d:         "10 Condensers purchased.",
    logro_g2a_1:         "First Resonance",
    logro_g2a_1_d:       "Your first Quantum Resonator.",
    logro_g3a_1:         "Acceleration",
    logro_g3a_1_d:       "Your first Phase Accelerator.",
    logro_g1b_1:         "Initial Flow",
    logro_g1b_1_d:       "Your first Channeler.",
    logro_g3b_1:         "Cadence",
    logro_g3b_1_d:       "Your first Cadence Accelerator.",
    logro_auto_on:          "Hands Free",
    logro_auto_on_d:        "The click was automated.",
    logro_romper_on:        "No Limits",
    logro_romper_on_d:      "You broke the threshold.",
    logro_cad_100:        "First Threshold",
    logro_cad_100_d:      "Cadence reached 100.",
    logro_cad_1k:         "Total Resonance",
    logro_cad_1k_d:       "Cadence reached 1000.",
    logro_orbes_1k:         "Collector",
    logro_orbes_1k_d:       "1000 Orbs accumulated.",

    // ── Overlays — titles and buttons ───────────────────────────
    arbol_titulo:      "SKILL TREE",
    centrar:           "CENTER",
    cerrar:            "CLOSE",
    ajustes_titulo:    "SETTINGS",
    stats_titulo:      "STATISTICS",
    logros_titulo:     "ACHIEVEMENTS",
    leyenda_clicks:    "Clicks",
    leyenda_rec:       "Harvest",
    recoleccion_label: "Harvest",

    // ── Prisma / Catalizador ─────────────────────────────────────
    prisma_nombre:           "Prism",
    catalizador_nombre:      "Catalyst",
    prisma_info:             "Resets Frags and GA. Multiplies production.",
    catalizador_info:        "Resets Prisms. Permanently multiplies Tickspeed.",
    prisma_mult:             "GA Production",
    catalizador_mult:        "Tickspeed",
    prisma_costo_label:      "Cost",
    prisma_req_label:        "Requires",
    prisma_activos:          "Active",
    prisma_total:            "Total",
    notif_prisma:            "Prism activated!",
    notif_prisma_desc:       "Multiplier",
    notif_prisma_unlock:     "The Aether can fracture.",
    notif_prisma_unlock_desc:"In the fracture, it grows. Buying a Prism resets your generators — but multiplies everything they produce.",
    notif_catalizador:       "Catalyst activated!",
    notif_catalizador_unlock:"Catalyst available",
    notif_catalizador_unlock_desc:"Buy your first Catalyst",
    logro_prisma_1:          "First Fracture",
    logro_prisma_1_d:        "Your first Prism.",
    logro_cat_1:             "Catalysis",
    logro_cat_1_d:           "Your first Catalyst.",
    // ── Tree — state and descriptions ───────────────────────────
    nodo_comprado:       "Purchased",
    desc_poder1:    "Click +3 base frags",
    desc_poder2:    "Click x1.5",
    desc_poder3:    "Click x2",
    desc_poder4:    "Click x3",
    desc_resonancia:"+15% click per harvest (max +300%)",
    desc_amplif:    "Every 5 click upgrades +8% power",
    desc_vel1:      "Cooldown -25%",
    desc_vel2:      "Cooldown -25% more",
    desc_vel3:      "Cooldown -20% more",
    desc_vel4:      "Cooldown -20% more",
    desc_auto:      "10 clicks/s. Requires max click.",
    desc_turboAuto: "20 clicks/s",
    desc_poderAuto: "Auto clicks x2",
    desc_sinergia:  "Each speed level adds +1 frag/click",
    desc_rec_b1:    "+1 Orb per harvest",
    desc_rec_b2:    "+2 Orbs per harvest",
    desc_rec_b3:    "+5 Orbs per harvest",
    desc_rec_m1:    "Orbs x1.5",
    desc_rec_m2:    "Orbs x2",
    desc_rec_m3:    "Orbs x3",
    desc_rec_r1:    "Orbs x Harvest^0.1",
    desc_rec_r2:    "Orbs x Harvest^0.2 more",
    desc_romper:    "Orbs scale with Fragments",
  },

}; // fin STRINGS

// ── T() — traductor principal ─────────────────────────────────
// Devuelve el string en el idioma activo.
// Si la clave no existe en el idioma activo, cae al inglés.
// Si tampoco existe en inglés, devuelve la clave (útil para debug).
function T(key) {
  let lang = "en";
  try {
    if (typeof S !== "undefined" && S?.prefs?.idioma) {
      lang = S.prefs.idioma;
    } else {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        lang = JSON.parse(saved)?.prefs?.idioma || "en";
      }
      // Sin save = inglés por defecto siempre
    }
  } catch(e) {
    lang = "en";
  }
  return STRINGS[lang]?.[key] ?? STRINGS["en"]?.[key] ?? key;
}

// TL() — label traducido desde un objeto de CONFIG (usa labelKey si está presente)
function TL(cfg) {
  if (cfg.labelKey) return T(cfg.labelKey);
  return cfg.label || cfg.id;
}

function getLoreEstado(idx) { return T("lore_" + idx); }

const CONFIG = {
  currencies: {
    fragmentos: { labelKey:"fragmentos", color:"#00d4ff" },
    orbes:      { labelKey:"orbes",      color:"#a78bfa" },
    flujo:      { labelKey:"flujo",      color:"#34d399" },
    pulso:      { labelKey:"pulso",      color:"#f59e0b" },
  },
  recolectar: { umbral:1000 },
  click: { costoBase:1, costoEscala:1, cooldownBase:800 },
  CLICK_MAX_ORBES: 15,

  generadoresA: [
    { id:"g1a", labelKey:"gen_g1a", costoBase:2,   costoMult:1.5,  prod:2.0 },
    { id:"g2a", labelKey:"gen_g2a", costoBase:20,  costoMult:1.65, prod:3   },
    { id:"g3a", labelKey:"gen_g3a", costoBase:200, costoMult:1.85, prod:8   },
  ],

  // ── RESET LAYERS ────────────────────────────────────────────
  prisma: {
    labelKey:      "prisma_nombre",
    costoBase:     40,    // Orbes para el primero
    costoMult:     1.8,   // escala x2 por Prisma activo
    multProd:      1.3,   // x1.2^n a producción GA
  },
  catalizador: {
    labelKey:           "catalizador_nombre",
    multTS:             2.2,    // x1.8^n a Tickspeed (permanente)
    umbralesReq:        [3, 5, 8, 12, 18], // Prismas necesarios por compra
    catalizadoresParaPrestige: 4,
  },

  CLICK_MAX_ORBES: 15,

  arbol: [
    // ── CLICKS ──────────────────────────────────────────────────
    { id:"poder1",     sec:"clicks", labelKey:"nodo_poder1", label_IGNORE:"Poder I",         desc:"Click +3 frags base", descKey:"desc_poder1",                          costo:1,   req:null,         efecto:{ tipo:"bonus_click_flat", val:3 }, x:-200, y:-120 },
    { id:"poder2",     sec:"clicks", labelKey:"nodo_poder2", label_IGNORE:"Poder II",        desc:"Click x1.5", descKey:"desc_poder2",                                   costo:12,  req:"poder1",     efecto:{ tipo:"mult_click", val:1.5    }, x:-300, y:-120 },
    { id:"poder3",     sec:"clicks", labelKey:"nodo_poder3", label_IGNORE:"Poder III",       desc:"Click x2", descKey:"desc_poder3",                                     costo:35,  req:"poder2",     efecto:{ tipo:"mult_click", val:2.0    }, x:-400, y:-120 },
    { id:"poder4",     sec:"clicks", labelKey:"nodo_poder4", label_IGNORE:"Poder IV",        desc:"Click x3", descKey:"desc_poder4",                                     costo:90,  req:"poder3",     efecto:{ tipo:"mult_click", val:3.0    }, x:-500, y:-120 },
    { id:"resonancia", sec:"clicks", labelKey:"nodo_resonancia", label_IGNORE:"Resonancia",      desc:"+15% click por recoleccion (max +300%)", descKey:"desc_resonancia",        costo:180, req:"poder4",     efecto:{ tipo:"resonancia"             }, x:-580, y:-200 },
    { id:"amplif",     sec:"clicks", labelKey:"nodo_amplif", label_IGNORE:"Amplificacion",   desc:"Cada 5 mejoras de click +8% al poder", descKey:"desc_amplif",         costo:300, req:"resonancia", efecto:{ tipo:"amplificacion"          }, x:-660, y:-120 },
    { id:"vel1",       sec:"clicks", labelKey:"nodo_vel1", label_IGNORE:"Velocidad I",     desc:"Cooldown -25%", descKey:"desc_vel1",                                costo:1,   req:null,         efecto:{ tipo:"mult_cd", val:0.75      }, x:-200, y:-20  },
    { id:"vel2",       sec:"clicks", labelKey:"nodo_vel2", label_IGNORE:"Velocidad II",    desc:"Cooldown -25% adicional", descKey:"desc_vel2",                      costo:10,  req:"vel1",       efecto:{ tipo:"mult_cd", val:0.75      }, x:-300, y:-20  },
    { id:"vel3",       sec:"clicks", labelKey:"nodo_vel3", label_IGNORE:"Velocidad III",   desc:"Cooldown -20% adicional", descKey:"desc_vel3",                      costo:30,  req:"vel2",       efecto:{ tipo:"mult_cd", val:0.80      }, x:-400, y:-20  },
    { id:"vel4",       sec:"clicks", labelKey:"nodo_vel4", label_IGNORE:"Velocidad IV",    desc:"Cooldown -20% adicional", descKey:"desc_vel4",                      costo:70,  req:"vel3",       efecto:{ tipo:"mult_cd", val:0.80      }, x:-500, y:-20  },
    { id:"auto",       sec:"clicks", labelKey:"nodo_auto", label_IGNORE:"Autoclicker",     desc:"10 clicks/s. Requiere click al maximo.", descKey:"desc_auto",       costo:120, req:"vel4",       efecto:{ tipo:"autoclicker"            }, x:-580, y:-70  },
    { id:"turboAuto",  sec:"clicks", labelKey:"nodo_turboAuto", label_IGNORE:"Turbo Auto",      desc:"20 clicks/s", descKey:"desc_turboAuto",                                  costo:280, req:"auto",       efecto:{ tipo:"turbo_auto"             }, x:-660, y:-10  },
    { id:"poderAuto",  sec:"clicks", labelKey:"nodo_poderAuto", label_IGNORE:"Auto Potenciado", desc:"Clicks automaticos x2", descKey:"desc_poderAuto",                        costo:280, req:"auto",       efecto:{ tipo:"poder_auto"             }, x:-660, y:-130 },
    { id:"sinergia",   sec:"clicks", labelKey:"nodo_sinergia", label_IGNORE:"Sinergia",        desc:"Cada nivel de velocidad suma +1 frag/click", descKey:"desc_sinergia",   costo:5,   req:"vel1",       efecto:{ tipo:"sinergia_vel"           }, x:-300, y:-70  },

    // ── RECOLECCION — fix3: costos reducidos ~35% ────────────────
    { id:"rec_b1",     sec:"recoleccion", labelKey:"nodo_rec_b1", label_IGNORE:"+1 Orbe",    desc:"+1 Orbe por recoleccion", descKey:"desc_rec_b1",                     costo:2,   req:null,         efecto:{ tipo:"bonus_orbe", val:1      }, x:200,  y:-80  },
    { id:"rec_b2",     sec:"recoleccion", labelKey:"nodo_rec_b2", label_IGNORE:"+2 Orbes",   desc:"+2 Orbes por recoleccion", descKey:"desc_rec_b2",                    costo:8,   req:"rec_b1",     efecto:{ tipo:"bonus_orbe", val:2      }, x:300,  y:-80  },
    { id:"rec_b3",     sec:"recoleccion", labelKey:"nodo_rec_b3", label_IGNORE:"+5 Orbes",   desc:"+5 Orbes por recoleccion", descKey:"desc_rec_b3",                    costo:22,  req:"rec_b2",     efecto:{ tipo:"bonus_orbe", val:5      }, x:400,  y:-80  },
    { id:"rec_m1",     sec:"recoleccion", labelKey:"nodo_rec_m1", label_IGNORE:"x1.5 Orbes", desc:"Orbes x1.5", descKey:"desc_rec_m1",                                  costo:4,   req:"rec_b1",     efecto:{ tipo:"mult_orbe",  val:1.5    }, x:300,  y:0    },
    { id:"rec_m2",     sec:"recoleccion", labelKey:"nodo_rec_m2", label_IGNORE:"x2 Orbes",   desc:"Orbes x2", descKey:"desc_rec_m2",                                    costo:14,  req:"rec_m1",     efecto:{ tipo:"mult_orbe",  val:2.0    }, x:400,  y:0    },
    { id:"rec_r1",     sec:"recoleccion", labelKey:"nodo_rec_r1", label_IGNORE:"Eco I",       desc:"Orbes x Rec^0.1", descKey:"desc_rec_r1",                            costo:40,  req:"rec_b3",     efecto:{ tipo:"eco_rec",    val:0.1    }, x:500,  y:-80  },
    { id:"rec_r2",     sec:"recoleccion", labelKey:"nodo_rec_r2", label_IGNORE:"Eco II",      desc:"Orbes x Rec^0.2 adicional", descKey:"desc_rec_r2",                  costo:85,  req:"rec_r1",     efecto:{ tipo:"eco_rec",    val:0.2    }, x:580,  y:-80  },
    { id:"rec_m3",     sec:"recoleccion", labelKey:"nodo_rec_m3", label_IGNORE:"x3 Orbes",   desc:"Orbes x3", descKey:"desc_rec_m3",                                    costo:150, req:"rec_r2",     efecto:{ tipo:"mult_orbe",  val:3.0    }, x:580,  y:0    },
    { id:"romper",     sec:"recoleccion", labelKey:"nodo_romper", label_IGNORE:"Romper Umbral",desc:"Orbes escalan con Fragmentos. Flujo +5%/500.", descKey:"desc_romper",costo:320, req:"rec_m3",   efecto:{ tipo:"romper"                 }, x:660,  y:-40  },
  ],

  logros: [
    { id:"primera_rec", cond:{ tipo:"recolecciones", val:1    } },
    { id:"rec_10",      cond:{ tipo:"recolecciones", val:10   } },
    { id:"rec_100",     cond:{ tipo:"recolecciones", val:100  } },
    { id:"g1a_10",      cond:{ tipo:"gen_comp", gen:"g1a", val:10 } },
    { id:"g2a_1",       cond:{ tipo:"gen_comp", gen:"g2a", val:1  } },
    { id:"g3a_1",       cond:{ tipo:"gen_comp", gen:"g3a", val:1  } },
    { id:"prisma_1",    cond:{ tipo:"prismas",  val:1  } },
    { id:"cat_1",       cond:{ tipo:"catalizadores", val:1 } },
    { id:"auto_on",     cond:{ tipo:"arbol", nodo:"auto"   } },
    { id:"romper_on",   cond:{ tipo:"arbol", nodo:"romper" } },
    { id:"orbes_1k",    cond:{ tipo:"orbes_tot", val:1000  } },
  ],
};