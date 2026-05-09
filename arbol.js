// ============================================================
// AETHER — ARBOL.JS
// ArbolGrafo - canvas 2D, pan, nodos separados
// Nodos etéreos: círculo/diamante cian | Nodos eternos: hexágono violeta
// ============================================================

var ArbolGrafo = {
  canvas: null, ctx: null,
  w: 0, h: 0,
  nodos: [],
  dragging: null,
  animFrame: null,
  panX: 0, panY: 0,
  panning: false,
  scale: 0.85,
  MIN_SCALE: 0.3,
  MAX_SCALE: 2.0,
  _running: false,
  _bound: false,
  _buyAnims: [],

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
    this._running = true;
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
    this._running = true;
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
      radio: cfg.tipo === "eterno" ? 26 : 22,
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
    this._tickBuyAnims();
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

  // ── ANIMACIONES DE COMPRA ─────────────────────────────────
  _tickBuyAnims() {
    for (const a of this._buyAnims) a.prog = Math.min(1, a.prog + 0.03);
    this._buyAnims = this._buyAnims.filter(a => a.prog < 1);
  },

  dispararBuyAnim(id) {
    this._buyAnims = this._buyAnims.filter(a => a.id !== id);
    if (this.getNodo(id)) this._buyAnims.push({ id, prog: 0 });
  },

  actualizarNodo(id) {
    this.dispararBuyAnim(id);
  },

  dibujar() {
    const ctx = this.ctx;
    const W = this.w || parseInt(this.canvas.style.width)  || this.canvas.offsetWidth;
    const H = this.h || parseInt(this.canvas.style.height) || this.canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;

    // Zoom centrado
    ctx.save();
    const cx = W/2, cy = H/2;
    ctx.translate(cx, cy);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-cx, -cy);

    // ── CONEXIONES ───────────────────────────────────────────
    for (const cfg of CONFIG.arbol) {
      if (!cfg.req) continue;
      const a = this.getNodo(cfg.id), b = this.getNodo(cfg.req);
      if (!a || !b) continue;
      const comp     = S.arbol[cfg.id], reqComp = S.arbol[cfg.req];
      const disp     = (!cfg.req || reqComp) && !comp;
      const paga     = S.orbes >= cfg.costo;
      const esEterno = cfg.tipo === "eterno";

      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y);
      if (comp && reqComp) {
        ctx.strokeStyle = esEterno ? "rgba(167,100,255,0.75)" : "rgba(0,212,255,0.7)";
        ctx.lineWidth   = 2.5;
        ctx.shadowBlur  = 12;
        ctx.shadowColor = esEterno ? "rgba(167,100,255,0.5)" : "#00d4ff";
      } else if (disp && paga) {
        ctx.strokeStyle = esEterno ? "rgba(167,100,255,0.35)" : "rgba(167,139,250,0.4)";
        ctx.lineWidth   = 1.5; ctx.shadowBlur = 0;
      } else if (reqComp) {
        ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5; ctx.shadowBlur = 0;
      }
      ctx.stroke(); ctx.shadowBlur = 0;
    }

    // ── NODOS ────────────────────────────────────────────────
    for (const cfg of CONFIG.arbol) {
      const n = this.getNodo(cfg.id);
      if (!n) continue;
      const comp     = S.arbol[cfg.id];
      const reqOk    = !cfg.req || S.arbol[cfg.req];
      const cOk      = cfg.id !== "auto" || S.click.nivelOrbes >= CONFIG.CLICK_MAX_ORBES;
      const disp     = reqOk && cOk && !comp;
      const paga     = S.orbes >= cfg.costo;
      const aseq     = disp && paga;
      const esEterno = cfg.tipo === "eterno";
      const esClic   = cfg.sec === "clicks";

      const pulse = comp ? (1 + Math.sin(t * 2.2 + n.x * 0.008) * (esEterno ? 0.12 : 0.08)) : 1;
      const r     = n.radio * pulse;

      ctx.save(); ctx.translate(n.x, n.y);

      // ── Halo exterior ─────────────────────────────────────
      if (comp) {
        const hR = r * (esEterno ? 3.8 : 3);
        const g  = ctx.createRadialGradient(0,0,r*0.4,0,0,hR);
        if (esEterno) {
          g.addColorStop(0,"rgba(167,100,255,0.28)"); g.addColorStop(1,"rgba(80,20,160,0)");
        } else {
          g.addColorStop(0,"rgba(0,212,255,0.22)");   g.addColorStop(1,"rgba(0,212,255,0)");
        }
        ctx.beginPath(); ctx.arc(0,0,hR,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        ctx.shadowBlur  = esEterno ? 30 : 24;
        ctx.shadowColor = esEterno ? "rgba(167,100,255,0.7)" : "#00d4ff";
      } else if (aseq) {
        const g = ctx.createRadialGradient(0,0,r*0.2,0,0,r*2.5);
        if (esEterno) {
          g.addColorStop(0,"rgba(167,100,255,0.20)"); g.addColorStop(1,"rgba(80,20,160,0)");
        } else {
          g.addColorStop(0,"rgba(167,139,250,0.15)"); g.addColorStop(1,"rgba(167,139,250,0)");
        }
        ctx.beginPath(); ctx.arc(0,0,r*2.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        ctx.shadowBlur  = 16;
        ctx.shadowColor = esEterno ? "rgba(167,100,255,0.65)" : "rgba(167,139,250,0.7)";
      }

      // ── Forma del nodo ────────────────────────────────────
      ctx.beginPath();
      if (esEterno) {
        // Hexágono — más imponente, distinguible visualmente
        const rd = r * 1.25;
        ctx.moveTo(0, -rd);
        ctx.lineTo( rd*0.72, -rd*0.42);
        ctx.lineTo( rd*0.72,  rd*0.42);
        ctx.lineTo( 0,        rd);
        ctx.lineTo(-rd*0.72,  rd*0.42);
        ctx.lineTo(-rd*0.72, -rd*0.42);
        ctx.closePath();
      } else if (esClic) {
        ctx.arc(0, 0, r, 0, Math.PI*2);
      } else {
        // Diamante (recolección etérea — igual que antes)
        const rd = r * 1.2;
        ctx.moveTo(0,-rd); ctx.lineTo(rd,0); ctx.lineTo(0,rd); ctx.lineTo(-rd,0);
        ctx.closePath();
      }

      if (comp) {
        const ig = ctx.createRadialGradient(0,-r*0.25,0,0,0,r);
        if (esEterno) {
          ig.addColorStop(0,"rgba(200,150,255,0.45)"); ig.addColorStop(1,"rgba(80,20,180,0.12)");
          ctx.fillStyle=ig; ctx.strokeStyle="rgba(200,150,255,0.95)"; ctx.lineWidth=2.5;
        } else {
          ig.addColorStop(0,"rgba(0,255,255,0.4)"); ig.addColorStop(1,"rgba(0,80,180,0.15)");
          ctx.fillStyle=ig; ctx.strokeStyle="#00d4ff"; ctx.lineWidth=2;
        }
      } else if (aseq) {
        const ag = ctx.createRadialGradient(0,-r*0.2,0,0,0,r);
        if (esEterno) {
          ag.addColorStop(0,"rgba(167,100,255,0.30)"); ag.addColorStop(1,"rgba(60,10,140,0.06)");
          ctx.fillStyle=ag; ctx.strokeStyle="rgba(167,100,255,0.95)"; ctx.lineWidth=2;
        } else {
          ag.addColorStop(0,"rgba(167,139,250,0.25)"); ag.addColorStop(1,"rgba(60,20,160,0.05)");
          ctx.fillStyle=ag; ctx.strokeStyle="rgba(167,139,250,0.9)"; ctx.lineWidth=1.5;
        }
      } else if (disp) {
        ctx.fillStyle   = esEterno ? "rgba(80,20,120,0.05)" : "rgba(255,255,255,0.04)";
        ctx.strokeStyle = esEterno ? "rgba(167,100,255,0.28)" : "rgba(255,255,255,0.2)";
        ctx.lineWidth   = 1;
      } else {
        ctx.fillStyle   = "rgba(255,255,255,0.01)";
        ctx.strokeStyle = esEterno ? "rgba(120,60,200,0.10)" : "rgba(255,255,255,0.06)";
        ctx.lineWidth   = 0.5;
      }
      ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;

      // Anillo interior para eternos comprados
      if (esEterno && comp) {
        const ri = r * 0.6;
        ctx.beginPath();
        ctx.moveTo(0,-ri); ctx.lineTo(ri*0.72,-ri*0.42);
        ctx.lineTo(ri*0.72,ri*0.42); ctx.lineTo(0,ri);
        ctx.lineTo(-ri*0.72,ri*0.42); ctx.lineTo(-ri*0.72,-ri*0.42);
        ctx.closePath();
        ctx.strokeStyle = "rgba(200,150,255,0.35)";
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }

      // ── Texto ─────────────────────────────────────────────
      const label = TL(cfg);
      const pals  = label.split(" ");
      ctx.font        = (comp || aseq) ? `bold ${esEterno?8.5:8}px 'Courier New',monospace` : "8px sans-serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = comp
        ? (esEterno ? "rgba(220,180,255,0.98)" : "#00ffff")
        : aseq
          ? (esEterno ? "rgba(200,150,255,0.95)" : "rgba(210,190,255,0.95)")
          : disp
            ? "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.15)";

      if (pals.length > 1 && label.length > 9) {
        const mid = Math.ceil(pals.length/2);
        ctx.fillText(pals.slice(0,mid).join(" "), 0, -5);
        ctx.fillText(pals.slice(mid).join(" "),   0,  5);
      } else {
        ctx.fillText(label, 0, 0);
      }

      // Costo bajo el nodo
      if (!comp && disp) {
        ctx.font      = "7px sans-serif";
        ctx.fillStyle = paga
          ? (esEterno ? "rgba(200,150,255,0.90)" : "rgba(167,139,250,0.9)")
          : "rgba(255,255,255,0.2)";
        ctx.fillText(fmt(cfg.costo)+"◈", 0, r+13);
      }

      // ◆ sobre eternos disponibles — señal visual de importancia
      if (esEterno && !comp && reqOk) {
        ctx.font      = "10px monospace";
        ctx.fillStyle = paga ? "rgba(200,150,255,0.75)" : "rgba(167,100,255,0.35)";
        ctx.fillText("◆", 0, -r - 12);
      }

      ctx.restore();
    }

    // ── ANIMACIONES DE COMPRA ─────────────────────────────────
    for (const anim of this._buyAnims) {
      const n   = this.getNodo(anim.id);
      if (!n) continue;
      const cfg      = CONFIG.arbol.find(c => c.id === anim.id);
      const esEterno = cfg?.tipo === "eterno";
      const p        = anim.prog;
      const rings    = esEterno ? 3 : 2;
      for (let i = 0; i < rings; i++) {
        const rp = Math.max(0, (p - i*0.15) / (1 - i*0.15));
        if (rp <= 0) continue;
        const rr  = n.radio * (1 + rp * (esEterno ? 4.5 : 3));
        const alf = (1 - rp) * (esEterno ? 0.65 : 0.5);
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.beginPath(); ctx.arc(0,0,rr,0,Math.PI*2);
        ctx.strokeStyle = esEterno
          ? `rgba(200,150,255,${alf.toFixed(3)})`
          : `rgba(0,212,255,${alf.toFixed(3)})`;
        ctx.lineWidth   = esEterno ? 2.5 : 1.8;
        ctx.shadowColor = esEterno ? "rgba(167,100,255,0.5)" : "rgba(0,212,255,0.4)";
        ctx.shadowBlur  = 10;
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.restore();
      }
      if (p < 0.8) {
        const N = esEterno ? 10 : 6;
        for (let i = 0; i < N; i++) {
          const ang  = (i/N)*Math.PI*2 + p*2;
          const dist = p * n.radio * (esEterno ? 3.2 : 2.5);
          ctx.save();
          ctx.translate(n.x + Math.cos(ang)*dist, n.y + Math.sin(ang)*dist);
          ctx.beginPath(); ctx.arc(0,0,esEterno?2:1.5,0,Math.PI*2);
          ctx.fillStyle   = esEterno
            ? `rgba(200,150,255,${((1-p)*0.9).toFixed(3)})`
            : `rgba(0,230,255,${((1-p)*0.9).toFixed(3)})`;
          ctx.shadowColor = esEterno ? "rgba(167,100,255,0.7)" : "rgba(0,212,255,0.7)";
          ctx.shadowBlur  = 7;
          ctx.fill(); ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    // ── NIEBLA sobre nodos bloqueados ────────────────────────
    const nodosDone = new Set(CONFIG.arbol.filter(cfg => S.arbol[cfg.id]).map(cfg => cfg.id));
    for (const cfg of CONFIG.arbol) {
      if (S.arbol[cfg.id]) continue;
      const reqOk = !cfg.req || S.arbol[cfg.req];
      if (reqOk) continue;
      const n = this.getNodo(cfg.id);
      if (!n) continue;
      let depth = 0, curr = cfg.req;
      while (curr && !nodosDone.has(curr) && depth < 6) {
        const parent = CONFIG.arbol.find(x => x.id === curr);
        curr = parent?.req;
        depth++;
      }
      const fogAlfa = Math.min(0.55, 0.12 + depth * 0.1);
      ctx.save(); ctx.translate(n.x, n.y);
      const fogR = n.radio * (1.2 + depth * 0.15);
      const fog  = ctx.createRadialGradient(0,0,0, 0,0,fogR*2.2);
      fog.addColorStop(0,   `rgba(2,2,18,${fogAlfa})`);
      fog.addColorStop(0.5, `rgba(1,1,12,${(fogAlfa*0.6).toFixed(2)})`);
      fog.addColorStop(1,   "rgba(0,0,8,0)");
      ctx.beginPath(); ctx.arc(0,0,fogR*2.2,0,Math.PI*2);
      ctx.fillStyle = fog; ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // fin zoom
  },

  _aplicarPan(dx, dy) {
    this.panX += dx; this.panY += dy;
    for (const n of this.nodos) {
      n.targetX += dx; n.targetY += dy;
      n.x += dx; n.y += dy;
    }
  },

  bindEventos() {
    if (this._bound) return;
    this._bound = true;
    const c = this.canvas;

    const getPos = e => {
      const rect = c.getBoundingClientRect();
      const src  = e.touches ? e.touches[0] : e;
      const mx   = src.clientX - rect.left;
      const my   = src.clientY - rect.top;
      const W    = this.w || c.offsetWidth;
      const H    = this.h || c.offsetHeight;
      const cx2  = W / 2, cy2 = H / 2;
      return {
        x: (mx - cx2) / this.scale + cx2,
        y: (my - cy2) / this.scale + cy2,
      };
    };

    const hitNodo = pos => {
      for (const n of this.nodos) {
        if (Math.hypot(pos.x - n.x, pos.y - n.y) < n.radio + 8) return n.id;
      }
      return null;
    };

    c.addEventListener("wheel", e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      this.scale  = Math.min(this.MAX_SCALE, Math.max(this.MIN_SCALE, this.scale + delta));
    }, { passive: false });

    let dragStart = null, hasMoved = false, panLast = null;

    c.addEventListener("mousedown", e => {
      const pos = getPos(e), hit = hitNodo(pos);
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
      const wasId = this.dragging;
      this.dragging=null; this.panning=false; panLast=null;
      c.style.cursor="grab";
      if (wasId && !hasMoved) { accionComprarArbol(wasId); UI.mostrarTooltipNodo(wasId, getPos(e)); }
    });

    c.addEventListener("mouseleave", () => {
      this.dragging=null; this.panning=false; panLast=null;
      c.style.cursor="grab"; UI.ocultarTooltipNodo();
    });

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

    c.addEventListener("touchend", () => {
      const wasId=this.dragging;
      this.dragging=null; this.panning=false; panLast=null;
      if (wasId && !hasMoved) accionComprarArbol(wasId);
    });

    c.style.cursor="grab";
  },
};