// ============================================================
// AETHER — INTRO.JS
// ============================================================

(function initIntro() {
  const intro = document.getElementById("vistaIntro");
  const juego = document.getElementById("vistaJuego");
  if (!intro || !juego) return;

  const loreEl    = document.getElementById("loreLine");
  const tieneSave = !!localStorage.getItem(SAVE_KEY);

  // Detectar idioma nativo solo en save nuevo
  if (!tieneSave && typeof S !== "undefined" && navigator.language?.startsWith("es")) {
    S.prefs.idioma = "es";
  }

  function entrarAlJuego() {
    if (window.AudioMgr?._ready) AudioMgr.bajarMusica();
    if (typeof calcularEstadoCosmico === "function" && loreEl)
      loreEl.textContent = getLoreEstado(calcularEstadoCosmico());
    intro.classList.add("saliendo");
    setTimeout(() => { juego.classList.add("visible"); if (typeof actualizarLoreLine === "function") actualizarLoreLine(); }, 200);
    setTimeout(() => intro.remove(), 1200);
  }

  if (!tieneSave) {
    if (loreEl) loreEl.textContent = getLoreEstado(0);
    const txtEl = document.getElementById("introDespertarText");
    const hint  = document.getElementById("introDespertarHint");
    if (txtEl) txtEl.innerText = T("intro_despertar");
    if (hint)  hint.innerText  = T("intro_hint");
    const frase = document.getElementById("introFrase");
    if (frase) {
      frase.innerHTML = [T("intro_l1"), T("intro_l2"), T("intro_l3")]
        .map((l, i) => `<span class="introLinea" style="animation-delay:${1.2 + i * 1.2}s">${l}</span>`)
        .join("");
    }
  } else {
    const resultado = (typeof simularOffline === "function") ? simularOffline() : { segundos:0, frags:0, orbes:0 };
    const frase = document.getElementById("introFrase");
    if (frase) {
      const tiempoStr = resultado.segundos > 0 ? formatTiempo(resultado.segundos) : "—";
      let lineas = [T("offline_afuera") + " <em style='color:rgba(100,170,255,0.8)'>" + tiempoStr + "</em>."];
      if (resultado.frags > 0 || resultado.orbes > 0) {
        const partes = [];
        if (resultado.frags  > 0) partes.push("<em style='color:rgba(0,212,255,0.8)'>"   + fmt(resultado.frags)  + " " + T("fragmentos") + "</em>");
        if (resultado.orbes  > 0) partes.push("<em style='color:rgba(167,139,250,0.8)'>" + fmt(resultado.orbes)  + " " + T("orbes")      + "</em>");
        lineas.push(T("offline_resuena"));
        lineas.push(T("offline_ganaste") + " " + partes.join(", ") + ".");
      } else {
        lineas.push(T("offline_silencio"));
        lineas.push(T("offline_tejido"));
      }
      frase.innerHTML = lineas
        .map((l, i) => `<span class="introLinea" style="animation-delay:${1.2 + i * 1.2}s">${l}</span>`)
        .join("");
    }
  }

  let activated = false;
  function despertar() {
    if (activated) return;
    activated = true;
    entrarAlJuego();
  }
  intro.addEventListener("click",      despertar, { once: true });
  intro.addEventListener("touchstart", despertar, { once: true, passive: true });
})();

function formatTiempo(seg) {
  if (seg < 60)   return seg + "s";
  if (seg < 3600) return Math.floor(seg/60) + "m " + (seg%60) + "s";
  const h = Math.floor(seg/3600), m = Math.floor((seg%3600)/60);
  return h + "h" + (m > 0 ? " " + m + "m" : "");
}

(function initMobileTabs() {
  const tabs   = document.querySelectorAll(".mobileTab");
  const panels = document.querySelectorAll(".mobilePanel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const target = document.querySelector("[data-panel='" + tab.dataset.tab + "']");
      if (target) target.classList.add("active");
    });
  });
})();