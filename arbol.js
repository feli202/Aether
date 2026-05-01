// ============================================================
// AETHER — ARBOL.JS
// ArbolGrafo - canvas 2D, pan, nodos separados
// ============================================================

var ArbolGrafo = {
  canvas: null, ctx: null,
  w: 0, h: 0,
  nodos: [],
  dragging: null,
  animFrame: null,
  panX: 0, panY: 0,
  panning: false,
  scale: 0.85,       // empieza un poco alejado
  MIN_SCALE: 0.3,
  MAX_SCALE: 2.0,

  init(canvasEl) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvasEl.offsetWidth  || 1200;
    const h = canvasEl.offsetHeight || 600;
    canvasEl.width  = w * dpr;
    canvasEl.height = h * dpr;
    canvasEl.style.width  = w + "px";
    canvasEl.style.height = h + "px";
    const ctx = canvasEl.getContext("2d");
    ctx.scale(dpr, dpr);
    this.canvas = canvasEl;
    this.ctx = ctx;
    this.w = w; this.h = h;
    this.panX = 0; this.panY = 0;
    this.construirNodos();
    this.bindEventos();
    this.loop();
  },

  initHD(canvasEl, w, h, dpr) {
    this.canvas = canvasEl;
    this.ctx    = canvasEl.getContext("2d");
    this.w = w; this.h = h;
    if (!this.panX) this.panX = 0;
    if (!this.panY) this.panY = 0;
    this.construirNodos();
    if (!this.animFrame) { this.bindEventos(); this.loop(); }
  },

  construirNodos() {
    const cw = this.w || (this.canvas ? parseInt(this.canvas.style.width)  || this.canvas.offsetWidth  || 1200 : 1200);
    const ch = this.h || (this.canvas ? parseInt(this.canvas.style.height) || this.canvas.offsetHeight || 600  : 600);
    const cx = cw / 2 + (this.panX || 0);
    const cy = ch / 2 + (this.panY || 0);
    const ESCALA = 1.4;
    this.nodos = CONFIG.arbol.map(cfg => ({
      id: cfg.id,
      x:  cx + cfg.x * ESCALA,
      y:  cy + cfg.y * ESCALA,
      vx: 0, vy: 0,
      targetX: cx + cfg.x * ESCALA,
      targetY: cy + cfg.y * ESCALA,
      radio: 22,
    }));
  },

  centrar() {
    if (!this.canvas) return;
    this.panX  = 0;
    this.panY  = 0;
    this.scale = 0.85;
    this.construirNodos();
  },

  getNodo(id) { return this.nodos.find(n => n.id === id); },

  loop() {
    if (!this._running) return;
    this.simular();
    this.dibujar();
    this.animFrame = requestAnimationFrame(() => this.loop());
  },

  simular() {
    const RESORTE = 0.08;
    const DAMPING = 0.75;
    const REPULSA = 1400;

    for (const n of this.nodos) {
      if (this.dragging === n.id) continue;
      n.vx += (n.targetX - n.x) * RESORTE;
      n.vy += (n.targetY - n.y) * RESORTE;
      for (const o of this.nodos) {
        if (o.id === n.id) continue;
        const ex = n.x - o.x, ey = n.y - o.y;
        const dist = Math.sqrt(ex*ex + ey*ey) || 1;
        if (dist < 110) {
          const f = REPULSA / (dist * dist);
          n.vx += (ex/dist)*f; n.vy += (ey/dist)*f;
        }
      }
      n.vx *= DAMPING; n.vy *= DAMPING;
      n.x += n.vx; n.y += n.vy;
    }
  },

  dibujar() {
    const ctx = this.ctx;
    const W = this.w || parseInt(this.canvas.style.width)  || this.canvas.offsetWidth;
    const H = this.h || parseInt(this.canvas.style.height) || this.canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Aplicar zoom centrado en el canvas
    ctx.save();
    const cx = W / 2, cy = H / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-cx, -cy);

    // conexiones
    for (const cfg of CONFIG.arbol) {
      if (!cfg.req) continue;
      const a = this.getNodo(cfg.id), b = this.getNodo(cfg.req);
      if (!a || !b) continue;
      const comp = S.arbol[cfg.id], reqComp = S.arbol[cfg.req];
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y);
      if (comp) {
        ctx.strokeStyle="rgba(0,212,255,0.6)"; ctx.lineWidth=2;
        ctx.shadowBlur=8; ctx.shadowColor="#00d4ff";
      } else if (reqComp) {
        ctx.strokeStyle="rgba(0,212,255,0.25)"; ctx.lineWidth=1.5; ctx.shadowBlur=0;
      } else {
        ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1; ctx.shadowBlur=0;
      }
      ctx.stroke(); ctx.shadowBlur=0;
    }

    // nodos
    for (const cfg of CONFIG.arbol) {
      const n = this.getNodo(cfg.id);
      if (!n) continue;
      const comp = S.arbol[cfg.id];
      const reqOk = !cfg.req || S.arbol[cfg.req];
      const clickOk = cfg.id !== "auto" || S.click.nivelOrbes >= CONFIG.CLICK_MAX_ORBES;
      const disp = reqOk && clickOk && !comp;
      const paga = S.orbes >= cfg.costo;
      const aseq = disp && paga;
      const esClic = cfg.sec === "clicks";

      ctx.save(); ctx.translate(n.x, n.y);

      if (comp)      { ctx.shadowBlur=18; ctx.shadowColor="#00d4ff"; }
      else if (aseq) { ctx.shadowBlur=10; ctx.shadowColor="rgba(0,212,255,0.5)"; }
      else           { ctx.shadowBlur=0; }

      ctx.beginPath();
      if (esClic) {
        ctx.arc(0, 0, n.radio, 0, Math.PI*2);
      } else {
        const r = n.radio * 1.1;
        ctx.moveTo(0,-r); ctx.lineTo(r,0); ctx.lineTo(0,r); ctx.lineTo(-r,0); ctx.closePath();
      }

      if (comp)       { ctx.fillStyle="rgba(0,212,255,0.25)"; ctx.strokeStyle="#00d4ff"; ctx.lineWidth=2; }
      else if (aseq)  { ctx.fillStyle="rgba(0,212,255,0.1)";  ctx.strokeStyle="rgba(0,212,255,0.7)"; ctx.lineWidth=1.5; }
      else if (disp)  { ctx.fillStyle="rgba(255,255,255,0.03)"; ctx.strokeStyle="rgba(255,255,255,0.2)"; ctx.lineWidth=1; }
      else            { ctx.fillStyle="rgba(255,255,255,0.01)"; ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=1; }
      ctx.fill(); ctx.stroke();

      ctx.shadowBlur=0;
      ctx.font = comp ? "bold 8px sans-serif" : "8px sans-serif";
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillStyle = comp ? "#00d4ff" : disp ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)";

      const label = TL(cfg);
      const pals  = label.split(" ");
      if (pals.length > 1 && label.length > 10) {
        const mid = Math.ceil(pals.length/2);
        ctx.fillText(pals.slice(0,mid).join(" "), 0, -5);
        ctx.fillText(pals.slice(mid).join(" "),   0,  5);
      } else {
        ctx.fillText(label, 0, 0);
      }

      if (!comp && disp) {
        ctx.font="7px sans-serif";
        ctx.fillStyle = paga ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.25)";
        ctx.fillText(fmt(cfg.costo)+" O", 0, n.radio+12);
      }
      ctx.restore();
    }
    ctx.restore(); // zoom transform
  },

  actualizarNodo(id) { /* loop continuo */ },

  _aplicarPan(dx, dy) {
    this.panX += dx; this.panY += dy;
    for (const n of this.nodos) {
      n.targetX += dx; n.targetY += dy;
      n.x += dx; n.y += dy;
    }
  },

  bindEventos() {
    if (this._bound) return; // solo una vez
    this._bound = true;
    const c = this.canvas;

    // Convierte coordenadas del mouse al espacio del canvas con zoom
    const getPos = e => {
      const rect = c.getBoundingClientRect();
      const t    = e.touches ? e.touches[0] : e;
      const mx   = t.clientX - rect.left;
      const my   = t.clientY - rect.top;
      // Deshacer la transformación de zoom centrada
      const W    = this.w || c.offsetWidth;
      const H    = this.h || c.offsetHeight;
      const cx   = W / 2, cy = H / 2;
      return {
        x: (mx - cx) / this.scale + cx,
        y: (my - cy) / this.scale + cy,
      };
    };

    const hitNodo = pos => {
      for (const n of this.nodos) {
        if (Math.hypot(pos.x - n.x, pos.y - n.y) < n.radio + 8) return n.id;
      }
      return null;
    };

    // Rueda del mouse — zoom
    c.addEventListener("wheel", e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      this.scale  = Math.min(this.MAX_SCALE, Math.max(this.MIN_SCALE, this.scale + delta));
    }, { passive: false });

    let dragStart = null, hasMoved = false, panLast = null;

    c.addEventListener("mousedown", e => {
      const pos = getPos(e);
      const hit = hitNodo(pos);
      if (hit) { this.dragging=hit; dragStart={...pos}; hasMoved=false; }
      else     { this.panning=true; panLast={...pos}; c.style.cursor="grabbing"; }
    });

    c.addEventListener("mousemove", e => {
      const pos = getPos(e);
      if (this.dragging) {
        const n = this.getNodo(this.dragging);
        if (n) { n.x=pos.x; n.y=pos.y; n.vx=0; n.vy=0; }
        if (dragStart && Math.hypot(pos.x-dragStart.x, pos.y-dragStart.y) > 5) hasMoved=true;
        return;
      }
      if (this.panning && panLast) {
        this._aplicarPan(pos.x-panLast.x, pos.y-panLast.y);
        panLast={...pos}; c.style.cursor="grabbing"; return;
      }
      const hit = hitNodo(pos);
      if (hit) { UI.mostrarTooltipNodo(hit, pos); c.style.cursor="pointer"; }
      else     { UI.ocultarTooltipNodo(); c.style.cursor="grab"; }
    });

    c.addEventListener("mouseup", e => {
      const wasId=this.dragging;
      this.dragging=null; this.panning=false; panLast=null;
      c.style.cursor="grab";
      if (wasId && !hasMoved) { accionComprarArbol(wasId); UI.mostrarTooltipNodo(wasId, getPos(e)); }
    });

    c.addEventListener("mouseleave", () => {
      this.dragging=null; this.panning=false; panLast=null;
      c.style.cursor="grab"; UI.ocultarTooltipNodo();
    });

    // Touch
    c.addEventListener("touchstart", e => {
      e.preventDefault();
      const pos=getPos(e), hit=hitNodo(pos);
      if (hit) { this.dragging=hit; dragStart={...pos}; hasMoved=false; }
      else     { this.panning=true; panLast={...pos}; }
    }, {passive:false});

    c.addEventListener("touchmove", e => {
      e.preventDefault();
      const pos=getPos(e);
      if (this.dragging) {
        const n=this.getNodo(this.dragging);
        if (n) { n.x=pos.x; n.y=pos.y; n.vx=0; n.vy=0; hasMoved=true; }
      } else if (this.panning && panLast) {
        this._aplicarPan(pos.x-panLast.x, pos.y-panLast.y);
        panLast={...pos};
      }
    }, {passive:false});

    c.addEventListener("touchend", e => {
      const wasId=this.dragging;
      this.dragging=null; this.panning=false; panLast=null;
      if (wasId && !hasMoved) accionComprarArbol(wasId);
    });

    c.style.cursor="grab";
  },
};