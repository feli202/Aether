# AETHER — Changelog

## Flujo de trabajo
Cada sesión: descargar los outputs → copiarlos a la carpeta del proyecto en VS Code (reemplazar) → subir los archivos actualizados en la próxima sesión.

---

## v0.0.15 — UX / Onboarding + Visual

### engine.js
- Primera recolección: pulso visual en botón TREE (4 ciclos, clase `pulse-hint`) — onboarding visual directo
- Consejo post-primera-rec usa `T()` bilingüe: guía explícita a Poder I

### ui.js
- Botón Harvest: tooltip nativo con `"N / 1000 (X restantes)"` — desaparece con nodo `romper` activo
- Botones secundarios de barra (Logros, Stats, Settings): solo ícono + tooltip CSS en hover
- Partículas: regeneración con 60% `randomY` aleatorio — distribuidas por toda la pantalla, no solo abajo

### style.css
- Nodos de progreso: borde `0.18→0.35`, fondo `0.03→0.08` — más contraste en pantallas con bajo brillo
- Labels de progreso: opacidad `0.22→0.45`
- Conectores: `0.1→0.22`
- `#btnAbrirArbol.pulse-hint`: animación de onboarding 4 ciclos
- Barra inferior: grid `220px | 1fr | 300px` alineado a columnas del juego
- Botón TREE: destacado con glow, símbolo Ψ pulsante

### config.js
- VERSION `v0.0.15`, SAVE_KEY `_aether_v0015`
- Strings `consejo_poder1_titulo` / `consejo_poder1_desc` en ES y EN
- `desc_poder1` actualizado: "Click +3 frags base"

---

## v0.0.13 — Balance late game + fixes UI

### engine.js
- `poderClick()`: base de `×2/nivel` → `×0.8/nivel` — el click crece suavemente, no domina los generadores
- `multCatalizadorProd()`: reemplaza la eliminada `multCatalizador()` — el Catalizador multiplica producción de gens directamente
- `calcTickspeed()`: alias que devuelve 1 — el tickspeed ya no escala, la fractura amplifica gens
- `accionComprarPrisma()`: guarda hitos permanentes (h1-h5) antes de resetear — los hitos nunca retroceden
- `accionComprarCatalizador()`: ídem h1-h6, y preserva `panelBDesbloqueado` + `catalizadorRevelado`
- Sistema de notificaciones en cola (`_notifQueue`, `_notifActivas`): las notifs se apilan verticalmente sin solaparse, máximo 3 en pantalla
- `accionComprarGenAMax()`: nueva función — compra máximo posible de un generador con los orbes actuales

### config.js
- Generadores: multiplicadores de industria (G1A `1.07`, G2A `1.11`, G3A `1.14`) — costos no explotan
- Generadores: producción G2A `5`, G3A `12`
- Prisma: `costoBase: 60`, `multProd: 1.5`
- Catalizador: `multProd: 1.8`, `umbralesReq: [5, 10, 18]`, `catalizadoresParaPrestige: 3`
- `CLICK_MAX_ORBES: 20` (gate del autoclicker más tardío)
- Click: `costoEscala: 1.18` (gate auto ~160 orbes totales)
- Árbol — costos subidos en nodos mid/late:
  - poder2: 20→35, poder3: 65→130, poder4: 200→320
  - vel2: 20→28, vel3: 70→110, vel4: 180→280
  - resonancia (eterno): 200→450, auto: 800→1000, amplif: 500→700
  - rec_b3: 90→120, rec_m2: 65→90, rec_r1: 100→140, rec_r2: 240→360, rec_m3: 350→500
- Árbol — multiplicadores click nerfeados: poder2 `1.5→1.2`, poder3 `2.0→1.35`, poder4 `3.0→2.0`
- `tickspeed` eliminado de tickspeedBase y multTS — sin referencias internas
- `CLICK_MAX_ORBES` duplicado eliminado (línea 818)
- Hito h5: muestra `G3A N/1` en lugar de `N/3` (condición real es ≥1)

### ui.js
- `multCatalizador()` → `multCatalizadorProd()` en 3 lugares (fix crash en runtime)
- `contextmenu` en `#vistaJuego`: previene menú nativo del browser
- Botones de generadores: `contextmenu` → `accionComprarGenAMax` (click derecho compra máximo)
- Long press 500ms en mobile → `accionComprarGenAMax`
- Stats: fila duplicada de tickspeed eliminada
- Hito h5: muestra `G3A N/1` en lugar de `N/3`

### style.css
- `user-select: none` en `body, button, #vistaJuego, #vistaIntro` — sin selección de texto
- `-webkit-tap-highlight-color: transparent` global
- `touch-action: manipulation` en `button` global — sin delay 300ms en mobile
- `.notif`: `left: calc(220px + (100vw - 220px - 300px) / 2)` — centradas sobre `#main`, simétricas con la esfera
- `.notif`: transición `bottom 0.25s ease` para apilado suave

---

## v0.0.12 — Fixes de estabilidad

### engine.js
- `multCatalizadorProd()` reemplaza `multCatalizador()`
- `calcTickspeed()` devuelve 1 (tickspeed eliminado)
- `prodFragmentos()` integra `multCatalizadorProd()` y `amplitudEterna ×1.8`
- `tick_A()`: elimina `S.tickspeed = calcTickspeed()`
- `tickCooldown()`: elimina multiplicación por `calcTickspeed()`
- `costoMejoraClick()`: escala `×1.18` por nivel desde config
- `accionComprarPrisma()`: resetea nodos etéreos del árbol, orbes, click nivel
- `chequearPrestige()`: condición D — todos los eternos + catalizadoresParaPrestige
- `poderClick()`: `amplitudEterna` ya no multiplica el click (potencia gens)

### config.js
- Árbol rediseñado: 5 nodos eternos (resonancia, flujoEterno, nucleoEterno, romper, amplitudEterna)
- `tipo:"etereo"` / `tipo:"eterno"` en cada nodo del árbol
- Catalizador: `multProd` reemplaza `multTS`
- Hitos: `h_eternos`, `h_fracturas` reemplazan hitos de tickspeed
- Strings ES+EN: prestige_aviso, colapso_final, lore_5, notif_catalizador actualizados

### ui.js
- Hitos h7/h8: muestran "Pilares Eternos N/5" y "Fracturas N/3"
- Tooltip de nodos: muestra tipo (ETÉREO/ETERNO) con color + texto de reset
- Stats: muestra catalizadores en lugar de tickspeed

### arbol.js
- Nodos eternos: hexágono violeta en lugar de círculo cian
- Animación de compra: ondas expansivas + partículas al comprar un nodo
- `actualizarNodo()`: dispara animación cuando se llama desde engine

---

## v0.0.11 — Rediseño de mecánicas core

### Mecánicas eliminadas
- Tickspeed como variable de escala (reemplazado por multiplicador directo de Catalizador)

### Mecánicas nuevas
- Nodos ETÉREOS (se resetean con Prisma) y ETERNOS (solo con Prestige)
- Condición de prestige D: todos los eternos + 3 Catalizadores
- `amplitudEterna`: multiplica producción de generadores ×1.8 (no el click)
- Autoclicker nerfeado: auto=2cps, nucleoEterno=4cps
- Prisma resetea también los nodos etéreos del árbol y los Orbes
- Gate autoclicker: CLICK_MAX_ORBES=20

---

## v0.0.10D — Balance y árbol

### Árbol
- Layout horizontal separado: clicks izquierda, recolección derecha
- Física de resorte, pan, zoom, niebla sobre nodos bloqueados
- Nuevos nodos: flujoEterno, nucleoEterno, amplitudEterna, resonancia

### Balance
- G1A costoMult 1.5→1.07, G2A 1.65→1.11, G3A 1.85→1.14
- Prisma costoBase 55→60, multProd 1.3→1.5
- rec_b2 8→14, rec_b3 22→40, rec_m1 4→10, rec_m2 14→28
- auto 120→300, turboAuto/poderAuto eliminados, nucleoEterno los reemplaza