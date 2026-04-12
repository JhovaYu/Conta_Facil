// Aquí manejo la vista del Catálogo de Cuentas
// Permito ver, agregar, editar y eliminar cuentas contables

// Renderizo la vista completa del catálogo
function renderCatalog() {
    const accounts = getAccounts();

    const html = `
    <div class="catalog">
      <div class="page-header">
        <h1 class="page-title" data-i18n="catalog.title">${t('catalog.title')}</h1>
        <p class="page-subtitle" data-i18n="catalog.subtitle">${t('catalog.subtitle')}</p>
      </div>

      <!-- Toolbar: filtros + botón agregar -->
      <div class="catalog__toolbar">
        <div class="catalog__filters">
          <button class="catalog__filter-btn active" data-filter="all" onclick="filterCatalog('all')" data-i18n="catalog.all">${t('catalog.all')}</button>
          <button class="catalog__filter-btn" data-filter="asset" onclick="filterCatalog('asset')" data-i18n="catalog.asset">${t('catalog.asset')}</button>
          <button class="catalog__filter-btn" data-filter="liability" onclick="filterCatalog('liability')" data-i18n="catalog.liability">${t('catalog.liability')}</button>
          <button class="catalog__filter-btn" data-filter="equity" onclick="filterCatalog('equity')" data-i18n="catalog.equity">${t('catalog.equity')}</button>
          <button class="catalog__filter-btn" data-filter="revenue" onclick="filterCatalog('revenue')" data-i18n="catalog.revenue">${t('catalog.revenue')}</button>
          <button class="catalog__filter-btn" data-filter="expense" onclick="filterCatalog('expense')" data-i18n="catalog.expense">${t('catalog.expense')}</button>
        </div>
        <button class="btn btn--primary" onclick="showAccountModal()">
          + <span data-i18n="catalog.addAccount">${t('catalog.addAccount')}</span>
        </button>
      </div>

      <!-- Tabla de cuentas -->
      <div class="table-container">
        <table class="table" id="catalogTable">
          <thead>
            <tr>
              <th data-i18n="catalog.code">${t('catalog.code')}</th>
              <th data-i18n="catalog.name">${t('catalog.name')}</th>
              <th data-i18n="catalog.type">${t('catalog.type')}</th>
              <th data-i18n="catalog.nature">${t('catalog.nature')}</th>
              <th class="text-right" data-i18n="catalog.balance">${t('catalog.balance')}</th>
              <th class="text-center" data-i18n="catalog.actions">${t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody id="catalogBody">
            ${renderCatalogRows(accounts, 'all')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para agregar/editar cuenta -->
    <div class="modal-overlay hidden" id="accountModal">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title" id="accountModalTitle">${t('catalog.newAccount')}</h2>
          <button class="modal__close" onclick="closeAccountModal()"><i data-lucide="x" style="width: 24px; height: 24px;"></i></button>
        </div>
        <div class="modal__body">
          <form id="accountForm" onsubmit="saveAccount(event)">
            <input type="hidden" id="accountEditCode" value="">

            <div class="form-group">
              <label class="form-label" data-i18n="catalog.accountCode">${t('catalog.accountCode')}</label>
              <input type="text" class="form-input" id="accountCodeInput" placeholder="1010" required>
            </div>

            <div class="form-group">
              <label class="form-label" data-i18n="catalog.accountName">${t('catalog.accountName')}</label>
              <input type="text" class="form-input" id="accountNameInput" placeholder="Caja" required>
            </div>

            <div class="form-group">
              <label class="form-label" data-i18n="catalog.accountNameEn">${t('catalog.accountNameEn')}</label>
              <input type="text" class="form-input" id="accountNameEnInput" placeholder="Cash">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" data-i18n="catalog.accountType">${t('catalog.accountType')}</label>
                <select class="form-input form-select" id="accountTypeInput" onchange="onAccountTypeChange()" required>
                  <option value="asset" data-i18n="catalog.asset">${t('catalog.asset')}</option>
                  <option value="liability" data-i18n="catalog.liability">${t('catalog.liability')}</option>
                  <option value="equity" data-i18n="catalog.equity">${t('catalog.equity')}</option>
                  <option value="revenue" data-i18n="catalog.revenue">${t('catalog.revenue')}</option>
                  <option value="expense" data-i18n="catalog.expense">${t('catalog.expense')}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" data-i18n="catalog.accountNature">${t('catalog.accountNature')}</label>
                <select class="form-input form-select" id="accountNatureInput" required>
                  <option value="debit" data-i18n="catalog.debit">${t('catalog.debit')}</option>
                  <option value="credit" data-i18n="catalog.credit">${t('catalog.credit')}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" data-i18n="catalog.parentAccount">${t('catalog.parentAccount')}</label>
              <select class="form-input form-select" id="accountParentInput">
                <option value="" data-i18n="catalog.none">${t('catalog.none')}</option>
                ${getAccounts().filter(a => a.isGroup).map(a => `
                  <option value="${a.code}">${a.code} - ${getAccountName(a)}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="accountIsGroupInput">
                <span data-i18n="catalog.isGroup">${t('catalog.isGroup')}</span>
              </label>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" onclick="closeAccountModal()" data-i18n="catalog.cancel">${t('catalog.cancel')}</button>
          <button class="btn btn--primary" onclick="document.getElementById('accountForm').requestSubmit()" data-i18n="catalog.save">${t('catalog.save')}</button>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => { if(window.updateIcons) updateIcons(); }, 0);
    return html;
}

// Renderizo las filas de la tabla del catálogo
function renderCatalogRows(accounts, filter) {
    const filtered = filter === 'all' ? accounts : accounts.filter(a => a.type === filter);

    // Ordeno por código
    const sorted = [...filtered].sort((a, b) => a.code.localeCompare(b.code));

    const rows = sorted.map(account => {
        const balance = account.isGroup ? '' : formatCurrency(calculateAccountBalance(account.code));
        const isGroup = account.isGroup;
        const indent = account.parent ? 'catalog__indent' : '';

        return `
      <tr class="${isGroup ? 'catalog__group-row' : ''}" data-type="${account.type}" data-code="${account.code}">
        <td><span class="catalog__account-code">${account.code}</span></td>
        <td class="${indent}">${getAccountName(account)}</td>
        <td><span class="badge ${getAccountTypeBadgeClass(account.type)}">${getAccountTypeLabel(account.type)}</span></td>
        <td><span class="badge badge--${account.nature}">${getAccountNatureLabel(account.nature)}</span></td>
        <td class="text-right text-mono">${balance}</td>
        <td class="text-center">
          <div class="table__actions">
            <button class="btn btn--ghost btn--sm" onclick="editAccount('${account.code}')" title="${t('catalog.edit')}"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
            <button class="btn btn--ghost btn--sm" onclick="deleteAccountHandler('${account.code}')" title="${t('catalog.delete')}"><i data-lucide="trash-2" style="color:var(--color-error); width: 16px; height: 16px;"></i></button>
          </div>
        </td>
      </tr>
    `;
    }).join('');

    if (window.updateIcons) setTimeout(() => updateIcons(), 0);
    return rows;
}

// Filtro las cuentas por tipo
function filterCatalog(type) {
    // Actualizo los botones de filtro
    document.querySelectorAll('.catalog__filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === type);
    });

    // Re-renderizo las filas
    const tbody = document.getElementById('catalogBody');
    if (tbody) {
        tbody.innerHTML = renderCatalogRows(getAccounts(), type);
    }
}

// Muestro el modal para agregar una cuenta nueva
function showAccountModal(editCode = null) {
    const modal = document.getElementById('accountModal');
    const title = document.getElementById('accountModalTitle');
    const codeInput = document.getElementById('accountCodeInput');
    const nameInput = document.getElementById('accountNameInput');
    const nameEnInput = document.getElementById('accountNameEnInput');
    const typeInput = document.getElementById('accountTypeInput');
    const natureInput = document.getElementById('accountNatureInput');
    const parentInput = document.getElementById('accountParentInput');
    const isGroupInput = document.getElementById('accountIsGroupInput');
    const editCodeInput = document.getElementById('accountEditCode');

    if (editCode) {
        // Modo editar: cargo los datos de la cuenta
        const account = findAccountByCode(editCode);
        if (account) {
            title.textContent = t('catalog.editAccount');
            codeInput.value = account.code;
            codeInput.disabled = true; // No dejo cambiar el código si ya existe
            nameInput.value = account.name;
            nameEnInput.value = account.nameEn || '';
            typeInput.value = account.type;
            natureInput.value = account.nature;
            parentInput.value = account.parent || '';
            isGroupInput.checked = account.isGroup;
            editCodeInput.value = editCode;
        }
    } else {
        // Modo nuevo: limpio el formulario
        title.textContent = t('catalog.newAccount');
        codeInput.value = '';
        codeInput.disabled = false;
        nameInput.value = '';
        nameEnInput.value = '';
        typeInput.value = 'asset';
        natureInput.value = 'debit';
        parentInput.value = '';
        isGroupInput.checked = false;
        editCodeInput.value = '';
    }

    modal.classList.remove('hidden');
}

// Cierro el modal de cuenta
function closeAccountModal() {
    const modal = document.getElementById('accountModal');
    modal.classList.add('hidden');
}

// Cambio automáticamente la naturaleza según el tipo seleccionado
function onAccountTypeChange() {
    const type = document.getElementById('accountTypeInput').value;
    const natureInput = document.getElementById('accountNatureInput');
    natureInput.value = TYPE_NATURE_MAP[type] || 'debit';
}

// Guardo la cuenta (nueva o editada)
async function saveAccount(event) {
    event.preventDefault();

    const editCode = document.getElementById('accountEditCode').value;
    const accountData = {
        code: document.getElementById('accountCodeInput').value.trim(),
        name: document.getElementById('accountNameInput').value.trim(),
        nameEn: document.getElementById('accountNameEnInput').value.trim(),
        type: document.getElementById('accountTypeInput').value,
        nature: document.getElementById('accountNatureInput').value,
        parent: document.getElementById('accountParentInput').value || null,
        isGroup: document.getElementById('accountIsGroupInput').checked
    };

    // Valido campos requeridos
    if (!accountData.code || !accountData.name) {
        showToast(t('toast.requiredFields'), 'error');
        return;
    }

    let success;
    if (editCode) {
        success = await updateAccount(editCode, accountData);
    } else {
        // Verifico que el código no exista ya
        if (findAccountByCode(accountData.code)) {
            showToast('El código de cuenta ya existe', 'error');
            return;
        }
        success = await addAccount(accountData);
    }

    if (success) {
        showToast(t('toast.accountSaved'), 'success');
        closeAccountModal();
        // Re-renderizo la vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = renderCatalog();
    }
}

// Edito una cuenta
function editAccount(code) {
    showAccountModal(code);
}

// Elimino una cuenta
async function deleteAccountHandler(code) {
    if (confirm(t('catalog.confirmDelete'))) {
        const success = await deleteAccount(code);
        if (success) {
            showToast(t('toast.accountDeleted'), 'success');
            // Re-renderizo la tabla
            const container = document.getElementById('viewContainer');
            container.innerHTML = renderCatalog();
        }
    }
}
