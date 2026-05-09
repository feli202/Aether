// ============================================================
// AETHER — DEV.JS
// ============================================================
// ┌─────────────────────────────────────────────────────────┐
// │  ACTIVAR / DESACTIVAR MODO DEV                          │
// │    true  → panel visible, atajos activos                │
// │    false → modo producción (invisible para el jugador)  │
// └─────────────────────────────────────────────────────────┘
const DEV_MODE = true;
// ─────────────────────────────────────────────────────────────

const DEV = {
  panel:           null,
  visible:         false,
  _autoTickTimer:  null,
  _autoTickActive: false,
  _logLines:       [],   // historial — DISTINTO del método _log()

  init() {
    // M = mute (siempre, incluso en producción)
    document.addEventListener("keydown", e => {
      if (e.key === "m" || e.key === "M") {
        if (!window.AudioMgr?._ready) return;
        AudioMgr._muted = !AudioMgr._muted;
        AudioMgr._muted ? AudioMgr.ctx?.suspend() : AudioMgr.ctx?.resume();
      }
      if (DEV_MODE && (e.key === "`" || e.key === "~")) this.toggle();
    });
    if (!DEV_MODE) return;
    this._crearPanel();
    this._crearBotonFlotante();
  },

  // ── Panel ────────────────────────────────────────────────
  _crearPanel() {
    const p = document.createElement("div");
    p.id = "devPanel";
    p.innerHTML = `
      <div id="devHeader">
        <span>⚙ DEV</span>
        <div id="devTabs">
          <button class="devTab active" data-sec="recursos">RECURSOS</button>
          <button class="devTab" data-sec="estado">ESTADO</button>
          <button class="devTab" data-sec="tiempo">TIEMPO</button>
          <button class="devTab" data-sec="arbol">ÁRBOL</button>
          <button class="devTab" data-sec="sim">SIM</button>
        </div>
        <button id="devClose">✕</button>
      </div>
      <div id="devBody">

        <!-- RECURSOS -->
        <div class="devSec" id="devSec_recursos">
          <div class="devGroup">
            <label>Fragmentos</label>
            <div class="devRow">
              <button onclick="DEV.addFrags(100)">+100</button>
              <button onclick="DEV.addFrags(1000)">+1K</button>
              <button onclick="DEV.addFrags(1e6)">+1M</button>
              <button onclick="DEV.setFrags(0)" class="devDanger">Reset</button>
            </div>
            <div class="devRow">
              <input id="devFragInput" type="number" placeholder="cantidad exacta" />
              <button onclick="DEV.setFrags(+document.getElementById('devFragInput').value)">SET</button>
            </div>
          </div>
          <div class="devGroup">
            <label>Orbes</label>
            <div class="devRow">
              <button onclick="DEV.addOrbes(10)">+10</button>
              <button onclick="DEV.addOrbes(100)">+100</button>
              <button onclick="DEV.addOrbes(1000)">+1K</button>
              <button onclick="DEV.setOrbes(0)" class="devDanger">Reset</button>
            </div>
            <div class="devRow">
              <input id="devOrbeInput" type="number" placeholder="cantidad exacta" />
              <button onclick="DEV.setOrbes(+document.getElementById('devOrbeInput').value)">SET</button>
            </div>
          </div>
          <div class="devGroup">
            <label>Generadores A</label>
            <div class="devRow"><span>G1A:</span>
              <button onclick="DEV.addGen('g1a',1)">+1</button>
              <button onclick="DEV.addGen('g1a',10)">+10</button>
              <button onclick="DEV.addGen('g1a',50)">+50</button>
            </div>
            <div class="devRow"><span>G2A:</span>
              <button onclick="DEV.addGen('g2a',1)">+1</button>
              <button onclick="DEV.addGen('g2a',10)">+10</button>
              <button onclick="DEV.addGen('g2a',50)">+50</button>
            </div>
            <div class="devRow"><span>G3A:</span>
              <button onclick="DEV.addGen('g3a',1)">+1</button>
              <button onclick="DEV.addGen('g3a',10)">+10</button>
              <button onclick="DEV.addGen('g3a',50)">+50</button>
            </div>
            <button onclick="DEV.resetGens()" class="devDanger" style="margin-top:4px;width:100%">Reset todos</button>
          </div>
          <div class="devGroup">
            <label>Prismas / Catalizadores</label>
            <div class="devRow"><span>Prismas:</span>
              <button onclick="DEV.addPrismas(1)">+1</button>
              <button onclick="DEV.addPrismas(5)">+5</button>
              <button onclick="DEV.setPrismas(0)" class="devDanger">Reset</button>
            </div>
            <div class="devRow"><span>Cats:</span>
              <button onclick="DEV.addCat(1)">+1</button>
              <button onclick="DEV.addCat(3)">+3 (prestige)</button>
              <button onclick="DEV.setCat(0)" class="devDanger">Reset</button>
            </div>
          </div>
          <div class="devGroup">
            <label>Stats</label>
            <div class="devRow">
              <button onclick="DEV.addRecolecciones(10)">+10 rec</button>
              <button onclick="DEV.addRecolecciones(100)">+100 rec</button>
              <button onclick="DEV.addOrbesTotal(1000)">+1K orbes total</button>
            </div>
          </div>
        </div>

        <!-- ESTADO -->
        <div class="devSec" id="devSec_estado" style="display:none">
          <div class="devGroup">
            <label>Forzar Estado Cósmico</label>
            <div class="devRow devWrap">
              <button onclick="DEV.irEstado(0)">0</button>
              <button onclick="DEV.irEstado(1)">1 - 1ªRec</button>
              <button onclick="DEV.irEstado(2)">2 - G2A</button>
              <button onclick="DEV.irEstado(3)">3 - G3A</button>
              <button onclick="DEV.irEstado(4)">4 - Auto</button>
              <button onclick="DEV.irEstado(5)">5 - Prestige</button>
            </div>
            <div id="devEstadoActual" style="margin-top:5px;color:#94a3b8;font-size:10px"></div>
          </div>
          <div class="devGroup">
            <label>Flags</label>
            <div class="devRow devWrap">
              <button onclick="DEV.toggleFlag('primeraRecoleccion')">primeraRec</button>
              <button onclick="DEV.toggleFlag('panelBDesbloqueado')">panelB</button>
              <button onclick="DEV.toggleFlag('catalizadorRevelado')">catRevelado</button>
              <button onclick="DEV.toggleFlag('clickEliminado')">clickElim</button>
              <button onclick="DEV.toggleFlag('prestigeDisponible')">prestige</button>
            </div>
            <div id="devFlagsStatus" style="font-size:9px;color:#64748b;margin-top:4px;line-height:1.8"></div>
          </div>
          <div class="devGroup">
            <label>Acciones</label>
            <div class="devRow devWrap">
              <button onclick="DEV.forzarPrestige()">⚡ Prestige</button>
              <button onclick="DEV.desbloquearTodo()">🔓 Desbloquear todo</button>
              <button onclick="DEV.resetSave()" class="devDanger">🗑 Reset Save</button>
            </div>
          </div>
        </div>

        <!-- TIEMPO -->
        <div class="devSec" id="devSec_tiempo" style="display:none">
          <div class="devGroup">
            <label>Simular tiempo offline</label>
            <div class="devRow">
              <button onclick="DEV.simOffline(60)">1m</button>
              <button onclick="DEV.simOffline(600)">10m</button>
              <button onclick="DEV.simOffline(1800)">30m</button>
              <button onclick="DEV.simOffline(3600)">1h</button>
              <button onclick="DEV.simOffline(10800)">3h</button>
            </div>
            <div class="devRow" style="margin-top:4px">
              <input id="devSegInput" type="number" placeholder="segundos" />
              <button onclick="DEV.simOffline(+document.getElementById('devSegInput').value)">SIM</button>
            </div>
            <div id="devTickStatus" style="font-size:10px;color:#94a3b8;margin-top:4px"></div>
          </div>
          <div class="devGroup">
            <label>Auto-tick ×10</label>
            <div class="devRow">
              <button id="devAutoTickBtn" onclick="DEV.toggleAutoTick()">▶ Activar</button>
            </div>
          </div>
        </div>

        <!-- ÁRBOL -->
        <div class="devSec" id="devSec_arbol" style="display:none">
          <div class="devGroup">
            <label>Toggle nodos (gratis)</label>
            <div class="devRow devWrap" id="devArbolNodos"></div>
          </div>
          <div class="devGroup">
            <label>Masivo</label>
            <div class="devRow">
              <button onclick="DEV.comprarTodoArbol()">✅ Todos</button>
              <button onclick="DEV.resetArbol()" class="devDanger">↺ Etéreo</button>
              <button onclick="DEV.resetArbolEterno()" class="devDanger">↺ Eterno</button>
            </div>
          </div>
        </div>

        <!-- SIM -->
        <div class="devSec" id="devSec_sim" style="display:none">
          <div class="devGroup">
            <label>Producción actual</label>
            <div id="devSimStats" style="font-size:11px;line-height:2;color:#94a3b8"></div>
            <button onclick="DEV.actualizarSimStats()" style="margin-top:5px">↻ Refresh</button>
          </div>
          <div class="devGroup">
            <label>Proyección prestige</label>
            <div id="devSimProjection" style="font-size:11px;line-height:1.8;color:#94a3b8"></div>
            <button onclick="DEV.proyectarPrestige()" style="margin-top:5px">Calcular</button>
          </div>
          <div class="devGroup">
            <label>Log acciones</label>
            <div id="devLog" style="font-size:10px;line-height:1.7;color:#475569;max-height:110px;overflow-y:auto"></div>
            <button onclick="DEV._logLines=[];DEV._renderLog()" class="devDanger" style="margin-top:4px">Limpiar</button>
          </div>
        </div>

      </div>
      <div id="devFooter"><span id="devLiveStats"></span></div>
    `;
    document.body.appendChild(p);
    this.panel = p;

    p.querySelectorAll(".devTab").forEach(tab => {
      tab.addEventListener("click", () => {
        p.querySelectorAll(".devTab").forEach(t => t.classList.remove("active"));
        p.querySelectorAll(".devSec").forEach(s => s.style.display = "none");
        tab.classList.add("active");
        const sec = p.querySelector("#devSec_" + tab.dataset.sec);
        if (sec) sec.style.display = "block";
        if (tab.dataset.sec === "arbol") this._renderArbolNodos();
        if (tab.dataset.sec === "sim")   this.actualizarSimStats();
        if (tab.dataset.sec === "estado") this._renderFlags();
      });
    });
    p.querySelector("#devClose").addEventListener("click", () => this.toggle());
    this._inyectarEstilos();
    this._startLiveStats();
  },

  _crearBotonFlotante() {
    const btn = document.createElement("button");
    btn.id = "devToggleBtn";
    btn.textContent = "DEV";
    btn.addEventListener("click", () => this.toggle());
    document.body.appendChild(btn);
  },

  toggle() {
    this.visible = !this.visible;
    this.panel.style.display = this.visible ? "flex" : "none";
    if (this.visible) { this._renderFlags(); this._renderArbolNodos(); this.actualizarSimStats(); }
  },

  // ── RECURSOS ────────────────────────────────────────────
  addFrags(n)  { S.fragmentos += n; S.stats.fragsTotal += n; this._log("+" + fmt(n) + " frags"); },
  setFrags(n)  { S.fragmentos = n; this._log("Frags → " + fmt(n)); },
  addOrbes(n)  { S.orbes += n; S.stats.orbesTotal += n; this._log("+" + fmt(n) + " orbes"); },
  setOrbes(n)  { S.orbes = n; this._log("Orbes → " + fmt(n)); },

  addGen(id, n) {
    if (!S.gensDesbloqueados[id]) S.gensDesbloqueados[id] = true;
    S.gensA[id].comprados = (S.gensA[id].comprados || 0) + n;
    const cfg = CONFIG.generadoresA.find(c => c.id === id);
    S.gensA[id].costo = Math.ceil(cfg.costoBase * Math.pow(cfg.costoMult, S.gensA[id].comprados));
    this._log("+" + n + " " + id);
    chequearDesbloqueos();
  },

  resetGens() {
    CONFIG.generadoresA.forEach(c => { S.gensA[c.id].comprados=0; S.gensA[c.id].sinteticos=0; S.gensA[c.id].costo=c.costoBase; });
    S.gensDesbloqueados = { g1a:true, g2a:false, g3a:false };
    this._log("Gens reseteados");
  },

  addPrismas(n) {
    S.prismas = (S.prismas||0) + n;
    S.stats.totalPrismas = (S.stats.totalPrismas||0) + n;
    if (!S.flags.panelBDesbloqueado) { S.flags.panelBDesbloqueado=true; UI.mostrarPanelB(); }
    if (!S.flags.catalizadorRevelado && S.prismas>=1) { S.flags.catalizadorRevelado=true; UI._revelarCatalizador(); }
    this._log("+" + n + " prismas → " + S.prismas);
  },
  setPrismas(n) { S.prismas=n; S.stats.totalPrismas=Math.max(S.stats.totalPrismas||0,n); this._log("Prismas → "+n); },

  addCat(n) {
    S.catalizadores = (S.catalizadores||0)+n;
    if (!S.flags.catalizadorRevelado) { S.flags.catalizadorRevelado=true; UI._revelarCatalizador(); }
    this._log("+" + n + " cats → " + S.catalizadores);
    chequearPrestige();
  },
  setCat(n) { S.catalizadores=n; this._log("Cats → "+n); },

  addRecolecciones(n) { S.stats.recolecciones=(S.stats.recolecciones||0)+n; this._log("+"+n+" rec"); chequearLogros(); },
  addOrbesTotal(n)    { S.stats.orbesTotal=(S.stats.orbesTotal||0)+n; chequearLogros(); },

  // ── ESTADO ──────────────────────────────────────────────
  irEstado(n) {
    if (n>=1) { S.flags.primeraRecoleccion=true; S.stats.recolecciones=Math.max(1,S.stats.recolecciones||0); }
    if (n>=2) { this.addGen("g2a",1); }
    if (n>=3) { this.addGen("g3a",1); S.flags.panelBDesbloqueado=true; UI.mostrarPanelB(); }
    if (n>=4) { S.arbol["auto"]=S.arbol["vel1"]=S.arbol["vel2"]=S.arbol["vel3"]=S.arbol["vel4"]=true; S.flags.clickEliminado=true; setTimeout(()=>UI.animarTransicionIdle(),200); }
    if (n>=5) { this.forzarPrestige(); return; }
    this._log("→ Estado " + n);
    chequearDesbloqueos(); chequearLogros(); this._renderFlags();
  },

  toggleFlag(flag) { S.flags[flag]=!S.flags[flag]; this._log("flag."+flag+" → "+S.flags[flag]); this._renderFlags(); },

  _renderFlags() {
    const el = document.getElementById("devFlagsStatus");
    if (el) el.innerHTML = Object.entries(S.flags).map(([k,v])=>`<span style="color:${v?"#34d399":"#ef4444"}">${v?"✓":"✗"} ${k}</span>`).join("  ");
    const ea = document.getElementById("devEstadoActual");
    if (ea) ea.textContent = "Estado actual: " + calcularEstadoCosmico();
  },

  forzarPrestige() {
    CONFIG.arbol.filter(n=>n.tipo==="eterno").forEach(n=>{ S.arbol[n.id]=true; });
    S.catalizadores = Math.max(S.catalizadores, CONFIG.catalizador.catalizadoresParaPrestige);
    S.flags.prestigeDisponible = true;
    UI.mostrarPrestige();
    this._log("✦ Prestige");
  },

  desbloquearTodo() {
    S.gensDesbloqueados={g1a:true,g2a:true,g3a:true};
    S.flags.panelBDesbloqueado=S.flags.catalizadorRevelado=S.flags.primeraRecoleccion=true;
    this.addOrbes(500);
    UI.mostrarPanelB(); UI._revelarCatalizador(); chequearDesbloqueos();
    this._log("Todo desbloqueado");
  },

  resetSave() {
    if (!confirm("⚠ Reset permanente. ¿Continuar?")) return;
    localStorage.removeItem(SAVE_KEY); location.reload();
  },

  // ── TIEMPO ──────────────────────────────────────────────
  simOffline(seg) {
    const gan = Math.floor(prodFragmentos() * calcTickspeed() * seg);
    S.fragmentos += gan; S.stats.fragsTotal += gan;
    const lbl = seg>=60 ? Math.floor(seg/60)+"m" : seg+"s";
    this._log("Sim "+lbl+" → +"+fmt(gan)+" frags");
    const el = document.getElementById("devTickStatus");
    if (el) el.textContent = "Último: +"+fmt(gan)+" frags ("+lbl+")";
  },

  toggleAutoTick() {
    this._autoTickActive = !this._autoTickActive;
    const btn = document.getElementById("devAutoTickBtn");
    if (this._autoTickActive) {
      this._autoTickTimer = setInterval(()=>{
        const p = prodFragmentos()*calcTickspeed();
        S.fragmentos+=p; S.stats.fragsTotal+=p; S.stats.tiempoJugado++;
      }, 100);
      if (btn) btn.textContent = "⏸ Detener";
      this._log("Auto-tick ON");
    } else {
      clearInterval(this._autoTickTimer);
      if (btn) btn.textContent = "▶ Activar";
      this._log("Auto-tick OFF");
    }
  },

  // ── ÁRBOL ───────────────────────────────────────────────
  _renderArbolNodos() {
    const cont = document.getElementById("devArbolNodos");
    if (!cont) return;
    cont.innerHTML = "";
    CONFIG.arbol.forEach(n => {
      const comp = S.arbol[n.id];
      const btn = document.createElement("button");
      btn.textContent = (comp?"✓ ":"") + n.id;
      btn.style.background  = comp?"#064e3b":(n.tipo==="eterno"?"#3b1a6b":"");
      btn.style.borderColor = n.tipo==="eterno"?"#a78bfa":"";
      btn.title = TL(n)+" ("+n.costo+" orbes)";
      btn.addEventListener("click", ()=>{
        S.arbol[n.id]=!S.arbol[n.id];
        this._log((S.arbol[n.id]?"✓":"✗")+" "+n.id);
        chequearDesbloqueos(); chequearPrestige(); chequearLogros();
        if (window.ArbolGrafo) ArbolGrafo.actualizarNodo(n.id);
        this._renderArbolNodos();
      });
      cont.appendChild(btn);
    });
  },

  comprarTodoArbol() {
    CONFIG.arbol.forEach(n=>{ S.arbol[n.id]=true; });
    if (window.ArbolGrafo) { try{ ArbolGrafo.redibujar(); }catch(e){} }
    chequearDesbloqueos(); chequearPrestige(); chequearLogros();
    this._renderArbolNodos(); this._log("✅ Todos comprados");
  },

  resetArbol()      { CONFIG.arbol.filter(n=>n.tipo==="etereo").forEach(n=>{ S.arbol[n.id]=false; }); this._renderArbolNodos(); this._log("↺ Etéreo reset"); },
  resetArbolEterno(){ CONFIG.arbol.filter(n=>n.tipo==="eterno").forEach(n=>{ S.arbol[n.id]=false; }); S.flags.prestigeDisponible=false; this._renderArbolNodos(); this._log("↺ Eterno reset"); },

  // ── SIMULACIÓN ──────────────────────────────────────────
  actualizarSimStats() {
    const el = document.getElementById("devSimStats");
    if (!el) return;
    const prod=prodFragmentos(), ts=calcTickspeed(), pps=prod*ts;
    el.innerHTML = [
      `Prod/tick: <b style="color:#00d4ff">${fmt(prod)}</b>`,
      `Tickspeed: <b style="color:#34d399">${ts.toFixed(3)}</b>`,
      `Frags/s: <b style="color:#00d4ff">${fmt(pps)}</b>`,
      `Orbes/rec: <b style="color:#a78bfa">${fmt(calcOrbes())}</b>`,
      `multPrisma: <b>${multPrisma().toFixed(3)}</b>  multCat: <b>${multCatalizador().toFixed(3)}</b>`,
      `Estado: <b>${calcularEstadoCosmico()}</b>  Frags: <b>${fmt(S.fragmentos)}</b>  Orbes: <b>${fmt(S.orbes)}</b>`,
      `Prismas: <b>${S.prismas}</b>  Cats: <b>${S.catalizadores}</b>  Recs: <b>${S.stats.recolecciones}</b>`,
    ].map(s=>`<div>${s}</div>`).join("");
  },

  proyectarPrestige() {
    const el = document.getElementById("devSimProjection");
    if (!el) return;
    const falt = CONFIG.arbol.filter(n=>n.tipo==="eterno"&&!S.arbol[n.id]);
    const catF = Math.max(0, CONFIG.catalizador.catalizadoresParaPrestige - S.catalizadores);
    const pps  = prodFragmentos() * calcTickspeed();
    let html   = pps<0.001
      ? "<div style='color:#ef4444'>Prod 0 — comprá gens.</div>"
      : `<div>Frags/s: <b>${fmt(pps)}</b></div><div>Secs/rec: <b>${(CONFIG.recolectar.umbral/pps).toFixed(1)}</b></div>`
        +`<div>Eternos faltantes: <b>${falt.map(n=>n.id).join(", ")||"ninguno"}</b></div>`
        +`<div>Cats faltantes: <b>${catF}</b></div>`
        +(!falt.length&&!catF?`<div style="color:#34d399;margin-top:4px">✅ Listo para prestige.</div>`:"");
    el.innerHTML = html;
  },

  // ── LOG ─────────────────────────────────────────────────
  _log(msg) {
    const ts = new Date().toLocaleTimeString("es",{hour12:false});
    this._logLines.unshift("["+ts+"] "+msg);
    if (this._logLines.length > 20) this._logLines.pop();
    this._renderLog();
  },
  _renderLog() {
    const el = document.getElementById("devLog");
    if (el) el.innerHTML = this._logLines.join("<br>");
  },

  // ── LIVE STATS ──────────────────────────────────────────
  _startLiveStats() {
    setInterval(()=>{
      if (!this.visible) return;
      const el = document.getElementById("devLiveStats");
      if (!el) return;
      el.textContent = `frags:${fmt(S.fragmentos)} | orbes:${fmt(S.orbes)} | pps:${fmt(prodFragmentos()*calcTickspeed())} | ts:${calcTickspeed().toFixed(2)}`;
    }, 500);
  },

  // ── ESTILOS ─────────────────────────────────────────────
  _inyectarEstilos() {
    const s = document.createElement("style");
    s.textContent = `
      #devToggleBtn {
        position:fixed;bottom:60px;right:10px;z-index:9998;
        background:#06060f;color:#1e3a5f;border:1px solid #0f1e30;
        border-radius:3px;padding:3px 8px;font-size:9px;letter-spacing:1px;
        font-family:'DM Mono',monospace;cursor:pointer;opacity:0.55;pointer-events:auto;
      }
      #devToggleBtn:hover{opacity:1;color:#00d4ff;border-color:#1e3a5f;}
      #devPanel {
        display:none;flex-direction:column;
        position:fixed;top:8px;right:8px;
        width:355px;max-height:88vh;
        background:#06090f;border:1px solid #0e2240;border-radius:6px;
        z-index:9999;font-family:'DM Mono',monospace;font-size:11px;
        color:#64748b;box-shadow:0 8px 40px rgba(0,0,50,0.8);
        overflow:hidden;pointer-events:auto;
      }
      #devHeader {
        display:flex;align-items:center;gap:6px;
        padding:6px 10px;background:#080e1c;
        border-bottom:1px solid #0e2240;flex-shrink:0;
      }
      #devHeader>span{color:#00d4ff;font-weight:bold;flex-shrink:0;font-size:10px;letter-spacing:2px;}
      #devTabs{display:flex;gap:3px;flex-wrap:wrap;flex:1;}
      .devTab {
        background:#06090f;border:1px solid #0e2240;color:#1e4060;
        border-radius:2px;padding:2px 6px;font-size:9px;letter-spacing:0.5px;
        cursor:pointer;font-family:'DM Mono',monospace;transition:all 0.12s;
      }
      .devTab.active{background:#091830;color:#38bdf8;border-color:#1e4060;}
      .devTab:hover:not(.active){color:#334d6b;}
      #devClose{background:none;border:none;color:#1e3a5f;cursor:pointer;font-size:12px;padding:2px 4px;flex-shrink:0;}
      #devClose:hover{color:#94a3b8;}
      #devBody{padding:9px;overflow-y:auto;flex:1;}
      .devGroup{margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #0a1525;}
      .devGroup:last-child{border-bottom:none;margin-bottom:0;}
      .devGroup label{display:block;color:#1e3a5f;font-size:9px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;}
      .devRow{display:flex;gap:3px;align-items:center;margin-bottom:3px;flex-wrap:wrap;}
      .devRow span{color:#334d6b;font-size:9px;min-width:32px;}
      #devBody button {
        background:#07111e;border:1px solid #0e2240;color:#38bdf8;
        border-radius:2px;padding:2px 7px;cursor:pointer;
        font-family:'DM Mono',monospace;font-size:9px;white-space:nowrap;
        transition:background 0.1s;
      }
      #devBody button:hover{background:#0e2240;color:#7dd3fc;}
      #devBody button.devDanger{border-color:#3b0f0f;color:#fca5a5;}
      #devBody button.devDanger:hover{background:#3b0f0f;}
      #devBody input[type=number]{
        background:#06090f;border:1px solid #0e2240;
        color:#94a3b8;border-radius:2px;padding:2px 6px;
        font-family:'DM Mono',monospace;font-size:9px;width:105px;
      }
      #devFooter{padding:4px 10px;background:#04060c;border-top:1px solid #0a1525;flex-shrink:0;}
      #devLiveStats{font-size:9px;color:#0e2240;font-family:'DM Mono',monospace;}
    `;
    document.head.appendChild(s);
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ()=>DEV.init());
} else {
  DEV.init();
}