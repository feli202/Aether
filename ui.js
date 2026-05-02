// ============================================================
// AETHER — UI.JS
// UI object - panels, actualizar, overlays, colapso
// ============================================================

// ============================================================
// UI
// ============================================================

var UI = {

  orb:          null,
  orbFill:      null,
  orbParticles: null,
  orbRays:      null,

  init() {
    this.orb          = document.getElementById("orb");
    this.orbFill      = document.getElementById("orbFill");
    this.orbParticles = document.getElementById("orbParticles");
    this.orbRays      = document.getElementById("orbRays");

    this.crearPanelGenA();
    this.crearPanelGenB();
    this.crearProgreso();
    this.crearLogros();
    this.bindEventos();
    this._bindEnergiasTooltip();
    this._aplicarTextos();

    if (S.fragmentos > 0 || CONFIG.generadoresA.some(c => totalGenA(c.id) > 0)) {
      this.activarOrb();
    }
    if (S.arbol["auto"]) {
      const btn = document.getElementById("clickBtn");
      if (btn) { btn._yaTransformado=true; btn.classList.add("autoMode"); btn.innerHTML=T("nucleo_activo"); }
    }
    if (S.flags.clickEliminado) this.restaurarIdle();
    if (S.flags.panelBDesbloqueado) {
      this._construirPanelPrisma();
      document.getElementById("panelBSection").style.display = "flex";
      document.getElementById("panelBSection").style.opacity = "1";
      if (S.flags.catalizadorRevelado) {
        const sec = document.getElementById("catalizadorSection");
        if (sec) sec.style.display = "";
      }
    }
    setTimeout(() => {
      if (typeof S !== "undefined") this.iniciarTutorial();
    }, 5000); // esperar a que la intro termine (zoom ~1.2s) + margen
  },

  initParticulas3D() {
    // eliminado — Three.js removido
  },

  bindEventos() {
    document.getElementById("clickBtn")?.addEventListener("click", () => {
      accionClick();
    });
    document.getElementById("mejorarClickBtn")?.addEventListener("click", () => accionMejorarClick());
    document.getElementById("recolectarBtn")?.addEventListener("click",   () => accionRecolectar());
    document.getElementById("prestigeBtn")?.addEventListener("click", () => UI.mostrarAdvertenciaPrestige());

    document.getElementById("btnAbrirArbol")?.addEventListener("click",   () => this.abrirOverlay("arbol"));
    document.getElementById("btnAbrirLogros")?.addEventListener("click",  () => this.abrirOverlay("logros"));
    document.getElementById("btnAbrirAjustes")?.addEventListener("click", () => this.abrirOverlay("ajustes"));
    document.getElementById("btnAbrirStats")?.addEventListener("click",   () => this.abrirOverlay("stats"));
    document.getElementById("btnCerrarArbol")?.addEventListener("click",   () => this.cerrarOverlay("arbol"));
    document.getElementById("btnCerrarLogros")?.addEventListener("click",  () => this.cerrarOverlay("logros"));
    document.getElementById("btnCerrarAjustes")?.addEventListener("click", () => this.cerrarOverlay("ajustes"));
    document.getElementById("btnCerrarStats")?.addEventListener("click",   () => this.cerrarOverlay("stats"));
    document.getElementById("btnCentrarArbol")?.addEventListener("click",  () => ArbolGrafo.centrar());

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        ["arbol","logros","ajustes","stats"].forEach(o => this.cerrarOverlay(o));
      }
    });
  },

  abrirOverlay(cual) {
    const ids = { arbol:"vistaArbol", logros:"vistaLogros", ajustes:"vistaAjustes", stats:"vistaStats" };
    const el = document.getElementById(ids[cual]);
    if (!el) return;
    el.style.display = "flex";
    el.style.opacity = "0";
    el.style.transition = "opacity 0.3s ease";
    setTimeout(() => el.style.opacity = "1", 20);
    // Siempre re-aplicar textos al abrir — garantiza idioma correcto
    this._aplicarTextos();
    if (cual === "arbol") {
      if (ArbolGrafo.animFrame) { cancelAnimationFrame(ArbolGrafo.animFrame); ArbolGrafo.animFrame = null; }
      const tryInit = (attempts) => {
        const canvas = document.getElementById("arbolCanvas");
        if (!canvas) return;
        const w = canvas.offsetWidth  || 1200;
        const h = canvas.offsetHeight || 600;
        if ((w < 10 || h < 10) && attempts > 0) { setTimeout(() => tryInit(attempts-1), 60); return; }
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = w * dpr; canvas.height = h * dpr;
        canvas.style.width = w + "px"; canvas.style.height = h + "px";
        const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
        ArbolGrafo.canvas = canvas; ArbolGrafo.ctx = ctx; ArbolGrafo.w = w; ArbolGrafo.h = h;
        if (!ArbolGrafo.nodos?.length) ArbolGrafo.construirNodos();
        if (!ArbolGrafo._bound) ArbolGrafo.bindEventos();
        ArbolGrafo._running = true;
        ArbolGrafo.loop();
      };
      setTimeout(() => tryInit(5), 40);
    }
    if (cual === "ajustes") this._construirAjustes();
    if (cual === "stats")   this._construirStats();
  },

  cerrarOverlay(cual) {
    const ids = { arbol:"vistaArbol", logros:"vistaLogros", ajustes:"vistaAjustes", stats:"vistaStats" };
    const el = document.getElementById(ids[cual]);
    if (!el || el.style.display === "none") return;
    if (cual === "arbol") {
      ArbolGrafo._running = false;
      if (ArbolGrafo.animFrame) { cancelAnimationFrame(ArbolGrafo.animFrame); ArbolGrafo.animFrame = null; }
    }
    el.style.opacity = "0";
    setTimeout(() => el.style.display = "none", 300);
  },

  _bindEnergiasTooltip() {
    ["flujo","pulso","cadencia"].forEach(e => {
      const el = document.getElementById("energia_" + e);
      if (!el) return;
      el.addEventListener("mouseenter", () => this._mostrarTooltipEnergia(e, el));
      el.addEventListener("mouseleave", () => this._ocultarTooltipEnergia());
    });
  },

  bindTabs() {},

  // Aplica todos los textos traducibles al DOM estático
  _aplicarTextos() {
    const q = (id, key) => { const el=document.getElementById(id); if(el) el.innerText=T(key); };

    // Botón principal
    const clickBtn = document.getElementById("clickBtn");
    if (clickBtn && !clickBtn._yaTransformado) clickBtn.innerText = T("generar");
    // Recolectar label
    q("recolectarLabel", "recolectar");

    // Panel titles
    document.querySelectorAll(".panelTitle").forEach(el => {
      if (el.closest("#rightPanel")) el.innerText = T("panelTitle_generadores");
      if (el.closest("#leftPanel"))  el.innerText = T("panelTitle_progreso");
    });

    // Prestige button
    const pb = document.getElementById("prestigeBtn");
    if (pb) pb.innerText = T("prestige_btn");

    // Barra inferior
    const barKeys  = ["arbol", "logros", "estadisticas", "ajustes"];
    const barIcons = ["◈", "◆", "◎", "⚙"];
    document.querySelectorAll(".barraBtn").forEach((btn, i) => {
      if (!barKeys[i]) return;
      btn.innerHTML = "<span class='barraIcon'>" + barIcons[i] + "</span>" + T(barKeys[i]);
    });

    // Mobile tabs
    const tabKeys = { main:"generar", gens:"generadores", progreso:"progreso" };
    document.querySelectorAll(".mobileTab").forEach(tab => {
      const k = tab.dataset.tab;
      if (tabKeys[k]) tab.innerText = T(tabKeys[k]);
    });

    // Overlay headers — títulos, botones cerrar, centrar, leyenda
    q("txtArbolTitulo",   "arbol_titulo");
    q("txtCentrar",       "centrar");
    q("txtCerrarArbol",   "cerrar");
    q("txtCerrarLogros",  "cerrar");
    q("txtCerrarAjustes", "cerrar");
    q("txtCerrarStats",   "cerrar");
    q("txtAjustesTitulo", "ajustes_titulo");
    q("txtStatsTitulo",   "stats_titulo");
    q("txtLeyendaClicks", "leyenda_clicks");
    q("txtLeyendaRec",    "leyenda_rec");

    // Logros título (tiene span dentro del div)
    const logrosTit = document.getElementById("logrosTitulo");
    if (logrosTit) {
      const glyph = logrosTit.querySelector(".arbolTitleGlyph");
      logrosTit.innerHTML = (glyph ? glyph.outerHTML : "") + T("logros_titulo");
    }
  },

  // ── AJUSTES ─────────────────────────────────────────────────
  _construirAjustes() {
    const cont = document.getElementById("ajustesContent");
    if (!cont) return;
    const lang = S.prefs.idioma;
    cont.innerHTML = `
      <div class="settSection">
        <div class="settLabel">${T("settings_idioma")}</div>
        <div class="settRow">
          <button class="settBtn ${lang==="es"?"active":""}" onclick="UI._setIdioma('es')">Español</button>
          <button class="settBtn ${lang==="en"?"active":""}" onclick="UI._setIdioma('en')">English</button>
        </div>
      </div>
      <div class="settSection">
        <div class="settLabel">${T("settings_notacion")}</div>
        <div class="settRow col">
          <button class="settBtn wide ${S.prefs.notacion==="mixed"?"active":""}" onclick="UI._setNotacion('mixed')">${T("settings_notacion_mixed")}</button>
          <button class="settBtn wide ${S.prefs.notacion==="scientific"?"active":""}" onclick="UI._setNotacion('scientific')">${T("settings_notacion_sci")}</button>
        </div>
      </div>
      <div class="settSection">
        <div class="settLabel">${T("settings_audio")}</div>
        <div class="settSlider"><span>${T("settings_vol_musica")}</span><input type="range" min="0" max="100" step="1" value="${Math.round((S.prefs.volMusica??80)*100)}" oninput="UI._setVol('musica',this.value)" style="touch-action:none"><span class="settSliderVal">${Math.round((S.prefs.volMusica??80)*100)}%</span></div>
        <div class="settSlider"><span>${T("settings_vol_efectos")}</span><input type="range" min="0" max="100" step="1" value="${Math.round((S.prefs.volEfectos??80)*100)}" oninput="UI._setVol('efectos',this.value)" style="touch-action:none"><span class="settSliderVal">${Math.round((S.prefs.volEfectos??80)*100)}%</span></div>
      </div>
      <div class="settSection">
        <div class="settRow">
          <button class="settBtn wide" onclick="UI._exportSave()">${T("settings_export")}</button>
          <button class="settBtn wide" onclick="document.getElementById('importFileInput').click()">${T("settings_import")}</button>
          <input type="file" id="importFileInput" accept=".json" style="display:none" onchange="UI._importSave(this)">
        </div>
      </div>
      <div class="settSection">
        <div class="settLabel">${T("settings_comunidad")}</div>
        <div class="settRow">
          <button class="settBtn wide settBtnBug" onclick="UI._abrirFeedback('bug')">🐛 &nbsp;${T("settings_reportar")}</button>
          <button class="settBtn wide settBtnCol" onclick="UI._abrirFeedback('colaborar')">✦ &nbsp;${T("settings_colaborar")}</button>
        </div>
      </div>
      <div class="settSection">
        <div class="settLabel" style="color:rgba(248,113,113,0.5)">${T("reset_btn").toUpperCase()}</div>
        <button class="settBtn wide" style="color:rgba(248,113,113,0.7);border-color:rgba(248,113,113,0.2)" onclick="UI._hardReset()">${T("reset_btn")}</button>
      </div>
      <div class="settVersion">${T("settings_version")}: ${VERSION} &nbsp;·&nbsp; M = mute</div>`;
  },

  _abrirFeedback(tipo) {
    // Limpiar modal anterior si existe (para actualizar idioma)
    const old = document.getElementById("feedbackModal");
    if (old) old.remove();

    const modal = document.createElement("div");
    modal.id = "feedbackModal";
    const esBug = tipo === "bug";
    const placeholder = esBug ? T("feedback_placeholder_bug") : T("feedback_placeholder_col");
    const titulo = esBug ? T("settings_reportar") : T("settings_colaborar");
    const glyph  = esBug ? "🐛" : "✦";

    modal.innerHTML =
      "<div id='feedbackBox'>" +
        "<div id='feedbackTitulo'><span style='margin-right:8px'>" + glyph + "</span>" + titulo + "</div>" +
        "<textarea id='feedbackTexto' placeholder='" + placeholder + "' maxlength='1000'></textarea>" +
        "<div id='feedbackBtns'>" +
          "<button id='feedbackCancelar'>" + T("prestige_cancelar") + "</button>" +
          "<button id='feedbackEnviar'>" + T("feedback_enviar") + "</button>" +
        "</div>" +
        "<div id='feedbackEstado'></div>" +
      "</div>";
    document.body.appendChild(modal);

    document.getElementById("feedbackCancelar").onclick = () => {
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 300);
    };

    // Cerrar con Escape
    const onKey = e => { if (e.key === "Escape") { modal.style.opacity="0"; setTimeout(()=>{ modal.remove(); document.removeEventListener("keydown",onKey); },300); } };
    document.addEventListener("keydown", onKey);

    modal.style.display = "flex";
    modal.style.opacity = "0";
    setTimeout(() => { modal.style.transition="opacity 0.3s"; modal.style.opacity="1"; }, 10);

    document.getElementById("feedbackEnviar").onclick = async () => {
      const texto  = document.getElementById("feedbackTexto");
      const estado = document.getElementById("feedbackEstado");
      const enviar = document.getElementById("feedbackEnviar");
      const msg = texto.value.trim();
      if (!msg) { texto.focus(); return; }

      enviar.disabled = true;
      estado.style.color = "rgba(0,212,255,0.6)";
      estado.innerText = "...";

      try {
        const res = await fetch("https://formspree.io/f/meenoqba", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            tipo:    esBug ? "bug" : "colaborar",
            version: VERSION,
            mensaje: msg,
          })
        });
        if (res.ok) {
          estado.style.color = "#34d399";
          estado.innerText = "✓ " + T("feedback_enviado");
          texto.value = "";
          setTimeout(() => { modal.style.opacity="0"; setTimeout(()=>{ modal.remove(); document.removeEventListener("keydown",onKey); },300); }, 2000);
        } else {
          throw new Error("status " + res.status);
        }
      } catch(e) {
        estado.style.color = "#f87171";
        estado.innerText = "✗ " + T("feedback_error");
        enviar.disabled = false;
      }
    };
  },

  _hardReset() {
    if (confirm(T("reset_confirm"))) {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }
  },

  _setIdioma(lang) {
    S.prefs.idioma = lang;
    guardar();
    this._construirAjustes();
    this._aplicarTextos();
    this.crearLogros();
    this.crearPanelGenA();
    if (S.flags.panelBDesbloqueado) this._construirPanelPrisma();
    _loreEstadoActual = -1;
    actualizarLoreLine();
    const rl = document.getElementById("recolectarLabel");
    if (rl) rl.innerText = T("recolectar");
  },

  _setNotacion(mode) {
    S.prefs.notacion = mode;
    guardar();
    this._construirAjustes();
  },

  _setVol(tipo, val) {
    if (!S.prefs) S.prefs = {};
    S.prefs["vol" + tipo.charAt(0).toUpperCase() + tipo.slice(1)] = val / 100;
    guardar();
    if (window.AudioMgr) AudioMgr.setVol(tipo, val / 100);
    // Update label inline — no rebuild, keeps slider smooth
    const labels = document.querySelectorAll("#ajustesContent .settSliderVal");
    const idx = { musica:0, efectos:1 }[tipo];
    if (labels[idx] !== undefined) labels[idx].innerText = Math.round(val) + "%";
  },

  _exportSave() {
    const data = JSON.stringify(S, null, 2);
    const blob = new Blob([data], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aether_save_" + VERSION + ".json";
    a.click(); URL.revokeObjectURL(url);
  },

  _importSave(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.SAVE_KEY_VERSION && data.SAVE_KEY_VERSION !== SAVE_KEY) {
          if (!confirm("Este save es de una versión diferente (" + (data.SAVE_KEY_VERSION || "desconocida") + "). ¿Importar de todas formas? Puede causar errores.")) return;
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        location.reload();
      } catch(err) {
        notif("Error al importar", "El archivo no es válido", "#f87171");
      }
    };
    reader.readAsText(file);
  },

  // ── ESTADÍSTICAS ─────────────────────────────────────────────
  _construirStats() {
    const cont = document.getElementById("statsContent");
    if (!cont) return;
    const seg = S.stats.tiempoJugado || 0;
    cont.innerHTML = `
      <div class="statRow"><span>${T("stats_tiempo")}</span><span>${formatTiempo(seg)}</span></div>
      <div class="statRow"><span>${T("stats_recolecciones")}</span><span>${fmt(S.stats.recolecciones)}</span></div>
      <div class="statRow"><span>${T("stats_frags_total")}</span><span>${fmt(S.stats.fragsTotal)}</span></div>
      <div class="statRow"><span>${T("stats_orbes_total")}</span><span>${fmt(S.stats.orbesTotal)}</span></div>
      <div class="statRow"><span>${T("stats_click_nivel")}</span><span>${nivelClickTotal()}</span></div>
      <div class="statRow"><span>${T("stats_gens_a")}</span><span>${Object.values(S.gensA).reduce((a,g)=>a+g.comprados,0)}</span></div>
      <div class="statRow"><span>${T("stats_prismas")}</span><span>${S.stats.totalPrismas}</span></div>
      <div class="statRow"><span>${T("stats_catalizadores")}</span><span>${S.catalizadores}</span></div>
      <div class="statRow"><span>${T("stats_nodos")}</span><span>${Object.values(S.arbol).filter(Boolean).length}</span></div>
      <div class="statRow"><span>${T("stats_ts")}</span><span>x${fmt(calcTickspeed())}</span></div>
      <div class="statVersion">${VERSION}</div>`;
  },

  // ── ADVERTENCIA PRESTIGE ─────────────────────────────────────
  mostrarAdvertenciaPrestige() {
    let av = document.getElementById("prestigeAdvertencia");
    if (!av) {
      av = document.createElement("div");
      av.id = "prestigeAdvertencia";
      av.innerHTML =
        "<div id='pavContent'>" +
          "<div id='pavTitulo'></div>" +
          "<div id='pavDesc'></div>" +
          "<div id='pavBtns'>" +
            "<button id='pavConfirmar'></button>" +
            "<button id='pavCancelar'></button>" +
          "</div>" +
        "</div>";
      document.body.appendChild(av);
      document.getElementById("pavConfirmar").onclick = () => {
        av.style.opacity = "0";
        setTimeout(() => { av.style.display="none"; UI.iniciarColapso(); }, 400);
      };
      document.getElementById("pavCancelar").onclick = () => {
        av.style.opacity = "0";
        setTimeout(() => av.style.display="none", 400);
      };
    }
    document.getElementById("pavTitulo").innerText = T("prestige_aviso_titulo");
    document.getElementById("pavDesc").innerText    = T("prestige_aviso_desc");
    document.getElementById("pavConfirmar").innerText = T("prestige_confirmar");
    document.getElementById("pavCancelar").innerText  = T("prestige_cancelar");
    av.style.display = "flex";
    av.style.opacity = "0";
    setTimeout(() => { av.style.transition="opacity 0.5s"; av.style.opacity="1"; }, 20);
  },

  // ── TUTORIAL ─────────────────────────────────────────────────
  iniciarTutorial() {
    if (S.flags.tutorialVisto) return;
    const pasos = ["tut_bienvenido","tut_click","tut_mejorar","tut_recolectar","tut_arbol","tut_generadores"];
    let idx = 0;
    const el      = document.getElementById("tutorialBox");
    const txtEl   = document.getElementById("tutText");
    const numEl   = document.getElementById("tutNum");
    const nextBtn = document.getElementById("tutNext");
    const skipBtn = document.getElementById("tutSkip");
    if (!el || !txtEl || !nextBtn) return;

    const mostrar = () => {
      if (idx >= pasos.length) {
        el.classList.remove("visible");
        S.flags.tutorialVisto = true;
        guardar();
        return;
      }
      txtEl.innerText = T(pasos[idx]);
      if (numEl) numEl.innerText = (idx+1) + "/" + pasos.length;
      if (nextBtn) nextBtn.innerText = T("next_tut");
      if (skipBtn) skipBtn.innerText = T("skip_tut");
      el.classList.add("visible");
    };

    nextBtn.onclick = () => { idx++; mostrar(); };
    if (skipBtn) skipBtn.onclick = () => { idx = pasos.length; mostrar(); };
    mostrar();
  },
  bindPanelInferior() {},

  // Panel Gen A
  crearPanelGenA() {
    const cont = document.getElementById("gensAContainer");
    if (!cont) return;
    cont.innerHTML = "";
    CONFIG.generadoresA.forEach(cfg => {
      const desbloq = S.gensDesbloqueados[cfg.id];
      const box = document.createElement("div");
      box.className = desbloq ? "genBox" : "genBox locked";
      box.id = "genBox_" + cfg.id;
      box.innerHTML =
        "<h3 class='genLabel'>" + TL(cfg) + "</h3>" +
        "<div class='genNums'>" +
          "<span id='genTotal_" + cfg.id + "'>Total: 0</span>" +
          "<span id='genComp_"  + cfg.id + "'>Manual: 0</span>" +
        "</div>" +
        "<p class='genInfo' id='genInfo_" + cfg.id + "'>---</p>" +
        "<button>" + T("gen_comprar") + "</button>";
      box.querySelector("button").addEventListener("click", () => accionComprarGenA(cfg));
      cont.appendChild(box);
    });
  },

  // Panel B ahora contiene Prisma y Catalizador
  crearPanelGenB() {
    // Construido en mostrarPanelB
  },

  mostrarPanelB() {
    const panelB = document.getElementById("panelBSection");
    if (!panelB) return;
    this._construirPanelPrisma();
    panelB.style.display  = "flex";
    panelB.style.opacity  = "0";
    panelB.style.transition = "opacity 0.8s ease";
    setTimeout(() => panelB.style.opacity = "1", 30);
  },

  _revelarCatalizador() {
    const sec = document.getElementById("catalizadorSection");
    if (!sec) return;
    sec.style.opacity = "0";
    sec.style.display = "";
    sec.style.transition = "opacity 0.8s ease";
    setTimeout(() => sec.style.opacity = "1", 30);
  },

  _construirPanelPrisma() {
    const panelB = document.getElementById("panelBSection");
    if (!panelB) return;
    panelB.innerHTML =
      // ── PRISMA ───────────────────────────────────────────────
      "<div class='resetPanel' id='panelPrisma'>" +
        "<div class='resetPanelHeader'>" +
          "<span class='resetGlyph' style='color:#a78bfa'>◆</span>" +
          "<span class='resetTitle' id='txtPrismaNombre'>" + T("prisma_nombre") + "</span>" +
          "<span class='resetMult' id='prismaMult'>x" + fmt(multPrisma().toFixed(2)) + " " + T("prisma_mult") + "</span>" +
        "</div>" +
        "<p class='resetDesc' id='prismaDesc'>" + T("prisma_info") + "</p>" +
        "<div class='resetStats'>" +
          "<div class='resetStat'><span>" + T("prisma_activos") + "</span><span id='prismaActivos'>" + S.prismas + "</span></div>" +
          "<div class='resetStat'><span>" + T("prisma_total") + "</span><span id='prismaTotal'>" + S.stats.totalPrismas + "</span></div>" +
        "</div>" +
        "<div class='resetBtnRow'>" +
          "<span class='resetCosto'><em id='prismaCostoNum'>" + fmt(costoPrisma()) + "</em> " + T("orbes") + "</span>" +
          "<button class='resetBtn' id='btnComprarPrisma'>" + T("prisma_nombre") + "</button>" +
        "</div>" +
      "</div>" +
      // ── CATALIZADOR ──────────────────────────────────────────
      "<div class='resetPanel' id='catalizadorSection' style='display:none'>" +
        "<div class='resetPanelHeader'>" +
          "<span class='resetGlyph' style='color:#00d4ff'>◈</span>" +
          "<span class='resetTitle' id='txtCatNombre'>" + T("catalizador_nombre") + "</span>" +
          "<span class='resetMult' id='catMult'>x" + fmt(multCatalizador().toFixed(2)) + " " + T("catalizador_mult") + "</span>" +
        "</div>" +
        "<p class='resetDesc'>" + T("catalizador_info") + "</p>" +
        "<div class='resetStats'>" +
          "<div class='resetStat'><span>" + T("catalizador_nombre") + "</span><span id='catActivos'>" + S.catalizadores + "</span></div>" +
          "<div class='resetStat'><span>" + T("prisma_req_label") + "</span><span id='catReq'>" + costosCatalizador() + " " + T("prisma_nombre") + "s</span></div>" +
        "</div>" +
        "<div class='resetBtnRow'>" +
          "<span class='resetCosto'><em id='catCostoNum'>" + costosCatalizador() + "</em> " + T("prisma_nombre") + "s</span>" +
          "<button class='resetBtn cat' id='btnComprarCatalizador'>" + T("catalizador_nombre") + "</button>" +
        "</div>" +
      "</div>";

    // Bind botones
    document.getElementById("btnComprarPrisma")?.addEventListener("click", () => accionComprarPrisma());
    document.getElementById("btnComprarCatalizador")?.addEventListener("click", () => accionComprarCatalizador());

    // Mostrar catalizador si ya fue revelado
    if (S.flags.catalizadorRevelado) {
      const sec = document.getElementById("catalizadorSection");
      if (sec) sec.style.display = "";
    }
  },

  _actualizarPanelB() {
    if (!S.flags.panelBDesbloqueado) return;
    const pm = document.getElementById("prismaMult");
    if (pm) pm.innerText = "x" + multPrisma().toFixed(2) + " " + T("prisma_mult");
    const pa = document.getElementById("prismaActivos");
    if (pa) pa.innerText = S.prismas;
    const pt = document.getElementById("prismaTotal");
    if (pt) pt.innerText = S.stats.totalPrismas;
    const pc = document.getElementById("prismaCostoNum");
    if (pc) pc.innerText = fmt(costoPrisma());

    if (S.flags.catalizadorRevelado) {
      const cm = document.getElementById("catMult");
      if (cm) cm.innerText = "x" + multCatalizador().toFixed(2) + " " + T("catalizador_mult");
      const ca = document.getElementById("catActivos");
      if (ca) ca.innerText = S.catalizadores;
      const cr = document.getElementById("catReq");
      if (cr) cr.innerText = costosCatalizador() + " " + T("prisma_nombre") + "s";
      const cc = document.getElementById("catCostoNum");
      if (cc) cc.innerText = costosCatalizador();
    }
  },

  crearProgreso() {
    const cont = document.getElementById("progresoContainer");
    if (!cont) return;

    // Hitos con dependencia secuencial explícita (prevDone = el anterior debe estar done)
    this._hitos = [
      {
        id:"h1", label:() => T("h_primera_rec"), sec:"clicks",
        hint: () => T("h_hint_primera"),
        cond: () => S.flags.primeraRecoleccion,
      },
      {
        id:"h2", label:() => T("h_6_cond"), sec:"clicks",
        hint: () => { const n=S.gensA["g1a"].comprados; return n>=6?null:(6-n)+" "+T("h_cond_falta"); },
        req: () => { const n=S.gensA["g1a"].comprados; return "<strong style='color:#00d4ff'>"+n+" / 6</strong><br><span style='opacity:0.5'>"+Math.max(0,6-n)+" "+T("h_cond_falta")+"</span>"; },
        cond: () => S.gensA["g1a"].comprados >= 6,
        val:  () => S.gensA["g1a"].comprados + " / 6",
      },
      {
        id:"h3", label:() => T("h_resonador"), sec:"clicks",
        hint: () => T("h_hint_primera"),
        req: () => "<strong style='color:#a78bfa'>"+fmt(S.gensA["g2a"].costo)+" "+T("orbes")+"</strong><br><span style='opacity:0.5'>"+T("orbes")+": "+fmt(S.orbes)+"</span>",
        cond: () => S.gensA["g2a"].comprados >= 1,
      },
      {
        id:"h3b", label:() => T("h_10_res"), sec:"clicks",
        hint: () => { const n=S.gensA["g2a"].comprados; return n>=10?null:(10-n)+" "+T("h_cond_falta2"); },
        req: () => { const n=S.gensA["g2a"].comprados; return "<strong style='color:#00d4ff'>"+n+" / 10</strong><br><span style='opacity:0.5'>"+(10-n)+" "+T("h_cond_falta2")+"</span>"; },
        cond: () => S.gensA["g2a"].comprados >= 10,
        val:  () => S.gensA["g2a"].comprados + " / 10",
      },
      {
        id:"h4", label:() => T("h_autonomo"), sec:"clicks",
        hint: () => T("h_hint_autonomo"),
        req: () => {
          const niv = S.click.nivelOrbes;
          const ok  = S.arbol["vel4"];
          const col = ok ? "#34d399" : "#f87171";
          return T("stats_click_nivel") + ": <strong style='color:#a78bfa'>" + niv + " / 15</strong><br>Vel IV: <strong style='color:" + col + "'>" + (ok ? "✓" : "✗") + "</strong>";
        },
        cond: () => S.flags.clickEliminado,
      },
      {
        id:"h5", label:() => T("h_prisma"), sec:"energia",
        hint: () => T("h_hint_prisma"),
        req: () => { const n=S.gensA["g3a"].comprados; return "<strong style='color:#00d4ff'>"+n+" / 3</strong>"; },
        cond: () => S.prismas >= 1,
      },
      {
        id:"h6", label:() => T("h_catalizador"), sec:"energia",
        hint: () => T("h_hint_catalizador"),
        cond: () => S.catalizadores >= 1,
      },
      {
        id:"h7", label:() => T("h_ts1"), sec:"ts",
        hint: () => T("h_hint_ts"),
        cond: () => S.tickspeed >= 1000,
        val:  () => "x" + fmt(S.tickspeed) + " / x1.000",
      },
      {
        id:"h8", label:() => T("h_ts2"), sec:"ts",
        cond: () => S.tickspeed >= 100000,
        val:  () => "x" + fmt(S.tickspeed) + " / x100.000",
      },
      {
        id:"h9", label:() => T("h_singularidad"), sec:"ts",
        hint: () => T("h_hint_singularidad"),
        cond: () => S.flags.prestigeDisponible,
      },
    ];

    cont.innerHTML = "";
    cont.style.cssText = "flex:1;display:flex;flex-direction:column;justify-content:space-between";

    // Tooltip global — uno solo para todo el panel
    let tip = document.getElementById("progTooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "progTooltip";
      tip.className = "prog-tooltip";
      document.body.appendChild(tip);
    }

    let seccionActual = "";
    this._hitos.forEach((h, i) => {
      if (h.sec !== seccionActual) {
        seccionActual = h.sec;
        const sec = document.createElement("div");
        sec.className = "prog-section-label";
        sec.innerText = T("h_sec_" + h.sec) || h.sec.toUpperCase();
        cont.appendChild(sec);
      }

      const item = document.createElement("div");
      item.id = "prog_" + h.id;
      item.className = "prog-item";
      item.innerHTML =
        "<div class='prog-node-wrap'>" +
          "<div class='prog-node' id='prognode_" + h.id + "'></div>" +
          (i < this._hitos.length - 1 ? "<div class='prog-connector' id='progconn_" + h.id + "'></div>" : "") +
        "</div>" +
        "<div class='prog-text-wrap'>" +
          "<div class='prog-label' id='proglabel_" + h.id + "'>" + (typeof h.label==="function"?h.label():h.label) + "</div>" +
          "<div class='prog-hint'  id='proghint_"  + h.id + "'></div>" +
          (h.val ? "<div class='prog-value' id='progval_" + h.id + "'></div>" : "") +
        "</div>";

      // Tooltip en el item entero (más fácil de hover), solo si tiene req
      if (h.req) {
        item.style.cursor = "help";
        item.addEventListener("mouseenter", () => {
          // Mostrar tooltip si este hito es el activo (current) o tiene info útil
          const node = document.getElementById("prognode_" + h.id);
          const isCurrent = node && (node.classList.contains("current") || (!node.classList.contains("done")));
          if (!isCurrent) return;
          const txt = typeof h.req === "function" ? h.req() : h.req;
          if (!txt) return;
          tip.innerHTML = "<strong style='color:#00d4ff;font-size:9px;letter-spacing:1px;display:block;margin-bottom:5px'>" + T("h_req_requisitos") + "</strong>" + txt;
          tip.style.display = "block";
          const panel = document.getElementById("leftPanel");
          const pr    = panel ? panel.getBoundingClientRect() : { right: 220 };
          const ir    = item.getBoundingClientRect();
          tip.style.left = (pr.right + 12) + "px";
          tip.style.top  = Math.max(8, ir.top + ir.height / 2 - 30) + "px";
        });
        item.addEventListener("mouseleave", () => { tip.style.display = "none"; });
      }

      cont.appendChild(item);
    });
  },

  actualizarProgreso() {
    if (!this._hitos) return;
    // Recorrer todos para determinar cuál es el primero no-done
    // Un hito es "current" solo si TODOS los anteriores están done
    let primerNoDone = -1;
    this._hitos.forEach((h, i) => {
      if (primerNoDone === -1 && !h.cond()) primerNoDone = i;
    });

    this._hitos.forEach((h, i) => {
      const done  = h.cond();
      const esCurrent = i === primerNoDone;
      const node  = document.getElementById("prognode_"  + h.id);
      const label = document.getElementById("proglabel_" + h.id);
      const hint  = document.getElementById("proghint_"  + h.id);
      const val   = document.getElementById("progval_"   + h.id);
      const conn  = document.getElementById("progconn_"  + h.id);
      if (!node) return;
      if (label) label.innerText = typeof h.label==="function" ? h.label() : h.label;

      if (done) {
        node.className  = "prog-node done";
        if (label) label.className = "prog-label done";
        if (conn)  conn.className  = "prog-connector done";
        if (val)   val.style.display  = "none";
        if (hint)  hint.style.display = "none";
      } else if (esCurrent) {
        node.className  = "prog-node current";
        if (label) label.className = "prog-label current";
        if (val && h.val) { val.style.display = ""; val.innerText = h.val(); }
        if (hint && h.hint) {
          const txt = typeof h.hint === "function" ? h.hint() : h.hint;
          if (txt) { hint.style.display = ""; hint.innerText = txt; }
          else       hint.style.display = "none";
        }
      } else {
        node.className  = "prog-node";
        if (label) label.className = "prog-label";
        if (val)   val.style.display  = "none";
        if (hint)  hint.style.display = "none";
      }
    });
  },

  crearLogros() {
    // buscar en vistaLogros
    const grid = document.getElementById("logrosGrid");
    if (!grid) return;
    grid.innerHTML = "";
    CONFIG.logros.forEach(l => {
      const el = document.createElement("div");
      el.className = "logroItem";
      el.id = "logro_" + l.id;
      el.innerHTML = "<strong>" + (T("logro_" + l.id) || l.label) + "</strong><small>" + (T("logro_" + l.id + "_d") || l.desc) + "</small>";
      grid.appendChild(el);
    });
  },

  mostrarPrestige() {
    // En vez del botón inline, activar la pantalla de colapso
    const btn = document.getElementById("prestigeBtn");
    if (btn) {
      btn.style.display = "block";
      btn.style.opacity = "0";
      btn.style.transition = "opacity 2s ease";
      setTimeout(() => btn.style.opacity = "1", 100);
    }
  },

  // ── SECUENCIA COMPLETA DE COLAPSO ───────────────────────────
  iniciarColapso() {
    const pantalla = document.getElementById("vistaColapso");
    if (!pantalla) return;

    // Detener todos los ticks para evitar bugs de estado durante la animación
    clearInterval(tickAInterval);
    clearInterval(window._tickBInterval);
    clearInterval(window._tickCDInterval);
    clearInterval(window._uiLoopInterval);
    tickAInterval = null;

    pantalla.style.display = "flex";
    setTimeout(() => pantalla.classList.add("visible"), 30);

    const btn = document.getElementById("colapsoBtn");
    if (btn) btn.onclick = () => this._ejecutarColapso();
  },

  _ejecutarColapso() {
    const btn = document.getElementById("colapsoBtn");
    if (btn) { btn.style.pointerEvents = "none"; btn.style.opacity = "0.3"; }

    const orb = document.getElementById("colapsoOrb");
    const canvas = document.getElementById("colapsoFragmento");
    if (!canvas || !orb) return;

    // Setup canvas del fragmento
    const rect = orb.getBoundingClientRect();
    const cw   = canvas.offsetWidth  || rect.width  + 80;
    const ch   = canvas.offsetHeight || rect.height + 80;
    const dpr  = window.devicePixelRatio || 1;
    canvas.width  = cw * dpr;
    canvas.height = ch * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Fragmento: triángulo irregular estilo vidrio roto
    const frag = {
      // posición relativa al centro del canvas del fragmento
      x: cw * 0.5 + 40,   // ligeramente a la derecha del centro de la esfera
      y: ch * 0.35,        // en el tercio superior de la esfera
      vx: 1.2,
      vy: 0,
      gravity: 0.28,
      rotation: 0,
      rotSpeed: 0.04,
      alpha: 1,
      // vértices del triángulo
      pts: [
        { x:0,   y:-18 },
        { x:14,  y: 8  },
        { x:-10, y: 12 },
      ],
    };

    let frame = 0;
    const crackDelay = 18; // frames antes de que empiece a caer

    const animate = () => {
      ctx.clearRect(0, 0, cw, ch);

      if (frame < crackDelay) {
        // Fase 1: crack visible, fragmento quieto — trazar grieta en la esfera
        this._dibujarCrack(ctx, cw, ch, frame / crackDelay);
      } else {
        // Fase 2: fragmento cae con gravedad
        frag.vy      += frag.gravity;
        frag.x       += frag.vx;
        frag.y       += frag.vy;
        frag.rotation += frag.rotSpeed;
        frag.alpha    = Math.max(0, frag.alpha - 0.008);

        // Dibujar grieta fija
        this._dibujarCrack(ctx, cw, ch, 1);

        // Dibujar fragmento
        ctx.save();
        ctx.globalAlpha = frag.alpha;
        ctx.translate(frag.x, frag.y);
        ctx.rotate(frag.rotation);

        // Relleno oscuro con borde iluminado — como vidrio cósmico
        ctx.beginPath();
        frag.pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 5, 20, 0.9)";
        ctx.fill();
        ctx.strokeStyle = "rgba(100, 180, 255, 0.8)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glow en el borde del fragmento
        ctx.shadowColor = "rgba(80, 160, 255, 0.9)";
        ctx.shadowBlur  = 10;
        ctx.stroke();
        ctx.restore();
      }

      frame++;

      // El fragmento salió de pantalla o se desvaneció
      if (frag.alpha <= 0 || frag.y > ch + 60) {
        // Esfera se vuelve negra adentro con una respiración final
        if (orb) {
          orb.style.transition = "background 1.5s ease, box-shadow 1.5s ease";
          orb.style.background = "#000010";
          orb.style.boxShadow  = "0 0 0 1px rgba(40,80,180,0.2), inset 0 0 80px #000";
        }
        setTimeout(() => this._finalizarColapso(), 2000);
        return;
      }

      requestAnimationFrame(animate);
    };

    // Pequeña pausa dramática antes de empezar
    setTimeout(() => requestAnimationFrame(animate), 400);
  },

  _dibujarCrack(ctx, cw, ch, progress) {
    // Grieta que parte desde el punto donde estaba el fragmento
    const cx = cw * 0.5 + 40;
    const cy = ch * 0.35;

    ctx.save();
    ctx.globalAlpha = progress * 0.85;
    ctx.strokeStyle = "rgba(140, 200, 255, 0.9)";
    ctx.lineWidth   = 1;
    ctx.shadowColor = "rgba(100, 180, 255, 0.8)";
    ctx.shadowBlur  = 6;

    // Línea principal de la grieta
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 8  * progress, cy + 22 * progress);
    ctx.stroke();

    // Ramificación 1
    ctx.beginPath();
    ctx.globalAlpha = progress * 0.5;
    ctx.moveTo(cx - 4 * progress, cy + 12 * progress);
    ctx.lineTo(cx - 18 * progress, cy + 16 * progress);
    ctx.stroke();

    // Ramificación 2
    ctx.beginPath();
    ctx.globalAlpha = progress * 0.35;
    ctx.moveTo(cx - 6 * progress, cy + 18 * progress);
    ctx.lineTo(cx + 6 * progress, cy + 26 * progress);
    ctx.stroke();

    ctx.restore();
  },

  _finalizarColapso() {
    const orb = document.getElementById("colapsoOrb");

    // Esfera se expande a pantalla completa
    if (orb) orb.classList.add("expandiendo");

    setTimeout(() => {
      // Fade negro de toda la pantalla
      const pantalla = document.getElementById("vistaColapso");
      if (pantalla) {
        pantalla.style.transition = "opacity 1.5s ease";
        pantalla.style.opacity    = "0";
      }

      setTimeout(() => {
        if (pantalla) pantalla.style.display = "none";
        this._mostrarFinalPrestige();
      }, 1500);
    }, 1800);
  },

  _mostrarFinalPrestige() {
    // Crear pantalla final si no existe
    let final = document.getElementById("colapsoFinal");
    if (!final) {
      final = document.createElement("div");
      final.id = "colapsoFinal";
      final.innerHTML =
        "<div id='colapsoFinalTitulo'>" + T("colapso_final_titulo") + "</div>" +
        "<div id='colapsoFinalDesc'>" +
          "El Aether Primordial ha colapsado.<br>" +
          "Sus fragmentos flotan en el vacío, esperando ser recogidos.<br>" +
          "<span style='color:rgba(80,130,255,0.4);font-size:0.9em'>La Capa 1 se aproxima.</span>" +
        "</div>" +
        "<button id='colapsoFinalBtn'>" + T("colapso_volver") + "</button>";
      document.body.appendChild(final);
    }

    setTimeout(() => {
      final.classList.add("visible");
      const btn = document.getElementById("colapsoFinalBtn");
      if (btn) btn.onclick = () => {
        // Guardar sin resetear — el jugador vuelve al menú con su progreso
        guardar();
        location.reload();
      };
    }, 100);
  },

  mostrarTooltipNodo(id, pos) {
    const cfg = CONFIG.arbol.find(n => n.id === id);
    if (!cfg) return;
    let t = document.getElementById("nodoTooltip");
    if (!t) { t = document.createElement("div"); t.id = "nodoTooltip"; document.body.appendChild(t); }
    const comprado = S.arbol[id];
    const desc     = cfg.descKey ? T(cfg.descKey) : (cfg.desc || "");
    t.innerHTML =
      "<strong>" + TL(cfg) + "</strong>" +
      (desc ? "<span>" + desc + "</span>" : "") +
      (comprado
        ? "<span style='color:#34d399'>✓ " + T("nodo_comprado") + "</span>"
        : "<span style='color:#a78bfa'>" + fmt(cfg.costo) + " " + T("orbes") + "</span>");
    t.style.display = "block";
    const canvas = document.getElementById("vistaArbol");
    const cr = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth };
    t.style.left = Math.min(pos.x + cr.left + 16, cr.right - 210) + "px";
    t.style.top  = Math.max(cr.top + 10, pos.y + cr.top - 60) + "px";
  },

  ocultarTooltipNodo() {
    const t = document.getElementById("nodoTooltip");
    if (t) t.style.display = "none";
  },

  // ── Display de multiplicadores activos ──────────────────────
  _actualizarEnergiasDisplay() {
    // Mostrar multiplicador de Prisma si hay alguno activo
    const el = document.getElementById("energia_flujo");
    if (el) {
      if (S.prismas > 0 || S.catalizadores > 0) {
        el.style.display = "";
        el.style.color = "#a78bfa";
        el.style.borderColor = "#a78bfa55";
        el.style.background = "#a78bfa11";
        el.style.transform = "translateX(0)";
        el.innerHTML = "×" + multPrisma().toFixed(2) + " GA &nbsp;|&nbsp; ×" + multCatalizador().toFixed(1) + " TS";
      } else {
        el.style.display = "none";
      }
    }
    // Ocultar los otros dos displays de energía
    ["energia_pulso","energia_cadencia"].forEach(id => {
      const e = document.getElementById(id);
      if (e) e.style.display = "none";
    });
  },

  _mostrarTooltipEnergia() {},
  _ocultarTooltipEnergia() {},
  _bindEnergiasTooltip() {},

  // Actualizar UI completo
  actualizar() {
    const ahora = Date.now();
    const frags = S.fragmentos;
    const ts    = calcTickspeed();
    S.tickspeed = ts;
    const intensidad = Math.min(1, frags / 200);

    // orb fill level only — no JS boxShadow/transform, CSS handles the pulse
    const umbral = CONFIG.recolectar.umbral;
    if (this.orbFill) this.orbFill.style.height = (Math.min(1, frags / umbral) * 100) + "%";

    if (frags > 200 && Math.random() < 0.08) this.crearRayo();

    // texto principal
    const ptsEl = document.getElementById("points");
    if (ptsEl) {
      // Build structure once, update text only after that
      if (!ptsEl._built) {
        ptsEl._built = true;
        ptsEl.innerHTML =
          "<span id='ptsFrags' style='color:#00d4ff'></span>" +
          "<span id='ptsOrbes' style='color:#a78bfa'></span>" +
          "<span id='ptsTS'    style='opacity:0.7'></span>";
      }
      const fps = calcFPS();
      const fEl = document.getElementById("ptsFrags");
      const oEl = document.getElementById("ptsOrbes");
      const tEl = document.getElementById("ptsTS");
      if (fEl) fEl.textContent = T("frags_label") + ": " + fmt(frags) + (fps > 0 ? " +" + fmt(fps) + "/s" : "");
      if (oEl) oEl.textContent = T("orbes_label") + ": " + fmt(S.orbes);
      if (tEl) tEl.textContent = ts > 1.001 ? "TS: x" + fmt(ts) : "";
    }

    // energias — centradas y desplazadas según cuántas hay activas
    this._actualizarEnergiasDisplay();

    // orbes en header del arbol
    const orbCount = document.getElementById("arbolOrbCount");
    if (orbCount) orbCount.innerText = fmt(S.orbes) + " " + T("orbes_disponibles");
    if (!esAuto()) {
      const cdTotal = cooldownMs();
      const cdRest  = S.clickCooldownRestante;
      const pct     = cdTotal > 0 ? (1 - cdRest / cdTotal) * 100 : 100;
      const cdBar   = document.getElementById("cdBar");
      if (cdBar) {
        cdBar.style.width = pct + "%";
        cdBar.style.background = cdRest > 0 ? "rgba(0,212,255,0.4)" : "#00d4ff";
      }
      const cdText = document.getElementById("cdText");
      if (cdText) cdText.innerText = cdRest > 0 ? (cdRest/1000).toFixed(1) + "s" : T("listo");
      const btn = document.getElementById("clickBtn");
      if (btn) {
        btn.style.opacity = cdRest > 0 ? "0.5" : "1";
        btn.style.pointerEvents = cdRest > 0 ? "none" : "auto";
      }
    } else {
      const cdText = document.getElementById("cdText");
      if (cdText) cdText.innerText = T("auto_label") + ": " + clicksPs() + "/s";
      const cdBar = document.getElementById("cdBar");
      if (cdBar) {
        // barra oscilante para auto
        const t = (Date.now() % 1000) / 1000;
        cdBar.style.width = (t * 100) + "%";
        cdBar.style.background = "#34d399";
      }
    }

    // boton mejorar click
    const mejBtn = document.getElementById("mejorarClickBtn");
    if (mejBtn) {
      // Clave de estado — solo reconstruir HTML cuando esto cambia
      const auto     = esAuto();
      const clickMax = S.click.nivelOrbes >= CONFIG.CLICK_MAX_ORBES;
      const fragMax  = S.click.nivelFrags >= MEJORAS_FRAGS;
      const { tipo, cantidad } = costoMejoraClick();
      const puede    = tipo === "fragmentos" ? S.fragmentos >= cantidad : S.orbes >= cantidad;
      const stateKey = auto + "|" + clickMax + "|" + fragMax + "|" + S.click.nivelFrags + "|" + S.click.nivelOrbes + "|" + S.prefs?.idioma;

      if (mejBtn._stateKey !== stateKey) {
        mejBtn._stateKey = stateKey;
        // Reconstruir HTML estático
        if (auto) {
          mejBtn.innerHTML =
            T("click_automatizado") + "<br>" +
            "<span style='font-size:0.75em;opacity:0.6'>" + T("niv_label") + " " + nivelClickTotal() + " — " + poderClick() + " " + T("frags_click") + "</span><br>" +
            "<span style='font-size:0.75em;color:#34d399'>" + T("nucleo_activo_label") + "</span>";
          mejBtn.style.opacity = "0.35";
          mejBtn.style.pointerEvents = "none";
        } else if (clickMax && fragMax) {
          mejBtn.innerHTML =
            T("click_maximizado") + "<br>" +
            "<span style='font-size:0.75em;opacity:0.6'>" + T("niv_label") + " " + nivelClickTotal() + " — " + poderClick() + " " + T("frags_click") + "</span><br>" +
            "<span style='font-size:0.75em;color:#34d399'>" + T("desbloquea_auto") + "</span>";
          mejBtn.style.opacity = "0.35";
          mejBtn.style.pointerEvents = "none";
        } else if (clickMax) {
          const c = COSTO_FRAGS_POR_NIVEL[S.click.nivelFrags];
          mejBtn.innerHTML =
            T("click_maximizado") + "<br>" +
            "<span style='font-size:0.75em;opacity:0.7'>" + T("niv_label") + " " + nivelClickTotal() + " — " + poderClick() + " " + T("frags_click") + "</span><br>" +
            "<span style='font-size:0.75em;color:#00d4ff'>" + c + " " + T("frags_temp") + " <span style='opacity:0.5'>" + T("temp_label") + "</span></span>" +
            "<div style='margin-top:4px;background:rgba(0,212,255,0.15);border-radius:3px;height:3px'><div id='mejBarFill' style='background:#00d4ff;height:3px;border-radius:3px;width:0%'></div></div>";
        } else {
          const esFrags    = tipo === "fragmentos";
          const costoColor = esFrags ? "#00d4ff" : "#a78bfa";
          const costoLabel = esFrags
            ? cantidad + " Fragmentos <span style='opacity:0.5;font-size:0.85em'>(temp)</span>"
            : cantidad + " " + T("orbes_label") + " <span style='opacity:0.5;font-size:0.85em'>" + S.click.nivelOrbes + "/" + CONFIG.CLICK_MAX_ORBES + "</span>";
          const barColor = esFrags ? "#00d4ff" : "#a78bfa";
          const barBg    = esFrags ? "rgba(0,212,255,0.15)" : "rgba(167,139,250,0.15)";
          mejBtn.innerHTML =
            T("mejorar_click") + "<br>" +
            "<span style='font-size:0.75em;opacity:0.7'>" + T("niv") + " " + nivelClickTotal() + " — " + poderClick() + " " + T("frags_click") + "</span><br>" +
            "<span style='font-size:0.75em;color:" + costoColor + "'>" + costoLabel + "</span>" +
            "<div style='margin-top:4px;background:" + barBg + ";border-radius:3px;height:3px'><div id='mejBarFill' style='background:" + barColor + ";height:3px;border-radius:3px;width:0%'></div></div>";
        }
      }

      // Actualizar solo opacidad y barra — sin tocar innerHTML
      if (!auto && !(clickMax && fragMax)) {
        mejBtn.style.opacity = puede ? "1" : "0.4";
        mejBtn.style.pointerEvents = puede ? "auto" : "none";
        const fill = document.getElementById("mejBarFill");
        if (fill) {
          const pct = clickMax
            ? (S.click.nivelFrags / MEJORAS_FRAGS * 100)
            : tipo === "fragmentos"
              ? Math.min(100, S.fragmentos / cantidad * 100)
              : Math.min(100, S.click.nivelOrbes / CONFIG.CLICK_MAX_ORBES * 100);
          fill.style.width = pct + "%";
        }
      }
    }

    // boton recolectar — dim hasta listo
    const recBtn = document.getElementById("recolectarBtn");
    const recBar = document.getElementById("recolectarBar");
    if (recBtn) {
      const listo = S.arbol["romper"] ? S.fragmentos > 0 : frags >= CONFIG.recolectar.umbral;
      const pct   = S.arbol["romper"] ? 100 : Math.min(100, (frags / CONFIG.recolectar.umbral) * 100);
      recBtn.classList.toggle("ready", listo);
      // Opacidad y color se gradúan con el progreso
      recBtn.style.opacity = listo ? "1" : (0.3 + (pct / 100) * 0.5).toFixed(2);
      recBtn.style.pointerEvents = listo ? "auto" : (pct > 0 ? "auto" : "none");
      if (recBar) recBar.style.width = pct + "%";
    }

    // gens A
    CONFIG.generadoresA.forEach(cfg => {
      const gs      = S.gensA[cfg.id];
      const total   = totalGenA(cfg.id);
      const desbloq = S.gensDesbloqueados[cfg.id];
      const box     = document.getElementById("genBox_" + cfg.id);
      if (box) box.classList.toggle("locked", !desbloq);
      const totEl  = document.getElementById("genTotal_" + cfg.id);
      const compEl = document.getElementById("genComp_"  + cfg.id);
      const infoEl = document.getElementById("genInfo_"  + cfg.id);
      if (!desbloq) {
        if (totEl)  totEl.innerText  = "???";
        if (compEl) compEl.innerText = "";
        if (infoEl) infoEl.innerText = T("gen_bloqueado");
        return;
      }
      if (totEl)  totEl.innerText  = T("gen_total") + ": " + fmt(total);
      if (compEl) compEl.innerText = T("gen_manual") + ": " + gs.comprados + (gs.sinteticos > 0 ? " (+" + fmt(gs.sinteticos) + " " + T("gen_sint") + ")" : "");
      if (infoEl) {
        const prod     = total * cfg.prod * bonusManual(gs.comprados);
        const mp       = multPrisma();
        const prodReal = Math.floor(prod * mp);
        const mpStr    = mp > 1.01 ? " <span style='color:#a78bfa;font-size:0.85em'>×" + mp.toFixed(2) + " Prisma</span>" : "";
        infoEl.innerHTML = "<span class='genProd'>+" + fmt(prodReal) + "/tick</span>" + mpStr + "<br><span style='opacity:0.5'>Costo: " + fmt(gs.costo) + " <span style='color:#a78bfa'>Orbes</span></span>";
      }
      if (box) box.classList.toggle("produciendo", total > 0);
    });

    // progreso narrativo
    this.actualizarProgreso();
    if (S.flags.clickEliminado && esAuto()) {
      const btn = document.getElementById("clickBtn");
      if (btn && !btn._autoPulseInterval) {
        btn._autoPulseInterval = setInterval(() => {
          btn.classList.add("autoPulse");
          setTimeout(() => btn.classList.remove("autoPulse"), 120);
          UI.crearParticulas();
        }, Math.round(1000 / clicksPs()));
      }
    }

    // logros
    CONFIG.logros.forEach(l => {
      const el = document.getElementById("logro_" + l.id);
      if (el) el.classList.toggle("obtenido", !!S.logros[l.id]);
    });
  },

  activarOrb() {
    if (!this.orb) return;
    if (!this.orb.classList.contains("active")) {
      this.orb.classList.add("active");
      this.orb.classList.remove("dead");
    }
  },

  crearParticulas() {
    if (!this.orbParticles) return;
    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const a = Math.random() * Math.PI * 2;
      p.style.setProperty("--x", Math.cos(a)*40+"px");
      p.style.setProperty("--y", Math.sin(a)*40+"px");
      p.style.left = "50%"; p.style.top = "50%";
      this.orbParticles.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  },

  crearRayo() {
    if (!this.orbRays) return;
    const r = document.createElement("div");
    r.className = "ray";
    r.style.setProperty("--rot", Math.random()*360+"deg");
    this.orbRays.appendChild(r);
    setTimeout(() => r.remove(), 500);
  },

  animarRecolectar() {
    for (let i = 0; i < 20; i++) setTimeout(() => this.crearParticulas(), i*20);
    if (!this.orb) return;
    this.orb.classList.add("collapse");
    setTimeout(() => {
      this.orb.classList.remove("active","collapse");
      this.orb.classList.add("dead");
    }, 600);
  },

  animarTransicionIdle() {
    // solo ocultar mejorar click y cooldown
    ["mejorarClickBtn","cdContainer"].forEach(id => {
      const b = document.getElementById(id);
      if (!b) return;
      b.style.transition = "opacity 1.5s, transform 1.5s";
      b.style.opacity    = "0";
      b.style.transform  = "scale(0.8)";
    });
    setTimeout(() => {
      ["mejorarClickBtn","cdContainer"].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.style.display = "none";
      });
      // agrandar orb
      if (this.orb) {
        this.orb.style.transition = "width 1.5s, height 1.5s";
        this.orb.style.width  = "180px";
        this.orb.style.height = "180px";
      }
      // click btn pasa a modo auto
      const btn = document.getElementById("clickBtn");
      if (btn) {
        btn.classList.add("autoMode");
        btn.style.pointerEvents = "none";
        btn.style.cursor = "default";
      }
      const is = document.getElementById("idleStats");
      if (is) {
        is.style.display    = "flex";
        is.style.opacity    = "0";
        is.style.transition = "opacity 1.5s";
        setTimeout(() => is.style.opacity = "1", 100);
      }
    }, 1500);
  },

  restaurarIdle() {
    ["mejorarClickBtn","cdContainer"].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.style.display = "none";
    });
    if (this.orb) { this.orb.style.width="180px"; this.orb.style.height="180px"; }
    const btn = document.getElementById("clickBtn");
    if (btn) { btn.classList.add("autoMode"); btn.style.pointerEvents="none"; }
    const is = document.getElementById("idleStats");
    if (is) is.style.display = "flex";
  },

  notifLogro(l) { notif("Logro: " + l.label, l.desc, "#f59e0b"); },
};