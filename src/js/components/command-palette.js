// Aquí implemento la paleta de comandos / macros (estilo Ctrl+K o Ctrl+P)
// Es como la barra de comandos de VS Code, permite hacer todo con el teclado

// Estado del command palette
let commandPaletteVisible = false;

// Defino todos los comandos/macros disponibles
function getCommandList() {
    return [
        // Navegación
        { id: 'nav_dashboard', icon: '🏠', category: 'nav', nameKey: 'macro.goToDashboard', action: () => navigateTo('dashboard') },
        { id: 'nav_catalog', icon: '📚', category: 'nav', nameKey: 'macro.goToCatalog', action: () => navigateTo('catalog') },
        { id: 'nav_entries', icon: '📝', category: 'nav', nameKey: 'macro.goToEntries', action: () => navigateTo('entries') },
        { id: 'nav_balance', icon: '📊', category: 'nav', nameKey: 'macro.goToBalance', action: () => navigateTo('balance') },
        { id: 'nav_settings', icon: '⚙️', category: 'nav', nameKey: 'macro.goToSettings', action: () => navigateTo('settings') },

        // Asientos rápidos
        { id: 'entry_opening', icon: '📋', category: 'entry', nameKey: 'macro.newOpening', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('opening'), 200); } },
        { id: 'entry_cash', icon: '💵', category: 'entry', nameKey: 'macro.newCashPurchase', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('cashPurchase'), 200); } },
        { id: 'entry_credit', icon: '🏷️', category: 'entry', nameKey: 'macro.newCreditPurchase', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('creditPurchase'), 200); } },
        { id: 'entry_combined', icon: '🔄', category: 'entry', nameKey: 'macro.newCombinedPurchase', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('combinedPurchase'), 200); } },
        { id: 'entry_advance', icon: '🤝', category: 'entry', nameKey: 'macro.newCustomerAdvance', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('customerAdvance'), 200); } },
        { id: 'entry_stationery', icon: '📎', category: 'entry', nameKey: 'macro.newStationeryPurchase', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('stationeryPurchase'), 200); } },
        { id: 'entry_rent', icon: '🏠', category: 'entry', nameKey: 'macro.newPrepaidRent', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('prepaidRent'), 200); } },
        { id: 'entry_free', icon: '✏️', category: 'entry', nameKey: 'macro.newFreeEntry', action: () => { navigateTo('entries'); setTimeout(() => showEntryForm('free'), 200); } },

        // Acciones
        { id: 'action_export', icon: '📄', category: 'action', nameKey: 'macro.exportPdf', action: () => { navigateTo('balance'); setTimeout(() => exportBalancePDF(), 300); } },
        { id: 'action_lang', icon: '🌐', category: 'action', nameKey: 'macro.toggleLanguage', action: () => { toggleLanguage(); setTimeout(() => navigateTo(getCurrentRoute()), 50); } },
        { id: 'action_new_account', icon: '➕', category: 'action', nameKey: 'macro.newAccount', action: () => { navigateTo('catalog'); setTimeout(() => showAccountModal(), 200); } },
    ];
}

// Renderizo el HTML del command palette
function renderCommandPalette() {
    return `
    <div class="command-palette-overlay hidden" id="commandPalette" onclick="closeCommandPalette(event)">
      <div class="command-palette" onclick="event.stopPropagation()">
        <div class="command-palette__search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text"
            class="command-palette__input"
            id="commandPaletteInput"
            placeholder="${t('macro.searchPlaceholder')}"
            oninput="filterCommands(this.value)"
            onkeydown="handleCommandKeydown(event)">
          <kbd class="command-palette__shortcut">Esc</kbd>
        </div>
        <div class="command-palette__results" id="commandPaletteResults">
          ${renderCommandResults(getCommandList())}
        </div>
        <div class="command-palette__footer">
          <span>↑↓ ${t('macro.navigate')}</span>
          <span>↵ ${t('macro.execute')}</span>
          <span>Esc ${t('macro.close')}</span>
        </div>
      </div>
    </div>
  `;
}

// Renderizo los resultados agrupados por categoría
function renderCommandResults(commands) {
    const categories = {
        nav: { label: getCurrentLanguage() === 'es' ? 'Navegación' : 'Navigation', commands: [] },
        entry: { label: getCurrentLanguage() === 'es' ? 'Asientos Rápidos' : 'Quick Entries', commands: [] },
        action: { label: getCurrentLanguage() === 'es' ? 'Acciones' : 'Actions', commands: [] }
    };

    commands.forEach(cmd => {
        if (categories[cmd.category]) {
            categories[cmd.category].commands.push(cmd);
        }
    });

    let html = '';
    let globalIndex = 0;

    Object.entries(categories).forEach(([key, cat]) => {
        if (cat.commands.length === 0) return;

        html += `<div class="command-palette__group-title">${cat.label}</div>`;
        cat.commands.forEach(cmd => {
            html += `
        <div class="command-palette__item ${globalIndex === 0 ? 'active' : ''}"
          data-index="${globalIndex}"
          data-command-id="${cmd.id}"
          onclick="executeCommand('${cmd.id}')"
          onmouseenter="highlightCommand(${globalIndex})">
          <span class="command-palette__item-icon">${cmd.icon}</span>
          <span class="command-palette__item-name">${t(cmd.nameKey)}</span>
        </div>
      `;
            globalIndex++;
        });
    });

    return html;
}

// Variable para rastrear el índice del comando resaltado
let highlightedCommandIndex = 0;

// Abro la paleta de comandos
function openCommandPalette() {
    const palette = document.getElementById('commandPalette');
    const input = document.getElementById('commandPaletteInput');

    if (!palette) return;

    // Reseteo el contenido
    const results = document.getElementById('commandPaletteResults');
    if (results) results.innerHTML = renderCommandResults(getCommandList());

    palette.classList.remove('hidden');
    commandPaletteVisible = true;
    highlightedCommandIndex = 0;

    // Doy foco al input
    setTimeout(() => {
        if (input) {
            input.value = '';
            input.focus();
        }
    }, 50);
}

// Cierro la paleta de comandos
function closeCommandPalette(event) {
    if (event && event.target && !event.target.closest('.command-palette') && event.target !== document.getElementById('commandPalette')) {
        // Clic fue en el overlay
    }
    const palette = document.getElementById('commandPalette');
    if (palette) {
        palette.classList.add('hidden');
        commandPaletteVisible = false;
    }
}

// Filtro los comandos según el texto escrito
function filterCommands(query) {
    const normalized = query.toLowerCase().trim();
    const commands = getCommandList();

    const filtered = normalized
        ? commands.filter(cmd => {
            const name = t(cmd.nameKey).toLowerCase();
            return name.includes(normalized) || cmd.id.includes(normalized);
        })
        : commands;

    const results = document.getElementById('commandPaletteResults');
    if (results) {
        results.innerHTML = renderCommandResults(filtered);
        highlightedCommandIndex = 0;
    }
}

// Manejo las teclas en la paleta de comandos (arriba, abajo, enter, escape)
function handleCommandKeydown(event) {
    const items = document.querySelectorAll('.command-palette__item');
    const maxIndex = items.length - 1;

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            highlightedCommandIndex = Math.min(highlightedCommandIndex + 1, maxIndex);
            highlightCommand(highlightedCommandIndex);
            break;

        case 'ArrowUp':
            event.preventDefault();
            highlightedCommandIndex = Math.max(highlightedCommandIndex - 1, 0);
            highlightCommand(highlightedCommandIndex);
            break;

        case 'Enter':
            event.preventDefault();
            const activeItem = document.querySelector('.command-palette__item.active');
            if (activeItem) {
                const commandId = activeItem.getAttribute('data-command-id');
                executeCommand(commandId);
            }
            break;

        case 'Escape':
            closeCommandPalette();
            break;
    }
}

// Resalto un comando específico
function highlightCommand(index) {
    highlightedCommandIndex = index;
    const items = document.querySelectorAll('.command-palette__item');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // Hago scroll si es necesario
    const activeItem = items[index];
    if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
    }
}

// Ejecuto un comando
function executeCommand(commandId) {
    const commands = getCommandList();
    const command = commands.find(cmd => cmd.id === commandId);

    if (command) {
        closeCommandPalette();
        command.action();
    }
}

// Configuro el atajo de teclado global (Ctrl+K)
function setupCommandPaletteShortcut() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K o Cmd+K para abrir la paleta
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (commandPaletteVisible) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
        }

        // Escape para cerrar
        if (e.key === 'Escape' && commandPaletteVisible) {
            closeCommandPalette();
        }
    });
}
