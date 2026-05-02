// ============================================================
// AETHER — ENGINE.JS
// ============================================================

var tickAInterval = null;

// ── FORMULAS ─────────────────────────────────────────────────

function totalGenA(id) {
  return S.gensA[id].comprados + (S.gensA[id].sinteticos || 0);
}

function bonusManual(comprados) {
  return Math.pow(2, Math.floor(comprados / 12));
}

function multClickArbol() {
  let m = 1;
  CONFIG.arbol.forEach(n => {
    if (!S.arbol[n.id]) return;
    if (n.efecto.tipo === "mult_click") m *= n.efecto.val;
  });
  if (S.arbol["resonancia"]) m *= 1 + Math.min(3, S.stats.recolecciones * 0.15);
  if (S.arbol["amplif"])     m *= 1 + Math.floor(nivelClickTotal() / 5) * 0.08;
  return m;
}

function bonusClickFlat() {
  let flat = 0;
  CONFIG.arbol.forEach(n => {
    if (!S.arbol[n.id]) return;
    if (n.efecto.tipo === "bonus_click_flat") flat += n.efecto.val;
  });
  if (S.arbol["sinergia"]) {
    flat += ["vel1","vel2","vel3","vel4"].filter(v => S.arbol[v]).length;
  }
  return flat;
}

function cooldownMs() {
  let cd = CONFIG.click.cooldownBase;
  CONFIG.arbol.forEach(n => {
    if (!S.arbol[n.id]) return;
    if (n.efecto.tipo === "mult_cd") cd *= n.efecto.val;
  });
  return Math.max(80, cd);
}

function esAuto()  { return S.arbol["auto"] || S.arbol["turboAuto"]; }
function clicksPs(){ return S.arbol["turboAuto"] ? 20 : S.arbol["auto"] ? 10 : 0; }

function nivelClickTotal() { return S.click.nivelFrags + S.click.nivelOrbes; }

function poderClick() {
  const base = 1 + nivelClickTotal() * 2 + bonusClickFlat();
  let mult = multClickArbol();
  if (S.arbol["poderAuto"] && esAuto()) mult *= 2;
  return Math.floor(base * mult);
}

var MEJORAS_FRAGS = 5;
var COSTO_FRAGS_POR_NIVEL = [5, 15, 35, 65, 100];

function costoMejoraClick() {
  const n = nivelClickTotal();
  if (S.click.nivelFrags < MEJORAS_FRAGS)
    return { tipo:"fragmentos", cantidad: COSTO_FRAGS_POR_NIVEL[S.click.nivelFrags] };
  if (n < 15) return { tipo:"orbes", cantidad:1  };
  if (n < 30) return { tipo:"orbes", cantidad:3  };
  if (n < 50) return { tipo:"orbes", cantidad:8  };
  return          { tipo:"orbes", cantidad:20 };
}

// ── MULTIPLICADORES RESET LAYERS ────────────────────────────

// Prisma: cada uno activo da x1.2 a toda producción GA
function multPrisma() {
  if (S.prismas <= 0) return 1;
  return Math.pow(CONFIG.prisma.multProd, S.prismas);
}

// Catalizador: multiplicador acumulativo permanente a tickspeed
function multCatalizador() {
  if (S.catalizadores <= 0) return 1;
  return Math.pow(CONFIG.catalizador.multTS, S.catalizadores);
}

// Tickspeed base sube con totalPrismas acumulado historico
function tickspeedBase() {
  const tp = S.stats.totalPrismas || 0;
  return 1 + Math.pow(tp, 0.6) / 10;
}

function prodFragmentos() {
  const g1 = totalGenA("g1a");
  const g2 = totalGenA("g2a");
  const g3 = totalGenA("g3a");
  const p1 = g1 * CONFIG.generadoresA[0].prod * bonusManual(S.gensA["g1a"].comprados);
  const p2 = g2 * CONFIG.generadoresA[1].prod * bonusManual(S.gensA["g2a"].comprados);
  const p3 = g3 * CONFIG.generadoresA[2].prod * bonusManual(S.gensA["g3a"].comprados);
  return (p1 + p2 + p3) * multPrisma();
}

function calcTickspeed() {
  return Math.max(1, tickspeedBase() * multCatalizador());
}

function calcOrbes() {
  let base;
  if (S.arbol["romper"]) {
    base = Math.max(1, Math.floor(Math.pow(S.fragmentos / 1000, 1.35)));
  } else {
    base = Math.max(2, Math.floor(S.fragmentos / CONFIG.recolectar.umbral) + 1);
  }

  CONFIG.arbol.forEach(n => {
    if (!S.arbol[n.id]) return;
    if (n.efecto.tipo === "bonus_orbe") base += n.efecto.val;
  });

  let mult = 1;
  CONFIG.arbol.forEach(n => {
    if (!S.arbol[n.id]) return;
    if (n.efecto.tipo === "mult_orbe")  mult *= n.efecto.val;
    if (n.efecto.tipo === "eco_rec")    mult *= Math.pow(Math.max(1, S.stats.recolecciones), n.efecto.val);
  });

  return Math.max(1, Math.floor(base * mult));
}

// ── COSTOS RESET LAYERS ─────────────────────────────────────

function costoPrisma() {
  // Costo en Orbes: base 50, escala x2 por Prisma activo ya comprado
  return Math.ceil(CONFIG.prisma.costoBase * Math.pow(CONFIG.prisma.costoMult, S.prismas));
}

function costosCatalizador() {
  // Costo en Prismas activos: 3, 5, 8, 12, 18...
  // Umbral: CONFIG.catalizador.umbrales[S.catalizadores] o fórmula si no hay más
  const umbrales = CONFIG.catalizador.umbralesReq;
  if (S.catalizadores < umbrales.length) return umbrales[S.catalizadores];
  // Escalado: último umbral * 1.8 por cada catalizador extra
  return Math.ceil(umbrales[umbrales.length-1] * Math.pow(1.8, S.catalizadores - umbrales.length + 1));
}

// ── ACCIONES ─────────────────────────────────────────────────

function accionClick() {
  if (esAuto()) return;
  if (S.clickCooldownRestante > 0) return;
  S.fragmentos += poderClick();
  S.clickCooldownRestante = cooldownMs();
  UI.activarOrb();
  UI.crearParticulas();
}

function accionMejorarClick() {
  if (esAuto()) return;
  const { tipo, cantidad } = costoMejoraClick();
  if (tipo === "fragmentos") {
    if (S.fragmentos < cantidad) return;
    S.fragmentos -= cantidad;
    S.click.nivelFrags++;
    if (window.AudioMgr?._ready) AudioMgr.onAceptado();
    if (S.click.nivelFrags === MEJORAS_FRAGS)
      notif(T("notif_click_max"), T("notif_click_max_desc"), "#f59e0b");
  } else {
    if (S.orbes < cantidad) return;
    S.orbes -= cantidad;
    S.click.nivelOrbes++;
    if (window.AudioMgr?._ready) AudioMgr.onAceptado();
    if (S.click.nivelOrbes === CONFIG.CLICK_MAX_ORBES)
      notif(T("notif_click_orbes_max"), T("notif_click_orbes_max_desc"), "#34d399");
  }
}

function accionRecolectar() {
  const puede = S.arbol["romper"]
    ? S.fragmentos > 0
    : S.fragmentos >= CONFIG.recolectar.umbral;
  if (!puede) { if (window.AudioMgr?._ready) AudioMgr.onNegado(); return; }
  const ganados = calcOrbes();
  S.orbes += ganados;
  S.stats.orbesTotal += ganados;
  S.stats.recolecciones++;
  S.flags.primeraRecoleccion = true;
  S.fragmentos = 0;
  S.produccionPendiente = 0;
  S.click.nivelFrags = 0;
  S.clickCooldownRestante = 0;
  UI.animarRecolectar();
  if (window.AudioMgr?._ready) AudioMgr.onRecolectar();
  chequearLogros();
  if (S.stats.recolecciones === 1) {
    notif(T("notif_primera_rec"), T("notif_primera_rec_desc"), "#a78bfa");
    setTimeout(() => notif("Consejo", "Poder I o Velocidad I en el Árbol.", "#34d399"), 2500);
  }
}

function accionComprarPrisma() {
  const costo = costoPrisma();
  if (S.orbes < costo) { shake(document.getElementById("panelPrisma")); return; }
  S.orbes   -= costo;
  // Reset: fragmentos, GA (cantidad y costo), click temporal
  S.fragmentos = 0;
  S.produccionPendiente = 0;
  S.click.nivelFrags = 0;
  S.clickCooldownRestante = 0;
  CONFIG.generadoresA.forEach(c => {
    S.gensA[c.id].comprados = 0;
    S.gensA[c.id].sinteticos = 0;
    S.gensA[c.id].costo = c.costoBase;
  });
  S.gensDesbloqueados = { g1a:true, g2a:false, g3a:false };
  // Incrementar
  S.prismas++;
  S.stats.totalPrismas++;
  // Notif
  if (window.AudioMgr?._ready) AudioMgr.onAceptado();
  notif(T("notif_prisma"), T("notif_prisma_desc") + " x" + fmt(multPrisma().toFixed(2)), "#a78bfa");
  chequearDesbloqueos();
  UI.crearPanelGenA();
  UI.actualizarProgreso();
}

function accionComprarCatalizador() {
  const req = costosCatalizador();
  if (S.prismas < req) { shake(document.getElementById("panelCatalizador")); return; }
  // Reset todo hasta Prismas
  S.fragmentos = 0;
  S.produccionPendiente = 0;
  S.click.nivelFrags = 0;
  S.clickCooldownRestante = 0;
  CONFIG.generadoresA.forEach(c => {
    S.gensA[c.id].comprados = 0;
    S.gensA[c.id].sinteticos = 0;
    S.gensA[c.id].costo = c.costoBase;
  });
  S.gensDesbloqueados = { g1a:true, g2a:false, g3a:false };
  S.prismas = 0;
  // Incrementar
  S.catalizadores++;
  const tsActual = calcTickspeed();
  if (window.AudioMgr?._ready) AudioMgr.onAceptado();
  notif(T("notif_catalizador"), "x" + fmt(multCatalizador().toFixed(2)) + " Tickspeed", "#00d4ff");
  // Comprobar prestige
  chequearPrestige();
  UI.crearPanelGenA();
  UI.actualizarProgreso();
}

function shake(el) {
  if (window.AudioMgr?._ready) AudioMgr.onNegado();
  if (!el || el._shaking) return;
  el._shaking = true;
  const seq = [5,-5,4,-4,2,-2,0];
  let i = 0;
  const next = () => {
    if (i >= seq.length) {
      el.style.transform = ""; el.style.transition = ""; el._shaking = false; return;
    }
    el.style.transition = "transform 0.04s ease";
    el.style.transform  = "translateX(" + seq[i++] + "px)";
    setTimeout(next, 45);
  };
  next();
}

function accionComprarGenA(cfg) {
  if (!S.gensDesbloqueados[cfg.id]) return;
  const g = S.gensA[cfg.id];
  if (S.orbes < g.costo) { shake(document.getElementById("genBox_" + cfg.id)); return; }
  S.orbes -= g.costo;
  g.comprados++;
  g.costo = Math.ceil(g.costo * cfg.costoMult);
  if (window.AudioMgr?._ready) AudioMgr.onAceptado();
  chequearDesbloqueos();
  chequearLogros();
}

function accionComprarArbol(nodoId) {
  const nodo = CONFIG.arbol.find(n => n.id === nodoId);
  if (!nodo || S.arbol[nodoId]) return;
  if (nodo.req && !S.arbol[nodo.req]) return;
  if (nodoId === "auto" && S.click.nivelOrbes < CONFIG.CLICK_MAX_ORBES) {
    notif(T("click_no_max"), S.click.nivelOrbes + "/" + CONFIG.CLICK_MAX_ORBES, "#f59e0b");
    return;
  }
  if (S.orbes < nodo.costo) return;
  S.orbes -= nodo.costo;
  S.arbol[nodoId] = true;
  if (window.AudioMgr?._ready) AudioMgr.onAceptado();
  chequearDesbloqueos();
  if (nodo.efecto.tipo === "romper") {
    notif(T("umbral_roto"), T("umbral_roto_desc"), "#f59e0b");
  }
  chequearLogros();
  ArbolGrafo.actualizarNodo(nodoId);
}

// ── DESBLOQUEOS ──────────────────────────────────────────────

function chequearDesbloqueos() {
  if (!S.gensDesbloqueados["g2a"] && S.gensA["g1a"].comprados >= 6) {
    S.gensDesbloqueados["g2a"] = true;
    notif(T("notif_g2a_unlock"), T("notif_g2a_unlock_desc"), "#00d4ff");
  }
  if (!S.gensDesbloqueados["g3a"] && S.gensA["g2a"].comprados >= 10) {
    S.gensDesbloqueados["g3a"] = true;
    notif(T("notif_g3a_unlock"), T("notif_g3a_unlock_desc"), "#00d4ff");
  }
  // Panel B se desbloquea con 3 G3A — revela Prisma
  if (!S.flags.panelBDesbloqueado && S.gensA["g3a"].comprados >= 1) {
    S.flags.panelBDesbloqueado = true;
    UI.mostrarPanelB();
    notif(T("notif_prisma_unlock"), T("notif_prisma_unlock_desc"), "#a78bfa", 7000);
  }
  // Catalizador se revela al comprar el primer Prisma
  if (S.flags.panelBDesbloqueado && !S.flags.catalizadorRevelado && S.prismas >= 1) {
    S.flags.catalizadorRevelado = true;
    UI._revelarCatalizador();
    notif(T("notif_catalizador_unlock"), T("notif_catalizador_unlock_desc"), "#00d4ff");
  }
  if (!S.flags.clickEliminado && S.arbol["auto"]) {
    S.flags.clickEliminado = true;
    setTimeout(() => UI.animarTransicionIdle(), 400);
    notif(T("notif_nucleo"), T("notif_nucleo_desc"), "#34d399");
  }
}

function chequearPrestige() {
  if (S.catalizadores >= CONFIG.catalizador.catalizadoresParaPrestige) {
    S.flags.prestigeDisponible = true;
    UI.mostrarPrestige();
  }
}

function chequearLogros() {
  CONFIG.logros.forEach(l => {
    if (S.logros[l.id]) return;
    let ok = false;
    switch(l.cond.tipo) {
      case "recolecciones": ok = S.stats.recolecciones >= l.cond.val; break;
      case "gen_comp": ok = (S.gensA[l.cond.gen]?.comprados || 0) >= l.cond.val; break;
      case "arbol":    ok = !!S.arbol[l.cond.nodo]; break;
      case "prismas":  ok = S.stats.totalPrismas >= l.cond.val; break;
      case "catalizadores": ok = S.catalizadores >= l.cond.val; break;
      case "orbes_tot": ok = S.stats.orbesTotal >= l.cond.val; break;
    }
    if (ok) { S.logros[l.id] = true; UI.notifLogro(l); }
  });
}

function actualizarPuntitos() {
  const dots  = ["dot1","dot2","dot3"];
  const nodos = ["vel1","vel2","vel3"];
  dots.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const activo = S.arbol[nodos[i]] || (i === 2 && (S.arbol["vel4"] || S.arbol["auto"]));
    el.classList.toggle("dot-activo", !!activo);
  });
  const btn = document.getElementById("clickBtn");
  if (!btn) return;
  if (esAuto() && !btn._yaTransformado) {
    btn._yaTransformado = true;
    transformarBotonAuto(btn);
  }
}

function transformarBotonAuto(btn) {
  btn.style.transition = "all 0.8s ease";
  btn.classList.add("evolucionando");
  setTimeout(() => {
    btn.classList.remove("evolucionando");
    btn.classList.add("autoMode");
    btn.innerHTML = T("nucleo_activo");
    btn.style.transition = "";
    btn.style.filter = "hue-rotate(20deg) brightness(1.15)";
  }, 800);
}

function calcularEstadoCosmico() {
  if (S.flags.prestigeDisponible)    return 5;
  if (S.flags.clickEliminado)        return 4;
  if (S.gensA["g3a"].comprados >= 1) return 3;
  if (S.gensA["g2a"].comprados >= 1) return 2;
  if (S.flags.primeraRecoleccion)    return 1;
  return 0;
}

const LORE_ESTADOS = [0,1,2,3,4,5];
let _loreEstadoActual = -1;

function actualizarLoreLine() {
  const estado = calcularEstadoCosmico();
  if (estado === _loreEstadoActual) return;
  _loreEstadoActual = estado;
  const el = document.getElementById("loreLine");
  if (!el) return;
  el.classList.add("cambiando");
  setTimeout(() => { el.textContent = getLoreEstado(estado); el.classList.remove("cambiando"); }, 600);
}

function notif(titulo, desc, color, duracion) {
  const n = document.createElement("div");
  n.className = "notif";
  n.style.borderColor = (color || "#00d4ff") + "66";
  n.innerHTML = "<strong style='color:" + (color||"#00d4ff") + "'>" + titulo + "</strong><small>" + desc + "</small>";
  document.body.appendChild(n);
  setTimeout(() => n.classList.add("visible"), 50);
  const ms = duracion || 3500;
  setTimeout(() => { n.classList.remove("visible"); setTimeout(()=>n.remove(), 500); }, ms);
}

// ── TICKS ────────────────────────────────────────────────────

function tick_A() {
  S._lastTickTime = Date.now();
  S.tickspeed = calcTickspeed();
  S.stats.tiempoJugado = (S.stats.tiempoJugado || 0) + 1;
}

function tick_B() {
  chequearDesbloqueos();
  chequearPrestige();
  chequearLogros();
  guardar();
}

function tickCooldown() {
  // Producción de fragmentos — 20 veces por segundo (cada 50ms)
  const prod50 = prodFragmentos() * calcTickspeed() / 20;
  if (prod50 > 0) {
    S.stats.fragsTotal += prod50;
    if (!S.arbol["romper"]) {
      const espacio = Math.max(0, CONFIG.recolectar.umbral - S.fragmentos);
      S.fragmentos += Math.min(prod50, espacio);
    } else {
      S.fragmentos += prod50;
    }
    if (CONFIG.generadoresA.some(c => totalGenA(c.id) > 0)) {
      if (typeof UI !== "undefined") UI.activarOrb();
    }
  }

  // Cooldown del click
  if (S.clickCooldownRestante > 0) {
    S.clickCooldownRestante = Math.max(0, S.clickCooldownRestante - 50);
  }
  if (esAuto() && S.clickCooldownRestante === 0) {
    S.fragmentos += poderClick() * clicksPs() / 20;
    S.clickCooldownRestante = 1000 / clicksPs();
  }
  // Actualizar botón directamente — sin esperar uiLoop
  const btn = document.getElementById("clickBtn");
  if (btn && !esAuto()) {
    const ready = S.clickCooldownRestante === 0;
    btn.style.opacity       = ready ? "1"    : "0.5";
    btn.style.pointerEvents = ready ? "auto" : "none";
    const cdBar = document.getElementById("cdBar");
    if (cdBar) {
      const cdTotal = cooldownMs();
      const pct = cdTotal > 0 ? (1 - S.clickCooldownRestante / cdTotal) * 100 : 100;
      cdBar.style.width = pct + "%";
      cdBar.style.background = S.clickCooldownRestante > 0 ? "rgba(0,212,255,0.4)" : "#00d4ff";
    }
  }
}

function uiLoop() {
  UI.actualizar();
  actualizarLoreLine();
  actualizarPuntitos();
  UI.actualizarProgreso();
  UI._actualizarPanelB();
}