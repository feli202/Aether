// ============================================================
// AETHER — STATE.JS
// ============================================================

function crearEstado() {
  const gensA = {};
  CONFIG.generadoresA.forEach(c => {
    gensA[c.id] = { comprados:0, sinteticos:0, costo:c.costoBase };
  });
  const arbol  = {};  CONFIG.arbol.forEach(n  => { arbol[n.id]  = false; });
  const logros = {};  CONFIG.logros.forEach(l  => { logros[l.id] = false; });

  return {
    fragmentos: 0, orbes: 0,
    produccionPendiente: 0,
    click: { nivelFrags:0, nivelOrbes:0, activo:true },
    clickCooldownRestante: 0,
    tickspeed: 1,
    gensA, arbol, logros,

    // Reset layers
    prismas:      0,   // Prismas activos (se resetean al comprar Catalizador)
    catalizadores:0,   // Catalizadores activos (permanentes hasta prestige)
    stats: {
      recolecciones: 0,
      orbesTotal:    0,
      fragsTotal:    0,
      tiempoJugado:  0,
      totalPrismas:  0,  // acumulado histórico — baja al prestige (sube con mejora futura)
    },

    flags: {
      panelBDesbloqueado:  false,
      prismaRevelado:      false,
      catalizadorRevelado: false,
      clickEliminado:      false,
      prestigeDisponible:  false,
      primeraRecoleccion:  false,
      tutorialVisto:       false,
    },

    gensDesbloqueados: { g1a:true, g2a:false, g3a:false },
    prefs: { notacion:"mixed", idioma:"en" },
  };
}

let S = crearEstado();

function guardar() {
  S._lastSave = Date.now();
  S.SAVE_KEY_VERSION = SAVE_KEY;
  localStorage.setItem(SAVE_KEY, JSON.stringify(S));
}

function cargar() {
  // Si viene de un hard reset, no cargar save
  if (window.location.search.includes("r=")) return;
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try { S = deepMerge(crearEstado(), JSON.parse(raw)); }
  catch(e) { console.warn("Save corrupto:", e); }
}

function simularOffline() {
  if (!S._lastSave) return { segundos:0, frags:0, orbes:0 };
  const elapsed  = Math.floor((Date.now() - S._lastSave) / 1000);
  const segundos = Math.min(elapsed, 8 * 3600);
  if (segundos < 10) return { segundos:0, frags:0, orbes:0 };

  const prod    = prodFragmentos();
  const fragGan = Math.floor(prod * calcTickspeed() * segundos);
  S.fragmentos      += fragGan;
  S.stats.fragsTotal += fragGan;
  S.produccionPendiente = 0;

  let orbesGan = 0;
  if (!S.arbol["romper"] && fragGan > 0) {
    const ciclos = Math.floor(fragGan / CONFIG.recolectar.umbral);
    if (ciclos > 0) {
      orbesGan = ciclos * calcOrbes();
      S.orbes += orbesGan; S.stats.orbesTotal += orbesGan;
      S.stats.recolecciones += ciclos;
      S.fragmentos = fragGan % CONFIG.recolectar.umbral;
    }
  }
  guardar();
  return { segundos, frags: fragGan, orbes: orbesGan };
}

function deepMerge(base, over) {
  const r = { ...base };
  for (const k in over) {
    if (over[k] !== null && typeof over[k] === "object"
        && !Array.isArray(over[k]) && typeof base[k] === "object") {
      r[k] = deepMerge(base[k], over[k]);
    } else { r[k] = over[k]; }
  }
  return r;
}