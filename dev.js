// ============================================================
// AETHER — DEV.JS
// Modo dev deshabilitado en versión demo
// Solo mantiene el atajo de mute (M)
// ============================================================

document.addEventListener("keydown", e => {
  // M = mute/unmute música
  if (e.key === "m" || e.key === "M") {
    if (!window.AudioMgr || !AudioMgr._ready) return;
    AudioMgr._muted = !AudioMgr._muted;
    if (AudioMgr._muted) {
      AudioMgr.ctx?.suspend();
    } else {
      AudioMgr.ctx?.resume();
    }
  }
});