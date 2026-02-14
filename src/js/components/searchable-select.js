// Aquí creo un componente de dropdown con búsqueda para seleccionar cuentas
// En lugar de un <select> normal, este permite escribir para filtrar las cuentas

// Contador global para IDs únicos de cada dropdown
let searchableSelectCounter = 0;

// Creo un dropdown con búsqueda que reemplaza al select nativo
function createSearchableSelect(name, accounts, selectedCode, onChangeCallback) {
    const id = `ss_${searchableSelectCounter++}`;

    // Busco la cuenta seleccionada para mostrar su nombre
    const selectedAccount = accounts.find(acc => acc.code === selectedCode);
    const displayText = selectedAccount
        ? `${selectedAccount.code} - ${getAccountName(selectedAccount)}`
        : '';

    return `
    <div class="searchable-select" id="${id}" data-name="${name}" data-value="${selectedCode || ''}">
      <input type="text"
        class="searchable-select__input form-input"
        placeholder="${t('entries.selectAccount')}"
        value="${displayText}"
        autocomplete="off"
        onfocus="openSearchableDropdown('${id}')"
        oninput="filterSearchableDropdown('${id}', this.value)">
      <div class="searchable-select__arrow">▾</div>
      <div class="searchable-select__dropdown hidden" id="${id}_dropdown">
        ${renderSearchableOptions(id, accounts, selectedCode)}
      </div>
    </div>
  `;
}

// Renderizo las opciones del dropdown
function renderSearchableOptions(id, accounts, selectedCode) {
    if (!accounts || accounts.length === 0) {
        return `<div class="searchable-select__empty">${t('catalog.none')}</div>`;
    }

    return accounts.map(acc => `
    <div class="searchable-select__option ${acc.code === selectedCode ? 'selected' : ''}"
      data-code="${acc.code}"
      data-label="${acc.code} - ${acc.name} ${acc.nameEn || ''}"
      onclick="selectSearchableOption('${id}', '${acc.code}')">
      <span class="searchable-select__option-code">${acc.code}</span>
      <span class="searchable-select__option-name">${getAccountName(acc)}</span>
      <span class="badge badge--${acc.type}" style="font-size: 10px; padding: 2px 6px;">${getAccountTypeLabel(acc.type)}</span>
    </div>
  `).join('');
}

// Abro el dropdown y muestro todas las opciones
function openSearchableDropdown(id) {
    const container = document.getElementById(id);
    const dropdown = document.getElementById(`${id}_dropdown`);
    const input = container.querySelector('.searchable-select__input');

    if (!dropdown || !input) return;

    // Selecciono todo el texto para que pueda escribir desde cero
    input.select();

    // Muestro el dropdown
    dropdown.classList.remove('hidden');

    // Reseteo el filtro para mostrar todas las opciones
    const options = dropdown.querySelectorAll('.searchable-select__option');
    options.forEach(opt => opt.style.display = '');

    // Me aseguro de que se cierre al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            if (!container.contains(e.target)) {
                dropdown.classList.add('hidden');
                // Restauro el texto si no se seleccionó nada
                const currentValue = container.getAttribute('data-value');
                if (currentValue) {
                    const acc = getLeafAccounts().find(a => a.code === currentValue);
                    if (acc) input.value = `${acc.code} - ${getAccountName(acc)}`;
                } else {
                    input.value = '';
                }
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 10);
}

// Filtro las opciones del dropdown según lo que escribe el usuario
function filterSearchableDropdown(id, query) {
    const dropdown = document.getElementById(`${id}_dropdown`);
    if (!dropdown) return;

    // Muestro el dropdown por si estaba oculto
    dropdown.classList.remove('hidden');

    const normalizedQuery = query.toLowerCase().trim();
    const options = dropdown.querySelectorAll('.searchable-select__option');
    let hasVisible = false;

    options.forEach(opt => {
        const label = opt.getAttribute('data-label').toLowerCase();
        const code = opt.getAttribute('data-code').toLowerCase();

        // Busco por código o por nombre (ambos idiomas)
        const matches = label.includes(normalizedQuery) || code.includes(normalizedQuery);
        opt.style.display = matches ? '' : 'none';
        if (matches) hasVisible = true;
    });

    // Si no hay resultados, muestro un mensaje
    let emptyMsg = dropdown.querySelector('.searchable-select__empty');
    if (!hasVisible) {
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'searchable-select__empty';
            emptyMsg.textContent = getCurrentLanguage() === 'es' ? 'Sin resultados' : 'No results';
            dropdown.appendChild(emptyMsg);
        }
        emptyMsg.style.display = '';
    } else if (emptyMsg) {
        emptyMsg.style.display = 'none';
    }
}

// Selecciono una opción del dropdown
function selectSearchableOption(id, code) {
    const container = document.getElementById(id);
    const dropdown = document.getElementById(`${id}_dropdown`);
    const input = container.querySelector('.searchable-select__input');

    if (!container || !input) return;

    // Guardo el valor seleccionado
    container.setAttribute('data-value', code);

    // Muestro el texto de la cuenta seleccionada
    const acc = getLeafAccounts().find(a => a.code === code);
    if (acc) {
        input.value = `${acc.code} - ${getAccountName(acc)}`;
    }

    // Cierro el dropdown
    if (dropdown) dropdown.classList.add('hidden');

    // Marco la opción como seleccionada
    const options = dropdown.querySelectorAll('.searchable-select__option');
    options.forEach(opt => opt.classList.toggle('selected', opt.getAttribute('data-code') === code));

    // Llamo a updateVerification para refrescar los totales
    updateVerification();
}

// Obtengo el valor seleccionado de un searchable select
function getSearchableSelectValue(id) {
    const container = document.getElementById(id);
    return container ? container.getAttribute('data-value') : '';
}
