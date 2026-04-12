// Aquí manejo todo lo relacionado con el registro de asientos contables
// Es el módulo más complejo: tiene selector de tipo, formulario dinámico e historial

// Variable para rastrear el tipo de asiento seleccionado
let currentEntryType = null;
let currentEntriesFilter = 'all';

function setEntriesFilter(filter) {
    currentEntriesFilter = filter;
    const container = document.getElementById('viewContainer');
    if (container) {
        container.innerHTML = renderEntries();
        if (window.updateIcons) setTimeout(() => updateIcons(), 0);
    }
}

// Renderizo la vista completa de asientos
function renderEntries() {
  const allEntries = getEntries();
  const entries = currentEntriesFilter === 'all' ? allEntries : 
                  currentEntriesFilter === 'operations' ? allEntries.filter(e => !e.isAdjustment) :
                  allEntries.filter(e => e.isAdjustment);

  const html = `
    <div class="entries">
      <div class="page-header">
        <h1 class="page-title" data-i18n="entries.title">${t('entries.title')}</h1>
        <p class="page-subtitle" data-i18n="entries.subtitle">${t('entries.subtitle')}</p>
      </div>

      <!-- Tabs para filtrar Todos, Operaciones, Ajustes -->
      <div class="tabs" style="margin-bottom: var(--space-4);">
        <button class="tab ${currentEntriesFilter === 'all' ? 'active' : ''}" onclick="setEntriesFilter('all')">Todos</button>
        <button class="tab ${currentEntriesFilter === 'operations' ? 'active' : ''}" onclick="setEntriesFilter('operations')">Operaciones</button>
        <button class="tab ${currentEntriesFilter === 'adjustments' ? 'active' : ''}" onclick="setEntriesFilter('adjustments')">Ajustes del período</button>
      </div>

      <!-- Contenido en 2 columnas: Formulario/Selector + Historial -->
      <div class="content-grid">
        <!-- Columna izquierda: Selector de tipo o Formulario -->
        <div id="entryFormArea">
          ${renderEntryTypeSelector()}
        </div>

        <!-- Columna derecha: Historial -->
        <div>
          <div class="card">
            <div class="card__header">
              <h3 class="card__title" data-i18n="entries.history">${t('entries.history')}</h3>
            </div>
            <div id="entryHistoryList">
              ${renderEntryHistory(entries)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return html;
}

// Renderizo el selector de tipos de asiento (las cards para elegir)
// Filtramos los tipos basados en el tab seleccionado
function renderEntryTypeSelector() {
  let types = getEntryTypesList();
  
  if (currentEntriesFilter === 'operations') {
      types = types.filter(t => !t.isAdjustment);
  } else if (currentEntriesFilter === 'adjustments') {
      types = types.filter(t => t.isAdjustment);
  }

  return `
    <div class="card">
      <div class="card__header">
        <h3 class="card__title" data-i18n="entries.selectType">${t('entries.selectType')}</h3>
      </div>
      <div class="entries__type-selector">
        ${types.map(type => `
          <div class="entries__type-card" onclick="showEntryForm('${type.type}')" data-type="${type.type}">
            <div class="entries__type-icon"><i data-lucide="${type.icon}"></i></div>
            <div>
              <div class="entries__type-name" data-i18n="${type.nameKey}">${t(type.nameKey)}</div>
              <div class="entries__type-desc" data-i18n="${type.descKey}">${t(type.descKey)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Muestro el formulario de captura para el tipo seleccionado
function showEntryForm(type) {
  currentEntryType = type;
  const template = getEntryTemplate(type);
  const leafAccounts = getLeafAccounts();
  const formArea = document.getElementById('entryFormArea');

  // Reseteo el contador de IDs de searchable selects para esta vista
  searchableSelectCounter = 0;

  // Preparo los movimientos iniciales del template
  let initialMovements;
  if (template.movements.length > 0) {
    initialMovements = template.movements.map(m => ({
      accountCode: m.accountCode,
      debit: m.type === 'debit' ? '' : '',
      credit: m.type === 'credit' ? '' : ''
    }));
  } else {
    // Si es libre o apertura, pongo 2 filas vacías
    initialMovements = [
      { accountCode: '', debit: '', credit: '' },
      { accountCode: '', debit: '', credit: '' }
    ];
  }

  const today = new Date().toISOString().split('T')[0];

  formArea.innerHTML = `
    <div class="card">
      <div class="card__header">
        <div>
          <h3 class="card__title">${t(template.descriptionKey || 'entries.freeEntry')}</h3>
          <p class="card__subtitle">${t('entries.newEntry')}</p>
        </div>
        <button class="btn btn--ghost btn--sm" onclick="cancelEntryForm()">
          <i data-lucide="arrow-left" class="icon-sm" style="width: 16px; height: 16px;"></i> <span data-i18n="entries.back">${t('entries.back')}</span>
        </button>
      </div>

      <form id="entryForm" onsubmit="saveEntry(event)">
        <!-- Fecha y descripción -->
        <div class="form-row" style="margin-bottom: var(--space-4);">
          <div class="form-group">
            <label class="form-label" data-i18n="entries.date">${t('entries.date')}</label>
            <input type="date" class="form-input" id="entryDate" value="${today}" required>
          </div>
          <div class="form-group" style="flex: 2;">
            <label class="form-label" data-i18n="entries.description">${t('entries.description')}</label>
            <input type="text" class="form-input" id="entryDescription"
              placeholder="${t('entries.descriptionPlaceholder')}"
              value="${t(template.descriptionKey || '')}" required>
          </div>
        </div>

        <!-- Tabla de movimientos (cargos y abonos) -->
        <div class="entries__movements-header">
          <span data-i18n="entries.account">${t('entries.account')}</span>
          <span data-i18n="entries.debit">${t('entries.debit')}</span>
          <span data-i18n="entries.credit">${t('entries.credit')}</span>
          <span></span>
        </div>
        <div id="movementRows">
          ${initialMovements.map((m, i) => renderMovementRow(i, m, leafAccounts)).join('')}
        </div>

        <!-- Botón para agregar fila -->
        <div style="padding: var(--space-3) var(--space-4);">
          <button type="button" class="btn btn--secondary btn--sm" onclick="addMovementRow()" style="display:flex; align-items:center; gap:4px">
            <i data-lucide="plus" class="icon-sm" style="width: 16px; height: 16px;"></i> <span data-i18n="entries.addRow">${t('entries.addRow')}</span>
          </button>
        </div>

        <!-- Verificación de cuadre -->
        <div class="entries__verification" id="entryVerification">
          <div class="entries__verification-item">
            <div class="entries__verification-label" data-i18n="entries.totalDebits">${t('entries.totalDebits')}</div>
            <div class="entries__verification-value" id="totalDebits">$0.00</div>
          </div>
          <div class="entries__verification-item">
            <div class="entries__verification-label" data-i18n="entries.totalCredits">${t('entries.totalCredits')}</div>
            <div class="entries__verification-value" id="totalCredits">$0.00</div>
          </div>
          <div class="entries__verification-item">
            <div class="entries__verification-label">Status</div>
            <div class="entries__verification-value" id="balanceStatus" data-i18n="entries.balanced">${t('entries.balanced')}</div>
          </div>
        </div>

        <!-- Botones del formulario -->
        <div style="display: flex; justify-content: flex-end; gap: var(--space-3); padding: var(--space-4);">
          <button type="button" class="btn btn--secondary" onclick="cancelEntryForm()" data-i18n="entries.cancel">${t('entries.cancel')}</button>
          <button type="submit" class="btn btn--primary" id="saveEntryBtn" data-i18n="entries.save">${t('entries.save')}</button>
        </div>
      </form>
    </div>
  `;

  // Actualizo los totales en tiempo real
  updateVerification();
  if (window.updateIcons) updateIcons();
}

// Renderizo una fila de movimiento usando el searchable select en vez de un select nativo
function renderMovementRow(index, movement, accounts) {
  if (!accounts) accounts = getLeafAccounts();

  return `
    <div class="entries__movement-row" data-row="${index}">
      ${createSearchableSelect('account_' + index, accounts, movement.accountCode)}
      <input type="number" class="form-input text-mono" name="debit_${index}"
        placeholder="0.00" step="0.01" min="0"
        value="${movement.debit || ''}"
        oninput="onDebitInput(${index}); updateVerification()">
      <input type="number" class="form-input text-mono" name="credit_${index}"
        placeholder="0.00" step="0.01" min="0"
        value="${movement.credit || ''}"
        oninput="onCreditInput(${index}); updateVerification()">
      <button type="button" class="entries__movement-remove" onclick="removeMovementRow(${index})"><i data-lucide="x" style="width: 16px; height: 16px; pointer-events: none;"></i></button>
    </div>
  `;
}

// Cuando escribo en cargo, limpio abono y viceversa (una cuenta solo puede tener uno)
function onDebitInput(index) {
  const creditInput = document.querySelector(`[name="credit_${index}"]`);
  const debitInput = document.querySelector(`[name="debit_${index}"]`);
  if (debitInput && debitInput.value && creditInput) {
    creditInput.value = '';
  }
}

function onCreditInput(index) {
  const debitInput = document.querySelector(`[name="debit_${index}"]`);
  const creditInput = document.querySelector(`[name="credit_${index}"]`);
  if (creditInput && creditInput.value && debitInput) {
    debitInput.value = '';
  }
}

// Agrego una nueva fila de movimiento
function addMovementRow() {
  const container = document.getElementById('movementRows');
  const rows = container.querySelectorAll('.entries__movement-row');
  const newIndex = rows.length;

  const newRow = document.createElement('div');
  newRow.innerHTML = renderMovementRow(newIndex, { accountCode: '', debit: '', credit: '' });

  // Tomo el contenido del div temporal
  container.appendChild(newRow.firstElementChild);
  if (window.updateIcons) updateIcons();
}

// Elimino una fila de movimiento
function removeMovementRow(index) {
  const rows = document.querySelectorAll('.entries__movement-row');
  if (rows.length <= 2) return; // Mínimo 2 filas siempre

  const row = document.querySelector(`[data-row="${index}"]`);
  if (row) {
    row.remove();
    updateVerification();
  }
}

// Actualizo los totales de verificación en tiempo real
function updateVerification() {
  const movements = getFormMovements();
  const { totalDebits, totalCredits } = calculateMovementTotals(movements);

  const debitsEl = document.getElementById('totalDebits');
  const creditsEl = document.getElementById('totalCredits');
  const statusEl = document.getElementById('balanceStatus');

  if (debitsEl) debitsEl.textContent = formatCurrency(totalDebits);
  if (creditsEl) creditsEl.textContent = formatCurrency(totalCredits);

  if (statusEl) {
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;
    if (isBalanced) {
      statusEl.textContent = t('entries.balanced');
      statusEl.className = 'entries__verification-value entries__verification-value--balanced';
    } else {
      statusEl.textContent = t('entries.unbalanced');
      statusEl.className = 'entries__verification-value entries__verification-value--unbalanced';
    }
  }
}

// Obtengo los movimientos actuales del formulario (ahora usando searchable selects)
function getFormMovements() {
  const rows = document.querySelectorAll('.entries__movement-row');
  const movements = [];

  rows.forEach((row) => {
    // Busco el searchable select dentro de la fila
    const searchableSelect = row.querySelector('.searchable-select');
    const accountCode = searchableSelect ? searchableSelect.getAttribute('data-value') : '';

    const debit = row.querySelector(`[name^="debit"]`);
    const credit = row.querySelector(`[name^="credit"]`);

    movements.push({
      accountCode: accountCode || '',
      debit: debit ? parseFloat(debit.value) || 0 : 0,
      credit: credit ? parseFloat(credit.value) || 0 : 0
    });
  });

  return movements;
}

// Guardo el asiento contable
async function saveEntry(event) {
  event.preventDefault();

  const date = document.getElementById('entryDate').value;
  const description = document.getElementById('entryDescription').value;
  const movements = getFormMovements();

  // Uso el motor contable para validar y crear
  const result = createEntry(currentEntryType || 'free', date, description, movements);

  if (!result.success) {
    showToast(t(result.error), 'error');
    return;
  }

  // Guardo en el store
  const saved = await addEntry(result.entry);

  if (saved) {
    showToast(t('toast.entrySaved'), 'success');

    // Re-renderizo la vista completa
    const container = document.getElementById('viewContainer');
    container.innerHTML = renderEntries();
  }
}

// Cancelo el formulario y vuelvo al selector de tipos
function cancelEntryForm() {
  currentEntryType = null;
  const formArea = document.getElementById('entryFormArea');
  if (formArea) {
    formArea.innerHTML = renderEntryTypeSelector();
    if (window.updateIcons) updateIcons();
  }
}

// Renderizo el historial de asientos
function renderEntryHistory(entries) {
  if (!entries || entries.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon"><i data-lucide="file-text" style="width: 32px; height: 32px;"></i></div>
        <div class="empty-state__title" data-i18n="entries.noEntries">${t('entries.noEntries')}</div>
        <div class="empty-state__description" data-i18n="entries.noEntriesDesc">${t('entries.noEntriesDesc')}</div>
      </div>
    `;
  }

  // Ordeno del más reciente al más antiguo
  const sorted = [...entries].sort((a, b) => (b.id || 0) - (a.id || 0));

  return sorted.map(entry => {
    const totalDebit = entry.movements.reduce((sum, m) => sum + (m.debit || 0), 0);
    const badge = entry.isAdjustment ? 
        `<span style="margin-left:8px; font-size:0.7rem; padding:2px 6px; border-radius:4px; background:#fff3cd; color:#856404; border:1px solid #ffeeba; white-space:nowrap; display:flex; align-items:center; gap:4px;"><i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i> Ajuste</span>` : '';
        
    return `
      <div class="entries__history-item" onclick="showEntryDetail(${entry.id})">
        <div class="entries__history-number">${entry.id}</div>
        <div class="entries__history-info">
          <div class="entries__history-desc" style="display:flex; align-items:center;">${entry.description} ${badge}</div>
          <div class="entries__history-date">${formatDate(entry.date)}</div>
        </div>
        <div class="entries__history-amount">${formatCurrency(totalDebit)}</div>
      </div>
    `;
  }).join('');
}

// Muestro el detalle de un asiento específico
function showEntryDetail(id) {
  const entries = getEntries();
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  const formArea = document.getElementById('entryFormArea');

  formArea.innerHTML = `
    <div class="card">
      <div class="card__header">
        <div>
          <h3 class="card__title">${t('entries.entryNumber')}${entry.id}</h3>
          <p class="card__subtitle">${entry.description} — ${formatDate(entry.date)}</p>
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <button class="btn btn--danger btn--sm" onclick="deleteEntryHandler(${entry.id})" style="display:flex; align-items:center; gap:4px">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i> <span data-i18n="entries.deleteEntry">${t('entries.deleteEntry')}</span>
          </button>
          <button class="btn btn--ghost btn--sm" onclick="cancelEntryForm()" style="display:flex; align-items:center; gap:4px">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> <span data-i18n="entries.back">${t('entries.back')}</span>
          </button>
        </div>
      </div>

      <!-- Tabla de movimientos del asiento -->
      <div class="table-container" style="border: none; box-shadow: none;">
        <table class="table">
          <thead>
            <tr>
              <th data-i18n="entries.account">${t('entries.account')}</th>
              <th class="text-right" data-i18n="entries.debit">${t('entries.debit')}</th>
              <th class="text-right" data-i18n="entries.credit">${t('entries.credit')}</th>
            </tr>
          </thead>
          <tbody>
            ${entry.movements.map(m => {
    const acc = findAccountByCode(m.accountCode);
    return `
                <tr>
                  <td>${m.accountCode} - ${acc ? getAccountName(acc) : m.accountCode}</td>
                  <td class="text-right text-mono">${m.debit ? formatCurrency(m.debit) : ''}</td>
                  <td class="text-right text-mono">${m.credit ? formatCurrency(m.credit) : ''}</td>
                </tr>
              `;
  }).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td><strong>Total</strong></td>
              <td class="text-right text-mono"><strong>${formatCurrency(entry.movements.reduce((s, m) => s + (m.debit || 0), 0))}</strong></td>
              <td class="text-right text-mono"><strong>${formatCurrency(entry.movements.reduce((s, m) => s + (m.credit || 0), 0))}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

// Elimino un asiento
async function deleteEntryHandler(id) {
  if (confirm(t('entries.confirmDeleteEntry'))) {
    const success = await deleteEntry(id);
    if (success) {
      showToast(t('toast.entryDeleted'), 'success');
      const container = document.getElementById('viewContainer');
      container.innerHTML = renderEntries();
    }
  }
}
