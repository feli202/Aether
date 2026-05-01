// ============================================================
// AETHER — AUDIO.JS
// Archivos en /audio/ :
//   musica_de_fondo.ogg  — loop ambient global
//   aceptado.ogg         — compra exitosa
//   negado.ogg           — compra fallida (shake)
//   recolectar.ogg       — recolectar fragmentos
// ============================================================

var AudioMgr = {
  ctx:    null,
  bufs:   {},
  music:  null,   // { src, gain } del loop ambient
  vols:   { musica:0.6, efectos:0.8, latido:0.8 },
  _ready: false,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return; }

    // Leer volúmenes guardados
    if (typeof S !== "undefined" && S.prefs) {
      if (S.prefs.volMusica  != null) this.vols.musica  = S.prefs.volMusica;
      if (S.prefs.volEfectos != null) this.vols.efectos = S.prefs.volEfectos;
      if (S.prefs.volLatido  != null) this.vols.latido  = S.prefs.volLatido;
    }

    // Cargar todos los archivos
    const archivos = ["musica_de_fondo", "aceptado", "negado", "recolectar"];
    Promise.all(archivos.map(n => this._cargar(n))).then(() => {
      this._ready = true;
      this._iniciarMusica(false);
    });

    // Pausar cuando la pestaña está oculta
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      document.hidden ? this.ctx.suspend() : this.ctx.resume();
    });

    // Primer gesto del usuario desbloquea el contexto (política de browsers)
    const unlock = () => {
      if (this.ctx?.state === "suspended") this.ctx.resume();
    };
    document.addEventListener("click",      unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true, passive: true });
  },

  async _cargar(nombre) {
    try {
      const res = await fetch("audio/" + nombre + ".ogg");
      if (!res.ok) return;
      const buf = await res.arrayBuffer();
      this.bufs[nombre] = await this.ctx.decodeAudioData(buf);
    } catch(e) { /* archivo no encontrado — silent fallback */ }
  },

  _iniciarMusica(introMode) {
    if (!this.bufs["musica_de_fondo"] || !this.ctx) return;
    if (this.music) { try { this.music.src.stop(); } catch(e){} }

    const src  = this.ctx.createBufferSource();
    src.buffer = this.bufs["musica_de_fondo"];
    src.loop   = true;

    const gain = this.ctx.createGain();
    // Intro: más alto. Juego: normal
    const MVOL = 0.287; // 50% más alto que antes (0.191 * 1.5)
    gain.gain.value = introMode ? this.vols.musica * 1.4 * MVOL : this.vols.musica * MVOL;

    src.connect(gain);
    gain.connect(this.ctx.destination);
    src.start();
    this.music = { src, gain };
  },

  // Bajar volumen música durante la intro → nivel normal al entrar al juego
  bajarMusica() {
    if (!this.music) return;
    const g = this.music.gain;
    g.gain.setTargetAtTime(this.vols.musica * 0.287, this.ctx.currentTime, 1.5);
  },

  _play(nombre, volMult) {
    if (!this._ready || !this.ctx || !this.bufs[nombre]) return;
    try {
      const src  = this.ctx.createBufferSource();
      src.buffer = this.bufs[nombre];
      const gain = this.ctx.createGain();
      gain.gain.value = this.vols.efectos * (volMult || 1);
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start();
    } catch(e) {}
  },

  setVol(tipo, val) {
    this.vols[tipo] = val;
    if (tipo === "musica" && this.music) {
      this.music.gain.gain.setTargetAtTime(val * 0.287, this.ctx.currentTime, 0.1);
    }
  },

  // ── Hooks llamados desde el juego ───────────────────────────
  onAceptado()    { this._play("aceptado",    1.0); },
  onNegado()      { this._play("negado",      0.7); },
  onRecolectar()  { this._play("recolectar",  1.0); },
};