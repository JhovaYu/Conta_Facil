// ================================================================
// NIF Chatbot — Fase 1B: Premium Glassmorphic Design
// 100% local, sin API keys, sin internet
// SEGURIDAD: Sin innerHTML con contenido dinámico — solo DOM APIs
// ================================================================

// --- Estado global del chatbot ---
let chatbotOpen = false;
let isExpanded = false;
let chatHistory = []; // [{role: 'user'|'bot', text, timestamp}]

// --- Base de conocimiento NIF (cargada desde JSON) ---
let nifKnowledge = [];

// --- Umbral de confianza para match ---
const MATCH_THRESHOLD = 0.3;

// --- Estado del orbe ---
// 'idle' | 'thinking' | 'received'
let orbState = 'idle';

// ================================================================
// FUNCIONES DE INICIALIZACIÓN
// ================================================================

async function initChatbot() {
  try {
    await loadNIFKnowledge();
    injectChatbotDOM();
    setupChatbotEvents();
    addWelcomeMessage();
  } catch (error) {
    console.warn('[Chatbot] Error inicializando:', error);
  }
}

async function loadNIFKnowledge() {
  try {
    const response = await fetch('data/nif_knowledge.json');
    if (!response.ok) throw new Error('No se pudo cargar');
    nifKnowledge = await response.json();
  } catch (error) {
    console.error('[Chatbot] No se pudo cargar nif_knowledge.json:', error);
    nifKnowledge = getFallbackKnowledge();
  }
}

function getFallbackKnowledge() {
  return [
    {
      id: 'fallback',
      topic: 'Información General',
      keywords: ['nif', 'normas', 'informacion', 'financiera'],
      questionExamples: ['¿Qué son las NIF?'],
      answer: 'Las NIF (Normas de Información Financiera) son un conjunto de normas que regulan la elaboración y presentación de información financiera en México, establecidas por el CINIF.',
      sourceNote: 'CINIF',
      confidence: 0.5,
      tags: ['nif']
    }
  ];
}

// ================================================================
// INYECCIÓN DEL DOM (solo HTML estático predefinido)
// ================================================================

function injectChatbotDOM() {
  if (document.getElementById('nifChatbotWidget')) return;

  // Backdrop para modo expandido
  const backdrop = document.createElement('div');
  backdrop.className = 'nif-chatbot-backdrop';
  backdrop.id = 'nifChatbotBackdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  // Contenedor principal
  const container = document.createElement('div');
  container.className = 'nif-chatbot';
  container.id = 'nifChatbotWidget';

  // Panel
  const panel = document.createElement('div');
  panel.className = 'nif-chatbot-panel';
  panel.id = 'nifChatbotPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chatbot NIF Académico');

  // Header
  const header = document.createElement('div');
  header.className = 'nif-chatbot-header';

  const headerInfo = document.createElement('div');
  headerInfo.className = 'nif-chatbot-header__info';

  // Orb del header
  const headerOrb = document.createElement('div');
  headerOrb.className = 'nif-chatbot-header__orb';
  headerOrb.id = 'nifChatbotHeaderOrb';

  const headerText = document.createElement('div');
  headerText.className = 'nif-chatbot-header__text';

  const headerTitle = document.createElement('div');
  headerTitle.className = 'nif-chatbot-header__title';
  headerTitle.textContent = 'Asistente NIF';

  const headerSubtitle = document.createElement('div');
  headerSubtitle.className = 'nif-chatbot-header__subtitle';
  headerSubtitle.textContent = 'Académico · Sin internet';

  headerText.appendChild(headerTitle);
  headerText.appendChild(headerSubtitle);
  headerInfo.appendChild(headerOrb);
  headerInfo.appendChild(headerText);

  const headerActions = document.createElement('div');
  headerActions.className = 'nif-chatbot-header__actions';

  // Botón limpiar
  const clearBtn = document.createElement('button');
  clearBtn.className = 'nif-chatbot-header__btn';
  clearBtn.id = 'nifChatbotClear';
  clearBtn.setAttribute('title', 'Limpiar chat');
  clearBtn.setAttribute('aria-label', 'Limpiar conversación');
  clearBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

  // Botón expandir
  const expandBtn = document.createElement('button');
  expandBtn.className = 'nif-chatbot-header__btn nif-chatbot-header__btn--expand';
  expandBtn.id = 'nifChatbotExpand';
  expandBtn.setAttribute('title', 'Expandir a ventana completa');
  expandBtn.setAttribute('aria-label', 'Expandir a ventana completa');
  expandBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;

  // Botón volver (del modo expandido)
  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'nif-chatbot-header__btn nif-chatbot-header__btn--collapse';
  collapseBtn.id = 'nifChatbotCollapse';
  collapseBtn.setAttribute('title', 'Volver al widget');
  collapseBtn.setAttribute('aria-label', 'Volver al widget compacto');
  collapseBtn.style.display = 'none';
  collapseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="10" y1="14" x2="21" y2="3"></line><line x1="3" y1="21" x2="14" y2="10"></line></svg>`;

  // Botón cerrar
  const closeBtn = document.createElement('button');
  closeBtn.className = 'nif-chatbot-header__btn';
  closeBtn.id = 'nifChatbotClose';
  closeBtn.setAttribute('title', 'Cerrar');
  closeBtn.setAttribute('aria-label', 'Cerrar chatbot');
  closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  headerActions.appendChild(clearBtn);
  headerActions.appendChild(expandBtn);
  headerActions.appendChild(collapseBtn);
  headerActions.appendChild(closeBtn);
  header.appendChild(headerInfo);
  header.appendChild(headerActions);

  // Messages area
  const messages = document.createElement('div');
  messages.className = 'nif-chatbot-messages';
  messages.id = 'nifChatbotMessages';
  messages.setAttribute('role', 'log');
  messages.setAttribute('aria-live', 'polite');

  // Footer
  const footer = document.createElement('div');
  footer.className = 'nif-chatbot-footer';

  const inputWrap = document.createElement('div');
  inputWrap.className = 'nif-chatbot-input-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'nif-chatbot-input';
  input.id = 'nifChatbotInput';
  input.placeholder = 'Escribe tu pregunta sobre NIF...';
  input.autocomplete = 'off';
  input.maxLength = '500';
  input.setAttribute('aria-label', 'Pregunta para el chatbot NIF');

  const sendBtn = document.createElement('button');
  sendBtn.className = 'nif-chatbot-send';
  sendBtn.id = 'nifChatbotSend';
  sendBtn.setAttribute('aria-label', 'Enviar mensaje');
  sendBtn.setAttribute('title', 'Enviar');
  sendBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;

  inputWrap.appendChild(input);
  inputWrap.appendChild(sendBtn);
  footer.appendChild(inputWrap);

  // Ensamblar panel
  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(footer);

  // FAB
  const fab = document.createElement('button');
  fab.className = 'nif-chatbot-fab';
  fab.id = 'nifChatbotFab';
  fab.setAttribute('aria-label', 'Abrir asistente NIF');
  fab.setAttribute('title', 'Asistente NIF');
  fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

  container.appendChild(panel);
  container.appendChild(fab);
  document.body.appendChild(container);

  // Backdrop se inserta antes del container
  document.body.insertBefore(backdrop, container);
}

// ================================================================
// ORBE — estados visuales
// ================================================================

function setOrbState(state) {
  orbState = state;
  const orb = document.getElementById('nifChatbotHeaderOrb');
  if (!orb) return;

  orb.classList.remove('nif-chatbot-header__orb--thinking', 'nif-chatbot-header__orb--received');
  if (state === 'thinking') {
    orb.classList.add('nif-chatbot-header__orb--thinking');
  } else if (state === 'received') {
    orb.classList.add('nif-chatbot-header__orb--received');
    // Volver a idle después de la animación
    setTimeout(() => {
      if (orbState === 'received') setOrbState('idle');
    }, 600);
  }
}

// ================================================================
// EVENT LISTENERS
// ================================================================

function setupChatbotEvents() {
  const fab = document.getElementById('nifChatbotFab');
  const closeBtn = document.getElementById('nifChatbotClose');
  const expandBtn = document.getElementById('nifChatbotExpand');
  const collapseBtn = document.getElementById('nifChatbotCollapse');
  const clearBtn = document.getElementById('nifChatbotClear');
  const input = document.getElementById('nifChatbotInput');
  const sendBtn = document.getElementById('nifChatbotSend');
  const backdrop = document.getElementById('nifChatbotBackdrop');

  if (fab) fab.addEventListener('click', toggleChatbot);
  if (closeBtn) closeBtn.addEventListener('click', closeChatbot);
  if (expandBtn) expandBtn.addEventListener('click', toggleExpandedMode);
  if (collapseBtn) collapseBtn.addEventListener('click', toggleExpandedMode);
  if (clearBtn) clearBtn.addEventListener('click', clearChatHistory);

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    // Focus on typing
    input.addEventListener('focus', () => setOrbState('idle'));
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  // Backdrop click closes expanded
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      if (isExpanded) toggleExpandedMode();
    });
  }

  // Teclado global
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isExpanded) {
        toggleExpandedMode();
      } else if (chatbotOpen) {
        closeChatbot();
      }
    }
  });

  // Cerrar si clic fuera del panel (solo en modo compacto)
  document.addEventListener('click', (e) => {
    if (!chatbotOpen || isExpanded) return;
    const panelEl = document.getElementById('nifChatbotPanel');
    const fabEl = document.getElementById('nifChatbotFab');
    if (panelEl && fabEl &&
        !panelEl.contains(e.target) &&
        !fabEl.contains(e.target)) {
      closeChatbot();
    }
  });
}

// ================================================================
// TOGGLE OPEN / CLOSE
// ================================================================

function toggleChatbot() {
  chatbotOpen = !chatbotOpen;
  updatePanelVisibility();
  const fab = document.getElementById('nifChatbotFab');

  if (chatbotOpen) {
    fab.setAttribute('aria-label', 'Cerrar asistente NIF');
    focusInput();
  } else {
    fab.setAttribute('aria-label', 'Abrir asistente NIF');
  }
}

function closeChatbot() {
  if (chatbotOpen) {
    chatbotOpen = false;
    updatePanelVisibility();
    const fab = document.getElementById('nifChatbotFab');
    if (fab) fab.setAttribute('aria-label', 'Abrir asistente NIF');
  }
}

function updatePanelVisibility() {
  const panel = document.getElementById('nifChatbotPanel');
  const fab = document.getElementById('nifChatbotFab');
  const backdrop = document.getElementById('nifChatbotBackdrop');
  const expandBtn = document.getElementById('nifChatbotExpand');
  const collapseBtn = document.getElementById('nifChatbotCollapse');

  if (isExpanded) {
    panel.classList.toggle('nif-chatbot-panel--open', chatbotOpen);
    if (backdrop) backdrop.classList.toggle('nif-chatbot-backdrop--visible', chatbotOpen);
    return;
  }

  // Modo compacto
  panel.classList.toggle('nif-chatbot-panel--open', chatbotOpen);
  fab.classList.toggle('nif-chatbot-fab--open', chatbotOpen);
  if (backdrop) backdrop.classList.remove('nif-chatbot-backdrop--visible');

  // Toggle visibility of expand/collapse buttons
  if (expandBtn) expandBtn.style.display = chatbotOpen ? '' : '';
  if (collapseBtn) collapseBtn.style.display = 'none';
}

function focusInput() {
  const input = document.getElementById('nifChatbotInput');
  if (input) setTimeout(() => input.focus(), 80);
}

// ================================================================
// MODO EXPANDIDO
// ================================================================

function toggleExpandedMode() {
  isExpanded = !isExpanded;
  const panel = document.getElementById('nifChatbotPanel');
  const fab = document.getElementById('nifChatbotFab');
  const backdrop = document.getElementById('nifChatbotBackdrop');
  const expandBtn = document.getElementById('nifChatbotExpand');
  const collapseBtn = document.getElementById('nifChatbotCollapse');

  if (isExpanded) {
    // Asegurar que el panel está abierto
    chatbotOpen = true;

    panel.classList.add('nif-chatbot-panel--expanded');
    fab.classList.add('nif-chatbot-fab--hidden');
    if (backdrop) backdrop.classList.add('nif-chatbot-backdrop--visible');
    if (expandBtn) expandBtn.style.display = 'none';
    if (collapseBtn) collapseBtn.style.display = '';
    panel.classList.add('nif-chatbot-panel--open');
  } else {
    panel.classList.remove('nif-chatbot-panel--expanded');
    fab.classList.remove('nif-chatbot-fab--hidden');
    if (backdrop) backdrop.classList.remove('nif-chatbot-backdrop--visible');
    if (expandBtn) expandBtn.style.display = '';
    if (collapseBtn) collapseBtn.style.display = 'none';
    // Mantener panel abierto en modo compacto
    panel.classList.add('nif-chatbot-panel--open');
  }
}

// ================================================================
// MENSAJERÍA
// ================================================================

function addWelcomeMessage() {
  const messagesEl = document.getElementById('nifChatbotMessages');
  if (!messagesEl) return;

  messagesEl.innerHTML = '';
  messagesEl.className = 'nif-chatbot-messages';

  const welcome = document.createElement('div');
  welcome.className = 'nif-chatbot-welcome';

  const orbWrap = document.createElement('div');
  orbWrap.className = 'nif-chatbot-welcome__orb-wrap';
  const orb = document.createElement('div');
  orb.className = 'nif-chatbot-welcome__orb';
  orbWrap.appendChild(orb);

  const title = document.createElement('div');
  title.className = 'nif-chatbot-welcome__title';
  title.textContent = 'Asistente NIF Académico';

  const subtitle = document.createElement('div');
  subtitle.className = 'nif-chatbot-welcome__subtitle';
  subtitle.textContent = 'Puedo responder preguntas sobre Normas de Información Financiera. Prueba preguntarme sobre NIF A-1, postulados básicos, devengación contable y más.';

  const topics = document.createElement('div');
  topics.className = 'nif-chatbot-welcome__topics';

  const quickTopics = ['NIF A-1', 'Devengación', 'Negocio en marcha', 'Partida doble', 'Ecuación contable'];
  quickTopics.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'nif-chatbot-welcome__topic';
    btn.textContent = t;
    btn.addEventListener('click', () => nifChatbotQuickTopic(t));
    topics.appendChild(btn);
  });

  welcome.appendChild(orbWrap);
  welcome.appendChild(title);
  welcome.appendChild(subtitle);
  welcome.appendChild(topics);
  messagesEl.appendChild(welcome);
}

function nifChatbotQuickTopic(topic) {
  const input = document.getElementById('nifChatbotInput');
  if (input) {
    input.value = topic;
    sendMessage();
  }
}

function sendMessage() {
  const input = document.getElementById('nifChatbotInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = '';

  // Activar estado pensando del orbe
  setOrbState('thinking');

  setTimeout(() => {
    const response = searchNIFKnowledge(text);
    if (response) {
      addBotMessage(response.answer, response.topic, response.sourceNote);
      setOrbState('received');
    } else {
      addFallbackMessage(text);
      setOrbState('received');
    }
  }, 500);
}

function addUserMessage(text) {
  chatHistory.push({ role: 'user', text, timestamp: Date.now() });
  renderMessages();
}

function addBotMessage(answer, topic, sourceNote) {
  chatHistory.push({ role: 'bot', text: answer, topic, sourceNote, timestamp: Date.now() });
  renderMessages();
}

function addFallbackMessage(originalQuery) {
  const fallback = getChatbotFallback(originalQuery);
  chatHistory.push({ role: 'bot', text: fallback.text, isFallback: true, topics: fallback.suggestions, timestamp: Date.now() });
  renderMessages();
}

function clearChatHistory() {
  chatHistory = [];
  setOrbState('idle');
  addWelcomeMessage();
}

// ================================================================
// RENDERIZADO (DOM APIs — sin innerHTML con datos)
// ================================================================

function renderMessages() {
  const messagesEl = document.getElementById('nifChatbotMessages');
  if (!messagesEl) return;

  const welcomeEl = messagesEl.querySelector('.nif-chatbot-welcome');
  if (welcomeEl && chatHistory.length > 0) {
    welcomeEl.remove();
  }

  if (chatHistory.length === 0) {
    if (!welcomeEl) addWelcomeMessage();
    return;
  }

  messagesEl.innerHTML = '';

  chatHistory.forEach(msg => {
    const msgEl = createMessageElement(msg);
    messagesEl.appendChild(msgEl);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createMessageElement(msg) {
  const container = document.createElement('div');
  container.className = `nif-chatbot-message nif-chatbot-message--${msg.role}`;

  const bubble = document.createElement('div');
  bubble.className = 'nif-chatbot-message__bubble';

  if (msg.role === 'user') {
    bubble.textContent = msg.text;
  } else {
    if (msg.isFallback) {
      bubble.appendChild(createFallbackBubble(msg));
    } else {
      if (msg.topic) {
        const strong = document.createElement('strong');
        strong.textContent = msg.topic + ': ';
        bubble.appendChild(strong);
      }
      const lines = msg.text.split('\n');
      lines.forEach((line, i) => {
        if (i > 0) bubble.appendChild(document.createElement('br'));
        bubble.appendChild(document.createTextNode(line));
      });
      if (msg.sourceNote) {
        const source = document.createElement('div');
        source.style.marginTop = '8px';
        source.style.fontSize = '10px';
        source.style.color = 'var(--nif-text-secondary)';
        source.style.fontStyle = 'italic';
        source.textContent = 'Fuente: ' + msg.sourceNote;
        bubble.appendChild(source);
      }
    }
  }

  const time = document.createElement('div');
  time.className = 'nif-chatbot-message__time';
  time.textContent = formatTime(msg.timestamp);

  container.appendChild(bubble);
  container.appendChild(time);
  return container;
}

function createFallbackBubble(msg) {
  const fallback = document.createElement('div');
  fallback.className = 'nif-chatbot-fallback';

  const title = document.createElement('div');
  title.className = 'nif-chatbot-fallback__title';
  title.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  title.appendChild(document.createTextNode('No tengo información sobre eso'));

  const desc = document.createElement('div');
  desc.textContent = msg.text;

  fallback.appendChild(title);
  fallback.appendChild(desc);

  if (msg.topics && msg.topics.length > 0) {
    const suggestions = document.createElement('div');
    suggestions.className = 'nif-chatbot-suggestions';

    const label = document.createElement('span');
    label.className = 'nif-chatbot-suggestions__label';
    label.textContent = 'Temas que sí puedo responder:';
    suggestions.appendChild(label);

    msg.topics.slice(0, 5).forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'nif-chatbot-suggestion';
      btn.textContent = t;
      btn.addEventListener('click', () => nifChatbotQuickTopic(t));
      suggestions.appendChild(btn);
    });

    fallback.appendChild(suggestions);
  }

  return fallback;
}

// ================================================================
// BÚSQUEDA EN BASE LOCAL (sin cambios desde Fase 1A)
// ================================================================

function searchNIFKnowledge(query) {
  if (!query || !query.trim()) return null;
  if (nifKnowledge.length === 0) return null;

  const normalizedQuery = normalizeText(query);
  let bestMatch = null;
  let bestScore = 0;

  for (const item of nifKnowledge) {
    const score = calculateMatchScore(item, normalizedQuery);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestScore >= MATCH_THRESHOLD) {
    return {
      answer: bestMatch.answer,
      topic: bestMatch.topic,
      sourceNote: bestMatch.sourceNote,
      confidence: bestMatch.confidence
    };
  }

  return null;
}

function calculateMatchScore(item, query) {
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);

  let score = 0;
  let totalPossible = 0;

  for (const keyword of item.keywords || []) {
    totalPossible += 1;
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  for (const example of item.questionExamples || []) {
    totalPossible += 1;
    const normalizedExample = normalizeText(example);
    if (normalizedExample.includes(normalizedQuery) || normalizedQuery.includes(normalizedExample)) {
      score += 1.5;
    } else {
      const exampleWords = normalizedExample.split(/\s+/);
      const matches = words.filter(w => exampleWords.some(ew => ew.includes(w) || w.includes(ew)));
      score += (matches.length / exampleWords.length) * 1.5;
    }
  }

  if (item.topic) {
    totalPossible += 1;
    const normalizedTopic = normalizeText(item.topic);
    const topicWords = normalizedTopic.split(/\s+/);
    const topicMatches = words.filter(w => topicWords.some(tw => tw.includes(w) || w.includes(tw)));
    if (topicMatches.length > 0) {
      score += (topicMatches.length / topicWords.length);
    }
  }

  for (const tag of item.tags || []) {
    totalPossible += 0.5;
    if (normalizedQuery.includes(tag.toLowerCase())) {
      score += 0.5;
    }
  }

  return totalPossible > 0 ? score / totalPossible : 0;
}

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ================================================================
// FALLBACK
// ================================================================

function getChatbotFallback(query) {
  const topics = nifKnowledge
    .map(item => ({ topic: item.topic, score: calculateMatchScore(item, query) }))
    .filter(t => t.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(t => t.topic);

  const suggestions = topics.length > 0 ? topics : getDefaultFallbackTopics();

  const baseMessages = [
    'No tengo información específica sobre ese tema en mi base de conocimiento NIF.',
    'No encontré información sobre ese concepto en las NIF que conozco.',
    'Mi base de conocimiento cubre principalmente las NIF básicas (A-1 a A-7) y conceptos fundamentales. Puedo ayudarte si me preguntas sobre esos temas.',
    'Esa pregunta está fuera de mi alcance actual. Intenta preguntarme sobre conceptos de NIF como:'
  ];

  const randomMsg = baseMessages[Math.floor(Math.random() * baseMessages.length)];

  return { text: randomMsg, suggestions: suggestions.slice(0, 5) };
}

function getDefaultFallbackTopics() {
  return [
    'NIF A-1 — Estructura de las NIF',
    'NIF A-2 — Postulados básicos',
    'NIF A-5 — Elementos de estados financieros',
    'Devengación contable',
    'Negocio en marcha',
    'Partida doble',
    'Ecuación contable'
  ];
}

// ================================================================
// UTILIDADES
// ================================================================

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

// ================================================================
// INYECCIÓN PRINCIPAL (llamada desde app.js)
// ================================================================

function injectChatbot() {
  try {
    if (document.getElementById('nifChatbotWidget')) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
      initChatbot();
    }
  } catch (error) {
    console.warn('[Chatbot] No se pudo inyectar el chatbot:', error);
  }
}

// Auto-inicializar
injectChatbot();
