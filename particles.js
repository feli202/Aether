// ============================================================
// PARTICLES.JS — canvas 2D puro
// ============================================================

const ParticlesBG = {
  canvas: null, ctx: null,
  W: 0, H: 0, dpr: 1,
  particles: [],
  mouseX: 0, mouseY: 0,
  targetMouseX: 0, targetMouseY: 0,

  init() {
    this.canvas = document.getElementById("bgCanvas");
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", e => {
      this.targetMouseX = (e.clientX / this.W - 0.5) * 2;
      this.targetMouseY = (e.clientY / this.H - 0.5) * 2;
    });
    this.buildParticles();
    this.animate();
  },

  resize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width  = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width  = this.W + "px";
    this.canvas.style.height = this.H + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  buildParticles() {
    this.particles = [];
    for (let i = 0; i < 300; i++) {
      this.particles.push(this.newParticle(true));
    }
  },

  newParticle(randomY) {
    const z    = Math.random();
    const size = 0.7 + z * 4.0;
    const tipo = Math.random();
    let r, g, b;
    if      (tipo < 0.55) { r=0;   g=Math.floor(155+z*90); b=255; }
    else if (tipo < 0.80) { r=15;  g=Math.floor(75+z*80);  b=255; }
    else if (tipo < 0.93) { r=Math.floor(140+z*90); g=Math.floor(195+z*55); b=255; }
    else                  { r=Math.floor(110+z*60); g=50; b=255; }
    return {
      x: Math.random() * (window.innerWidth  + 40) - 20,
      y: randomY ? Math.random() * window.innerHeight : window.innerHeight + size * 3,
      z, size, r, g, b,
      vx:  (Math.random() - 0.5) * 0.18 * (0.15 + z),
      vy:  -(0.04 + Math.random() * 0.22) * (0.15 + z * 0.85),
      life: 0.5 + Math.random() * 0.5,
      flicker: Math.random() * Math.PI * 2,
      fSpd: 0.4 + Math.random() * 1.8,
    };
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x      += p.vx;
      p.y      += p.vy;
      p.life   -= 0.0007;
      p.flicker += p.fSpd * 0.016;
      const px = p.x + this.mouseX * p.z * 10;
      const py = p.y + this.mouseY * p.z * 6;
      if (p.life <= 0 || py < -30) { this.particles[i] = this.newParticle(false); continue; }
      const flick   = Math.sin(p.flicker) * 0.18 + 0.82;
      const opacity = p.life * flick * (0.5 + p.z * 0.5);
      this.draw(px, py, p.size, p.r, p.g, p.b, opacity);
    }
  },

  draw(x, y, size, r, g, b, op) {
    const ctx = this.ctx;
    if (size > 1.2) {
      const hr   = size * 4.5;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, hr);
      grad.addColorStop(0,    `rgba(${r},${g},${b},${(op*0.4).toFixed(3)})`);
      grad.addColorStop(0.45, `rgba(${r},${g},${b},${(op*0.12).toFixed(3)})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(x, y, hr, 0, Math.PI*2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
    const cg = ctx.createRadialGradient(x, y, 0, x, y, size);
    cg.addColorStop(0,    `rgba(255,255,255,${(op*0.95).toFixed(3)})`);
    cg.addColorStop(0.35, `rgba(${r},${g},${b},${op.toFixed(3)})`);
    cg.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2);
    ctx.fillStyle = cg;
    ctx.fill();
  },
};

// Con defer, el script corre cuando el DOM ya está listo — llamar directamente
ParticlesBG.init();