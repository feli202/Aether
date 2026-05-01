// ============================================================
// AETHER — MAIN.JS
// Punto de entrada — init del juego
// ============================================================

cargar();
UI.init();
AudioMgr.init();

// Arrancar loops (tickAInterval declarado en engine.js como var global)
tickAInterval = setInterval(tick_A, 1000);
window._tickBInterval  = setInterval(tick_B,      1000);
window._tickCDInterval = setInterval(tickCooldown,  50);
window._uiLoopInterval = setInterval(uiLoop,        50);