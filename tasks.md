# tasks.md

## Estado general

- **Estado actual:** Fase 1 — Completada
- **Última actualización:** 2026-04-25
- **Fase activa:** 1A + 1B completadas
- **Rama de trabajo:** Ninguna (trabajado en main)
- **Validación JS:** `node --check src/js/components/chatbot.js` — OK (2026-04-25)
- **Validación build:** `npm run build:dir` — Pasa (2026-04-25)
- **Comandos de validación disponibles:**
  - `npm start` — Iniciar app en desarrollo
  - `npm run build` — Generar instalador .exe
  - `npm run build:dir` — Generar build sin empaquetar

---

## Decisiones cerradas (no cambiar)

- Base NIF: `src/data/nif_knowledge.json`
- Idioma: Solo español (sin i18n)
- Sin LLM, API keys, Dialogflow, IPC nuevo o internet
- No tocar: `router.js`, `store.js`, `engine/`, `main.js`, `preload.js`, persistencia contable
- No llamar `window.api.writeData`
- No acciones contables asistidas
- Modo compacto + modo expandido como overlay (no cambia rutas)
- Orbe animado MVP (CSS only, transform/opacity)

---

## Fase 1A (completada)

- [x] Tareas 1-8 completadas
- [x] Chatbot funcional 100% local
- [x] Base NIF 17 topics
- [x] Documentación inicial

---

## Fase 1B — Rediseño visual premium

### Slice 0 — Preparación y validación base

- [x] Verificar rename `docs/desing/` → `docs/design/`
- [x] `node --check chatbot.js` — Syntax OK
- [x] tasks.md actualizado con sección Fase 1B

### Slice 1 — Sistema visual glassmorphic

- [x] Estado: **Completada 2026-04-25**
- **Archivos tocados:** `src/css/chatbot.css`
- **Implementado:**
  - Variables CSS glass (blur, glass-bg, glass-border)
  - Sombras difusas premium
  - Bordes semitransparentes
  - Z-index ordenados (5000 compacto, 6000 expandido, 5999 backdrop)
  - Soporte prefers-reduced-motion
  - Focus rings accesibles

### Slice 2 — Rediseño compacto

- [x] Estado: **Completada 2026-04-25**
- **Archivos tocados:** `src/css/chatbot.css`
- **Implementado:**
  - FAB premium con gradiente y sombra mejorada
  - Header glassmorphic con blur
  - Panel con backdrop-filter y transparencia
  - Mensajes con mejor espaciado y tipografía
  - Chips premium con hover suave
  - Input pastilla moderna con glow en focus
  - Animación abrir/cerrar con cubic-bezier

### Slice 3 — Orbe animado MVP

- [x] Estado: **Completada 2026-04-25**
- **Archivos tocados:** `src/css/chatbot.css`, `src/js/components/chatbot.js`
- **Implementado:**
  - Orbe CSS con gradiente animado (background-position)
  - Estados: idle (rotación lenta), active (thinking, pulso), received (destello)
  - Animation con transform y opacity (no blur continuo)
  - prefers-reduced-motion reduce/elimina animaciones
  - setOrbState(state) en JS para controlar estado

### Slice 4 — Modo expandido

- [x] Estado: **Completada 2026-04-25**
- **Archivos tocados:** `src/css/chatbot.css`, `src/js/components/chatbot.js`
- **Implementado:**
  - Estado isExpanded en JS
  - toggleExpandedMode() agrega/quita .nif-chatbot-panel--expanded
  - Panel expandido 80vw x 85vh centrado
  - Overlay backdrop con blur
  - Botón volver del expandido
  - Reutiliza DOM e historial existentes

### Slice 5 — Microinteracciones y accesibilidad

- [x] Estado: **Completada 2026-04-25**
- **Archivos tocados:** `src/css/chatbot.css`, `src/js/components/chatbot.js`
- **Implementado:**
  - Foco automático al input al abrir/expandir
  - aria-label en nuevos controles
  - Escape cierra expandido (no compacta)
  - Estados pensando/respuesta visual (orb states)
  - Responsive dentro de Electron

### Slice 6 — Documentación y tasks final

- [x] Estado: **Completada 2026-04-25**
- **Archivos tocados:** `docs/chatbot-nif.md`, `tasks.md`
- **Implementado:**
  - docs/chatbot-nif.md actualizado con modo compacto, expandido, orbe
  - tasks.md actualizado con estado real post-Fase 1B

---

## Validación Fase 1B

### Validaciones automatizadas

- [x] `node --check src/js/components/chatbot.js` — Sintaxis OK (2026-04-25)
- [x] `npm run build:dir` — Build pasa (2026-04-25)
- [ ] `npm run build` — Generar exe — Pendiente (opcional, build:dir ya pasó)

### Validación manual

- [x] Dashboard carga correctamente
- [x] FAB visible en esquina inferior derecha
- [x] FAB abre panel compacto suavemente
- [x] Panel compacto tiene glassmorphism visible
- [x] Orbe visible en header (idle)
- [x]输入 "¿Qué son las NIF?" devuelve respuesta NIF
- [x] Fallback funciona para tema fuera de base
- [x] Botón expandir visible en header compacto
- [x] Modo expandido abre como overlay
- [x] Historial se conserva al expandir
- [x]输入 otra pregunta en modo expandido funciona
- [x] Botón volver contrae a compacto
- [x] Historial se conserva al contraer
- [x] Escape cierra modo expandido
- [x] Navegación completa (6 rutas) no se rompe
- [x] prefers-reduced-motion desactiva animaciones

**Aprobación humana:** 2026-04-25 — Funcionalidad aceptada, UI aceptada temporalmente, mejora visual premium como deuda futura (no bloqueante).

---

## Archivos no tocados (prohibidos)

- `router.js` — NO TOCADO
- `store.js` — NO TOCADO
- `engine/` — NO TOCADO
- `main.js` — NO TOCADO
- `preload.js` — NO TOCADO
- Persistencia contable — NO TOCADA

---

## Bitácora de archivos modificados

| Fecha | Fase | Archivo | Cambio |
|-------|------|---------|--------|
| 2026-04-25 | 1A | `src/data/nif_knowledge.json` | Nuevo — 17 topics NIF |
| 2026-04-25 | 1A | `src/css/chatbot.css` | Nuevo — estilos chatbot |
| 2026-04-25 | 1A | `src/js/components/chatbot.js` | Nuevo — componente UI + lógica |
| 2026-04-25 | 1A | `src/index.html` | Agregado link CSS + script |
| 2026-04-25 | 1A | `src/js/app.js` | Agregado injectChatbot() |
| 2026-04-25 | 1A | `docs/chatbot-nif.md` | Nuevo — documentación |
| 2026-04-25 | 1B | `docs/desing/` → `docs/design/` | Rename typo |
| 2026-04-25 | 1B | `src/css/chatbot.css` | Reescrito — glassmorphism + expandido + orbe |
| 2026-04-25 | 1B | `src/js/components/chatbot.js` | Modificado — expand/collapse + orb states |
| 2026-04-25 | 1B | `docs/chatbot-nif.md` | Actualizado — nuevos modos |
| 2026-04-25 | 1B | `tasks.md` | Actualizado — Fase 1B |

---

## Deuda futura

- **Mejora visual premium avanzada del chatbot** — UI aceptada temporalmente por humano, refinamiento visual queda pendiente como mejora futura (no bloquea).

---

## Notas de seguridad (Fase 1A + 1B)

- ✓ XSS: Sin `innerHTML` con contenido dinámico — solo DOM APIs
- ✓ Chatbot NO tiene acceso a `window.api.writeData`
- ✓ Chatbot NO modifica appData ni llama funciones contables
- ✓ Historial en memoria RAM
- ✓ Sin dependencias externas, sin internet
- ✓ Overlay con z-index controlado (5000/6000)

---

## Fases futuras (no implementadas)

- **Fase 2:** Integración LLM opcional (requiere security-guidance)
- **Fase 3:** Acciones contables asistidas (regla: IA solo propone, humano confirma)

---

*Última actualización: 2026-04-25 por Jarvis — Fase 1 completa*