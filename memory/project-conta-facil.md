---
name: conta-facil-chatbot-plan
description: Decisiones estables del proyecto Conta Fácil para integración de chatbot NIF
type: project
---

## Proyecto: Conta Fácil
- App desktop Electron + Vanilla JS
- Propósito: chatbot académico NIF (Normas de Información Financiera)
- Decisión base: Chatbot local primero, LLM opcional después

## Arquitectura observada
- `main.js` + `preload.js`: IPC con contextIsolation true
- `app.js`: Inicialización, inyecta command-palette.js y chatbot.js
- `router.js`: Navegación por #viewContainer (NO TOCAR)
- `store.js`: Estado global appData (NO TOCAR)
- `command-palette.js`: Patrón de componente flotante a seguir
- CSS variables en `variables.css`, BEM-like naming

## Punto de inyección seguro
- `src/js/app.js` → después de `injectCommandPalette()`
- Opcional: `src/index.html` para script/css

## Restricciones Phase 1A (IMPLEMENTADA)
- NO tocar router.js, store.js, accounting.js
- NO acceder a window.api.writeData
- NO modificar persistencia contable
- Chatbot 100% offline, sin API keys
- CSS prefijo obligatorio: nif-chatbot-*
- DOM APIs para renderizado dinámico (sin innerHTML con datos)

## Archivos implementados (Fase 1A)
- src/data/nif_knowledge.json — 17 topics NIF
- src/css/chatbot.css — estilos aislados
- src/js/components/chatbot.js — componente UI + lógica
- src/index.html — agregado link + script
- src/js/app.js — agregado injectChatbot()
- docs/chatbot-nif.md — documentación

## Seguridad XSS
- Sin innerHTML con contenido dinámico
- textContent para textos de usuario
- DOM APIs (createElement, appendChild)

## Fase 1B (futura)
- Glassmorphism, gradientes, orbe animado
- UI preparada para recibir estos cambios

## Fase 2 (futura, opcional)
- LLM externo (Gemini Flash, Minimax)
- API key solo en main.js via process.env
- Requiere security-guidance

## Fase 3 (futura)
- Acciones contables asistidas por IA
- Regla: IA solo propone, humano confirma
- Usa funciones existentes (addEntry, validateEntry)
