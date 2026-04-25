# Chatbot NIF — Documentación de Uso

## Descripción general

El **Asistente NIF Académico** es un chatbot integrado en Conta Fácil que responde preguntas sobre Normas de Información Financiera (NIF) Mexicanas.

**Características:**
- 100% local — no requiere internet ni API keys
- Base de conocimiento con 17 topics de NIF (A-1 a B-2)
- Búsqueda por keywords, ejemplos de preguntas y scoring
- Fallback honesto cuando no encuentra respuesta
- Dos modos de uso: compacto y expandido
- UI glassmorphic premium con orbe animado

---

## Modo compacto

El chatbot se abre como un panel flotante compacto desde el FAB (Floating Action Button) naranja en la esquina inferior derecha.

### Abrir/cerrar

1. Haz clic en el botón flotante naranja (FAB) en la esquina inferior derecha
2. Se abre el panel compacto con efecto glassmorphic
3. Para cerrarlo: clic en ✕ del header, o clic en el FAB de nuevo, o tecla Escape

### Preguntar en modo compacto

1. Escribe tu pregunta en el campo de texto
2. Presiona Enter o haz clic en el botón de enviar
3. El orbe del header cambia a estado "thinking" (azul pulsante) mientras procesa
4. La respuesta aparece en el área de mensajes
5. El orbe cambia a "received" (amarillo destello) brevemente, luego vuelve a "idle"

### Tema no encontrado

Si la pregunta no matches con ningún topic, recibirás un mensaje de fallback honesto indicando que no tengo esa información y sugiriendo temas disponibles.

---

## Modo expandido

Para sesiones de consulta más intensas, puedes expandir el panel a un dashboard overlay de mayor tamaño.

### Abrir modo expandido

1. Desde el modo compacto, haz clic en el botón **⤢ Expandir** del header (lado derecho)
2. Aparece un backdrop con blur detrás
3. El panel crece a 80vw × 85vh centrado en pantalla
4. El orbe sigue activo en la esquina superior izquierda

### Usar modo expandido

- Historial de conversación se conserva
- Más espacio para mensajes largos y respuestas detalladas
- Mismas funciones de preguntar, temas rápidos, limpiar

### Cerrar modo expandido

- **Botón "Volver"** — contrae a modo compacto conservando historial
- **Tecla Escape** — cierra el panel completamente (no vuelve a compacto)

---

## El orbe animado

El orbe (burbuja) en el header indica el estado del chatbot:

| Estado | Color | Animación | Significado |
|--------|-------|-----------|-------------|
| `idle` | Gradiente azul-violeta | Rotación lenta continua | Esperando pregunta |
| `thinking` | Azul sólido | Pulso rápido | Procesando búsqueda |
| `received` | Amarillo/dorado | Destello breve | Respuesta lista |

El orbe usa solo `transform` y `opacity` para animaciones de bajo costo. Si `prefers-reduced-motion` está activo, las animaciones se reducen o desactivan.

---

## Temas disponibles

**Palabras clave para probar:**
- NIF generales: "¿Qué son las NIF?", "NIF A-1", "marco conceptual"
- Postulados: "postulados básicos", "sustancia económica", "negocio en marcha", "devengación", "asociación", "consistencia"
- Conceptos: "partida doble", "ecuación contable", "entidad económica"
- Estados financieros: "NIF B-1", "balance", "NIF B-2", "estado de resultados"

### Temas rápidos

En el mensaje de bienvenida hay chips de temas rápidos. Clic para enviar la pregunta automáticamente.

### Limpiar conversación

Usa el botón de papelera en el header para borrar el historial de la sesión actual.

---

## Arquitectura técnica

### Archivos

| Archivo | Propósito |
|---------|-----------|
| `src/js/components/chatbot.js` | UI, estados (open/expanded/orb), búsqueda, scoring |
| `src/css/chatbot.css` | Glassmorphism, orb keyframes, modo expandido, z-index |
| `src/data/nif_knowledge.json` | Base local 17 topics NIF |

### Integración

- **Cargado desde:** `src/index.html` (stylesheet + script)
- **Inicializado desde:** `src/js/app.js` → `injectChatbot()`
- **Auto-protección:** Si se llama manualmente, re-inicializa sin duplicar DOM

### Flujo de datos

```
Usuario escribe pregunta
  → normalizeText() para limpiar texto
  → searchNIFKnowledge() recorre base local
    → calculateMatchScore() para cada topic
      → keywords (peso 2x), questionExamples (peso 1.5x), topic (peso 1x), tags (peso 0.5x)
  → Si score >= 0.3 → devolver respuesta
  → Si score < 0.3 → fallback
  → renderMessages() con DOM APIs (sin innerHTML dinámico)
  → setOrbState('received') después de renderizar
```

### Estados del chatbot

| Variable | Valores | Significado |
|---------|---------|-------------|
| `chatbotOpen` | `true`/`false` | Panel visible o oculto |
| `isExpanded` | `true`/`false` | Modo compacto vs. expandido |
| `orbState` | `'idle'`/`'thinking'`/`'received'` | Estado visual del orbe |
| `chatHistory` | `Array` | Historial de mensajes en memoria RAM |

### Z-index y overlays

- Panel compacto: `z-index: 5000`
- Panel expandido: `z-index: 6000`
- Backdrop del expandido: `z-index: 5999`
- No interfiere con toasts de la app (menor z-index)

---

## Seguridad

- **Sin innerHTML con contenido dinámico** — solo DOM APIs (`textContent`, `createElement`)
- **Sin acceso a `window.api.writeData`** — el chatbot no puede modificar datos contables
- **Sin acceso a internet** — 100% offline
- **Sin API keys** — no hay secretos que exponer
- **Historial en memoria RAM** — no persiste entre sesiones
- **Z-index controlado** — no bloquea la app

### Aislamiento

El chatbot **NO** modifica:
- `store.js`
- `router.js`
- `engine/accounting.js`
- `main.js`
- `preload.js`
- Ningún dato contable

---

## Base de conocimiento

### Topics incluidos (17)

| ID | Topic | Descripción |
|----|-------|-------------|
| `nif-a1` | NIF A-1 — Estructura de las NIF | Clasificación de NIF en conceptuales y de regularización |
| `nif-a2` | NIF A-2 — Postulados básicos | Sustancia económica, negocio en marcha, devengación, asociación, consistencia |
| `nif-a3` | NIF A-3 — Marco conceptual | Objetivos, usuarios, características de información financiera |
| `nif-a4` | NIF A-4 — Características cualitativas | Relevancia, confiabilidad, comparabilidad, comprensibilidad |
| `nif-a5` | NIF A-5 — Elementos de estados financieros | Activo, pasivo, capital, ingresos, gastos |
| `nif-a6` | NIF A-6 — Reconocimiento y valuación | Costo histórico, valor razonable, valor presente |
| `nif-a7` | NIF A-7 — Presentación y revelación | Cómo presentar estados financieros y notas |
| `concepto-devengacion` | Devengación contable | Principio de reconocer ingresos/gastos cuando se generan |
| `concepto-negocio-en-marcha` | Negocio en marcha | Presunción de continuidad de operaciones |
| `concepto-sustancia-economica` | Sustancia económica | Esencia sobre forma legal |
| `concepto-consistencia` | Consistencia contable | Métodos constantes en el tiempo |
| `concepto-asociacion` | Asociación de costos y gastos | Matching de gastos con ingresos generados |
| `concepto-entidad-economica` | Entidad económica | Separación de entidad y propietario |
| `concepto-ecuacion-contable` | Ecuación contable básica | Activo = Pasivo + Capital |
| `concepto-partida-doble` | Principio de partida doble | Cargos y abonos de igual monto |
| `nif-b-1` | NIF B-1 — Estado de situación financiera | Balance general y su estructura |
| `nif-b-2` | NIF B-2 — Estado de resultados | Estructura y tipos de estado de resultados |

### Agregar nuevos topics

Edita `src/data/nif_knowledge.json` y agrega objetos con esta estructura:

```json
{
  "id": "unique-id",
  "topic": "Nombre del topic",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "questionExamples": [
    "¿Cómo se hace X?",
    "¿Qué es Y?"
  ],
  "answer": "Respuesta detallada en español...",
  "sourceNote": "Fuente (ej: CINIF 2018)",
  "confidence": 0.9,
  "tags": ["tag1", "tag2"]
}
```

---

## Fases futuras

### Fase 2 — Integración LLM (opcional)
- Gemini Flash, Minimax u otro LLM para respuestas más naturales
- API key solo en `main.js` via `process.env`
- Fallback 100% funcional a base local
- Requiere revisión de seguridad

### Fase 3 — Acciones contables asistidas (futuro)
- Interpretar instrucciones naturales para proponer asientos
- **Regla:** IA solo propone, usuario confirma antes de guardar
- Requiere validación contable robusta y pruebas exhaustivas

---

## Validación manual

### Automatizada
```bash
node --check src/js/components/chatbot.js  # Sintaxis OK
npm start                                     # App lanza
npm run build:dir                             # Build pasa
```

### Manual
- [ ] FAB visible en esquina inferior derecha
- [ ] FAB abre panel compacto con glassmorphism
- [ ] Orbe visible en header (idle, rotación lenta)
- [ ]输入 "¿Qué son las NIF?" devuelve respuesta NIF
- [ ] Fallback funciona para tema fuera de base
- [ ] Botón expandir visible en header compacto
- [ ] Modo expandido abre como overlay con backdrop
- [ ] Historial se conserva al expandir
- [ ] 输入 otra pregunta en modo expandido funciona
- [ ] Botón "Volver" contrae a compacto
- [ ] Historial se conserva al contraer
- [ ] Escape cierra modo expandido (no vuelve a compacto)
- [ ] Navegación de la app (6 rutas) no se rompe
- [ ] prefers-reduced-motion desactiva/reduce animaciones

---

## Créditos y referencias

- **CINIF** — Consejo Mexicano de Normas de Información Financiera
- **NIF 2018** — Normas vigentes
- Implementación: Jarvis (Agente ejecutor Conta Fácil)
- Arquitectura: APEX PRIME

---

*Documento creado: 2026-04-25*
*Versión: 1.1.0 — Fase 1B (glassmorphism + expand + orb)*