Ran command: `npm run build`
Viewed tasks.md:1-23
Listed directory docs
Listed directory desing
Viewed chatbot.css:1-430
Viewed chatbot.js:1-610

# Chatbot UI Design Spec — Fase 1B

## 1. Resumen ejecutivo
La Fase 1B tiene como objetivo aplicar una mejora visual significativa (UI/UX) al asistente NIF actual (Fase 1A). Se busca implementar una estética premium basada en *glassmorphism*, animaciones fluidas y la adición de un "Modo Expandido" tipo *dashboard AI*, sin alterar la lógica core, el router de la aplicación, ni añadir integraciones externas o LLMs en esta etapa.

## 2. Análisis de la imagen de referencia
*(Nota: Se detectó un typo en el repositorio. La imagen de referencia actualmente se encuentra en `docs/desing/chatbot_desing.png`. Se recomienda renombrar la carpeta y el archivo a `docs/design/chatbot_design.png`)*
Basado en la referencia visual solicitada, el diseño destaca por:
- **Composición visual:** Layouts limpios y centrados, maximizando el espacio en blanco.
- **Paleta aproximada:** Tonos pastel, gradientes suaves (azules, rosas, naranjas compatibles con Conta Fácil) y fondos translúcidos sobre bases claras/oscuras.
- **Formas:** Bordes redondeados pronunciados (`border-radius` alto) y formas orgánicas.
- **Glassmorphism:** Uso intensivo de fondos con transparencia y desenfoque (`backdrop-filter: blur`).
- **Sombras:** Sombras difusas y elegantes para dar profundidad y flotabilidad.
- **Jerarquía visual:** El input y el orbe animado son los focos principales de atención.
- **Input:** Moderno, sin bordes duros, con integración fluida del botón de envío.
- **Orbe/burbuja:** Elemento central que funciona como identidad visual del asistente, con variaciones de estado.
- **Microinteracciones inferidas:** Transiciones suaves de opacidad, transformaciones de escala al hacer hover/clic y pulsaciones sutiles.

## 3. Estado actual del chatbot
- **Hecho observado:** El chatbot actual funciona como un widget flotante en la esquina inferior derecha. Inyecta su DOM directamente desde JS y cuenta con un panel (`nif-chatbot-panel`), un header, un área de mensajes y un input.
- **Hecho observado:** Los estilos base en `src/css/chatbot.css` usan un prefijo seguro `nif-chatbot-` y variables locales de CSS atadas a `variables.css`.
- **Inferencia:** El componente renderiza mensajes creando elementos del DOM uno por uno (sin `innerHTML` con interpolación de datos) y maneja su estado localmente en `src/js/components/chatbot.js`.
- **Supuesto:** Al no usar un virtual DOM (como React), la implementación de transiciones complejas entre modos (compacto a expandido) requerirá una manipulación inteligente de clases CSS en los contenedores existentes para evitar tener que duplicar el DOM o la lógica de historial.

## 4. Objetivo visual
Evolucionar la interfaz de la Fase 1A hacia un producto que transmita la sensación de una IA moderna y avanzada. La UI debe sentirse fluida, táctil y orgánica, implementando *glassmorphism* de forma responsable para no perjudicar el rendimiento del motor renderizador de Electron.

## 5. Modo compacto — diseño propuesto
- **Layout:** Contenedor flotante anclado abajo a la derecha.
- **Tamaño aproximado:** 380px de ancho x 520px de alto (con topes máximos relativos al viewport).
- **FAB:** Botón flotante circular, con gradiente sutil y sombra difusa extendida. Animación de escala al hacer hover.
- **Header:** Translúcido, con controles reorganizados: botón de minimizar, botón de "Expandir" (nuevo) y limpiar.
- **Mensajes:** Burbujas con esquinas redondeadas asimétricas (ej. `border-bottom-left-radius: 4px` para el asistente). Fondo semi-transparente para mensajes de sistema o errores.
- **Input:** Contenedor tipo pastilla (`border-radius: 50px`) con *backdrop-filter* e integración de sombra interna.
- **Chips sugeridos:** Botones de esquinas muy redondeadas, texto mediano-pequeño y efecto hover de oscurecimiento o fondo sutil.
- **Estados:** 
  - *Cerrado:* FAB visible con orbe latiendo sutilmente en su interior.
  - *Abierto:* Panel entra con animación de *slide-up* y *fade-in*.
  - *Escribiendo/Pensando:* Indicador animado (3 puntos rebotando) o latido del orbe en el header.
  - *Error/Fallback:* Mensaje estilizado en tonos ámbar pastel, sin agresividad visual.

## 6. Modo expandido — diseño propuesto
- **Comportamiento:** Funciona como overlay flotante centrado (`position: fixed; inset: 0; margin: auto;`), superpuesto al contenido de la aplicación principal.
- **Tamaño recomendado:** 80vw x 85vh (max-width: 1200px), sobre un backdrop que oscurece o desenfoca (`backdrop-filter: blur(10px)`) la UI de Conta Fácil subyacente.
- **Fondo:** Capa *glassmorphic* con alto nivel de desenfoque, apoyada sobre gradientes radiales pastel imperceptibles.
- **Orbe central:** Posicionado temporalmente en el centro al abrir vacío, y posicionado estratégicamente al llenarse la pantalla con conversación.
- **Conversación:** Área amplia, centrada y legible. Burbujas con mayor margen y ancho máximo controlado.
- **Input inferior:** Ancho, centrado en la parte inferior de la ventana expandida.
- **Chips sugeridos:** Fila expansiva horizontal ubicada inmediatamente encima del área de input.
- **Botón volver:** Ubicado en la esquina superior izquierda o derecha, actuando como disparador para colapsar nuevamente al modo compacto.
- **Comportamiento responsive:** Altamente dependiente de `flexbox` y `vh/vw` para asegurar correcta disposición en cualquier tamaño de ventana de Electron.

## 7. Sistema visual
- **Colores:** Mantener armonía con Conta Fácil, incorporando variables translúcidas como `--nif-glass-bg: rgba(255, 255, 255, 0.7);` (y su contraparte en temas oscuros si existieran).
- **Gradientes:** Lineales e imperceptibles: `linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))`.
- **Blur:** Valores como `--nif-blur-md: blur(12px);` y `--nif-blur-lg: blur(24px);`.
- **Sombras:** Elegantes y apiladas: `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0,0,0,0.04);`.
- **Bordes:** Finos semitransparentes para delinear el *glass*: `1px solid rgba(255, 255, 255, 0.4);`.
- **Tipografía:** *Inter* (ya integrada). Pesos regulares (400) para cuerpo, y medios (500) para acciones y nombres.
- **Espaciado:** Aumento de *padding* interno general (`var(--space-4)` o superior) para dar sensación "premium".
- **Z-index:** Mantener el actual (`5000`) para compacto, y utilizar un z-index superior para el overlay (`6000`).

## 8. Orbe animado
- **Estructura HTML/CSS conceptual:** Un `div` principal renderizado con múltiples pseudoelementos (`::before`, `::after`) y propiedades `box-shadow` apiladas para simular volumen y brillo interno.
- **Animaciones CSS recomendadas:** Uso exclusivo de propiedades de bajo costo (`transform`, `opacity`, `background-position`) para evitar caídas de FPS.
- **Estados del orbe:**
  1. *Idle (Reposo):* Rotación lenta (`@keyframes rotate`) y palpitación minúscula (`scale(1)` a `scale(1.02)`).
  2. *Usuario escribiendo:* Palpitación se acelera ligeramente; leve aumento de opacidad.
  3. *Al enviar:* Transformación rápida de escala (expansión rápida a `scale(1.1)` y contracción a `0.9`), seguida de un desplazamiento visual si forma parte del avatar en el chat.
  4. *Respuesta:* Brillo o destello corto variando el canal alfa en la sombra exterior (`box-shadow`).
- **Versión MVP:** Un único círculo `div` con un gradiente lineal animado desplazándose vía `background-position`, y una animación `pulse`.
- **Versión avanzada:** Tres `divs` superpuestos con distintos valores de `border-radius` (simulando formas irregulares o un *blob*) girando a destiempo.

## 9. Microinteracciones
- **Abrir/Cerrar:** `opacity` y `transform: translateY(20px)` o escala desde la posición del botón. *Timing-function:* `cubic-bezier(0.16, 1, 0.3, 1)` para un efecto *spring* orgánico.
- **Expandir/Contraer:** Al ser complejo interpolar dimensiones absolutas y relativas en JS vainilla puro de manera fluida, la forma más limpia será hacer un `fade-out` muy rápido del modo actual y un `fade-in` del nuevo con una transición de escala de origen (`transform-origin`).
- **Hover:** Transiciones de 0.2s en botones y chips, cambiando color de fondo y subiendo `-1px` en Y.
- **Envío de mensaje:** El globo del usuario aparece instantáneamente con una animación de entrada desde abajo y ajuste de `opacity`.
- **Respuesta recibida:** Pequeño delay de 0.3s a 0.5s donde aparece el orbe en modo "pensando", y luego entra la respuesta con el mismo *fade-in*.
- **Limpiar chat:** El historial hace *fade-out* hacia abajo, reiniciando la vista inmediatamente tras completarse.

## 10. Accesibilidad
- **Navegación por teclado:** Asegurar que el cambio entre el modo expandido y compacto conserve el foco en el input. Modificar `tabindex` del widget colapsado si es necesario.
- **ARIA labels:** Extender las etiquetas actuales en los nuevos controles (`aria-label="Expandir a ventana completa"` y `aria-label="Volver a widget"`).
- **Foco visible:** Conservar la variable `--color-focus-ring` (o equivalente) garantizando un recuadro claro con la pseudo-clase `:focus-visible`.
- **Preferencia de movimiento:** Agrupar todas las animaciones del orbe y expansiones detrás de un `@media (prefers-reduced-motion: reduce)` para deshabilitarlas a usuarios sensibles.
- **Contraste mínimo:** Vigilar que los textos del usuario sobre los botones de acento cumplan ratios mínimos WCAG, especialmente considerando la translucidez de la caja *glass*.

## 11. Arquitectura frontend recomendada
- **Modificaciones en `chatbot.js`:** 
  - Añadir manejador de estado `let isExpanded = false;`.
  - Crear la función `toggleExpandedMode()` para agregar o remover una clase al DOM principal (`document.getElementById('nifChatbotPanel').classList.toggle('nif-chatbot-panel--expanded')`).
  - Lógica para inyectar y detener la animación del orbe según la acción que dispara `searchNIFKnowledge()`.
- **Modificaciones en `chatbot.css`:**
  - Crear el modificador `.nif-chatbot-panel--expanded` conteniendo las reglas fijas de pantalla completa.
  - Incorporar la hoja de estilos de las animaciones puras del orbe y variables relativas a los *blurs*.
- **Estrategia general:** No reescribir `injectChatbotDOM()`. En su lugar, añadir los botones faltantes a la inyección original y usar CSS anidado (`.nif-chatbot-panel--expanded .nif-chatbot-header`, etc.) para reestructurar drásticamente el layout visual sin perder las referencias en Javascript de los inputs y mensajes.

## 12. Archivos a modificar en Fase 1B
- **Archivos nuevos:** Ninguno. (Se recomienda mantener toda la estructura estética NIF dentro del scope actual).
- **Archivos existentes a modificar:**
  - `src/css/chatbot.css` (Para inyectar el sistema visual, variables glass, modificador expandido y orbe CSS).
  - `src/js/components/chatbot.js` (Inyección de botones adicionales para expandir, y manejador de estados).
  - *Action item documental:* Cambiar de nombre el asset erróneo a `docs/design/chatbot_design.png`.
- **Archivos que NO deben tocarse:**
  - `src/js/router.js`
  - `src/js/store.js`
  - `src/js/app.js`
  - `src/index.html`
  - `src/js/engine/*.js` (Ninguna lógica contable).
  - Persistencia de datos JSON.

## 13. Plan de implementación por slices
- **Slice 1: Correcciones y setup estructural.** Renombrar assets con typos. Preparar las variables CSS para el *glassmorphism* y refactorizar el código de CSS existente para recibirlas.
- **Slice 2: Rediseño compacto y Orbe MVP.** Aplicar los estilos premium al modo actual de widget. Inyectar el div representativo del orbe animado usando CSS keyframes simples.
- **Slice 3: El Modo Expandido.** Implementar la estructura CSS para superposición (`fixed`, `inset: 0`). Atar el botón "expandir" al toggle de la clase maestra en `chatbot.js`.
- **Slice 4: Microinteracciones.** Afinar las curvas de Bezier y animaciones transicionales en el envío de respuestas de bot y pulsaciones del orbe.
- **Slice 5: Accesibilidad y Refinamiento.** Testing visual final, confirmación de soporte `prefers-reduced-motion` y verificación del comportamiento sin internet.

## 14. Criterios de aceptación
- [ ] Typo corregido (renombrado de la carpeta y archivo `desing` a `design`).
- [ ] Interfaz del chatbot luce estética *glassmorphic* premium (blur, bordes redondeados, sombras dinámicas).
- [ ] Existencia de un orbe animado en CSS funcionando como indicador visual del bot.
- [ ] Existencia de un control UI para transicionar libremente entre modo widget y ventana expandida.
- [ ] Modo expandido actúa como overlay, sin alterar la vista actual de la app ni modificar `router.js`.
- [ ] Modos continúan siendo funcionales con la misma base `nif_knowledge.json`.
- [ ] Las funcionalidades de foco y accesibilidad (uso por teclado) se mantienen o mejoran en el nuevo layout.

## 15. Riesgos y mitigaciones
- **MEDIO - Degradación de GPU en Electron:** Abusar de múltiples filtros de `backdrop-filter: blur()` sobre contenedores complejos puede generar caídas severas de cuadros por segundo.
  * *Mitigación:* Aplicar el desenfoque estrictamente a elementos estáticos, reduciendo su radio a valores no superiores a 12px-20px si es posible.
- **MEDIO - Reajuste de Layouts:** Mover la caja de input de una interfaz contraída a un layout ancho puede romper flujos visuales y solapar mensajes.
  * *Mitigación:* Apoyarse fuertemente en flexbox para que las reglas de CSS fluyan sin anclar dimensiones en pixeles absolutos, logrando fluidez con anchos porcentuales o relativos a `clamp`.
- **BAJO - Complejidad de Z-Index:** Que el modo expandido interfiera con notificaciones/toasts.
  * *Mitigación:* Mantener control ordenado sobre el apilado `z-index` de los nuevos elementos, garantizando que el Toast esté siempre sobre el Modo Expandido.

## 16. Recomendación final
Para lograr el resultado más limpio y estable de esta Fase 1B, se aconseja **implementar de forma incremental**, resolviendo primero todos los estilos del rediseño en formato Compacto (Slices 1 y 2). Una vez asegurado de que el *glassmorphism* y el orbe funcionan correctamente y el rediseñado widget opera a la perfección, se debe proceder al salto del Modo Expandido (Slice 3). Intentar implementar todo el refactoring CSS junto con la reordenación del Modo Expandido podría propiciar roturas del DOM no intencionadas.