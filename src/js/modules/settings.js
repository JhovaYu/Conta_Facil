// Aquí manejo la vista de configuración / perfil de la empresa
// El usuario puede personalizar: datos de empresa, firmas del balance, formato del PDF, y macros

// Renderizo la vista completa de configuración
function renderSettings() {
    const data = getAppData();
    const company = data.company || {};
    const pdfSettings = data.pdfSettings || getDefaultPdfSettings();

    return `
    <div class="settings">
      <div class="page-header">
        <h1 class="page-title" data-i18n="settings.title">${t('settings.title')}</h1>
        <p class="page-subtitle" data-i18n="settings.subtitle">${t('settings.subtitle')}</p>
      </div>

      <!-- Tabs de configuración -->
      <div class="tabs" id="settingsTabs">
        <button class="tab active" data-tab="company" onclick="switchSettingsTab('company')" data-i18n="settings.companyTab">${t('settings.companyTab')}</button>
        <button class="tab" data-tab="pdf" onclick="switchSettingsTab('pdf')" data-i18n="settings.pdfTab">${t('settings.pdfTab')}</button>
        <button class="tab" data-tab="macros" onclick="switchSettingsTab('macros')" data-i18n="settings.macrosTab">${t('settings.macrosTab')}</button>
      </div>

      <!-- Contenido de los tabs -->
      <div id="settingsContent">
        ${renderCompanyTab(company, pdfSettings)}
      </div>
    </div>
  `;
}

// === TAB: EMPRESA ===
function renderCompanyTab(company, pdfSettings) {
    return `
    <div class="card" style="margin-top: var(--space-4);">
      <div class="card__header">
        <h3 class="card__title" data-i18n="settings.companyInfo">${t('settings.companyInfo')}</h3>
      </div>
      <form id="companyForm" onsubmit="saveCompanySettings(event)">
        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label" data-i18n="settings.companyName">${t('settings.companyName')}</label>
            <input type="text" class="form-input" id="companyName"
              value="${company.name || ''}"
              placeholder="${t('settings.companyNamePlaceholder')}">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="settings.rfc">${t('settings.rfc')}</label>
            <input type="text" class="form-input" id="companyRfc"
              value="${company.rfc || ''}"
              placeholder="XAXX010101000">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label" data-i18n="settings.address">${t('settings.address')}</label>
            <input type="text" class="form-input" id="companyAddress"
              value="${company.address || ''}"
              placeholder="${t('settings.addressPlaceholder')}">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="settings.phone">${t('settings.phone')}</label>
            <input type="text" class="form-input" id="companyPhone"
              value="${company.phone || ''}"
              placeholder="+52 (###) ###-####">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" data-i18n="settings.email">${t('settings.email')}</label>
            <input type="email" class="form-input" id="companyEmail"
              value="${company.email || ''}"
              placeholder="contacto@empresa.com">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="settings.fiscalYear">${t('settings.fiscalYear')}</label>
            <input type="text" class="form-input" id="companyFiscalYear"
              value="${company.fiscalYear || new Date().getFullYear()}"
              placeholder="2026">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="settings.currency">${t('settings.currency')}</label>
            <select class="form-input form-select" id="companyCurrency">
              <option value="MXN" ${(company.currency || 'MXN') === 'MXN' ? 'selected' : ''}>MXN - Peso Mexicano</option>
              <option value="USD" ${company.currency === 'USD' ? 'selected' : ''}>USD - US Dollar</option>
              <option value="EUR" ${company.currency === 'EUR' ? 'selected' : ''}>EUR - Euro</option>
            </select>
          </div>
        </div>

        <!-- Firmas del Balance -->
        <div style="margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--color-gray-200);">
          <h4 style="margin-bottom: var(--space-3); color: var(--color-gray-700);" data-i18n="settings.signatures">${t('settings.signatures')}</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" data-i18n="settings.preparedByName">${t('settings.preparedByName')}</label>
              <input type="text" class="form-input" id="sigPreparedName"
                value="${company.sigPreparedName || ''}"
                placeholder="${t('balance.accountant')}">
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="settings.reviewedByName">${t('settings.reviewedByName')}</label>
              <input type="text" class="form-input" id="sigReviewedName"
                value="${company.sigReviewedName || ''}"
                placeholder="${t('balance.manager')}">
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="settings.authorizedByName">${t('settings.authorizedByName')}</label>
              <input type="text" class="form-input" id="sigAuthorizedName"
                value="${company.sigAuthorizedName || ''}"
                placeholder="${t('balance.director')}">
            </div>
          </div>
        </div>

        <!-- Zona de Peligro -->
        <div style="margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--color-gray-200);">
          <h4 style="margin-bottom: var(--space-3); color: var(--color-error);" data-i18n="settings.dangerZone">${t('settings.dangerZone')}</h4>
          <div class="form-row" style="align-items: center; justify-content: space-between; background-color: #fff0f0; padding: var(--space-3); border-radius: 4px; border: 1px solid #ffdcdc;">
            <div>
              <div style="font-weight: 600; color: var(--color-error);" data-i18n="settings.resetCatalog">${t('settings.resetCatalog')}</div>
              <div style="font-size: 0.875rem; color: #666;" data-i18n="settings.resetCatalogDesc">${t('settings.resetCatalogDesc')}</div>
            </div>
            <button type="button" class="btn btn--danger" onclick="resetCatalogToDefault()" data-i18n="settings.resetCatalog">${t('settings.resetCatalog')}</button>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
          <button type="submit" class="btn btn--primary" data-i18n="general.save">${t('general.save')}</button>
        </div>
      </form>
    </div>
  `;
}

// === TAB: PDF ===
function renderPdfTab() {
    const data = getAppData();
    const pdfSettings = data.pdfSettings || getDefaultPdfSettings();

    return `
    <div class="card" style="margin-top: var(--space-4);">
      <div class="card__header">
        <h3 class="card__title" data-i18n="settings.pdfCustomization">${t('settings.pdfCustomization')}</h3>
      </div>
      <form id="pdfForm" onsubmit="savePdfSettings(event)">
        <p style="color: var(--color-gray-500); margin-bottom: var(--space-4); font-size: 0.875rem;" data-i18n="settings.pdfDesc">${t('settings.pdfDesc')}</p>

        <!-- Elementos del encabezado -->
        <div class="settings__section">
          <h4 class="settings__section-title" data-i18n="settings.pdfHeader">${t('settings.pdfHeader')}</h4>
          <div class="settings__toggle-list">
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowCompany" ${pdfSettings.showCompanyName ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowCompany">${t('settings.pdfShowCompany')}</span>
            </label>
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowRfc" ${pdfSettings.showRfc ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowRfc">${t('settings.pdfShowRfc')}</span>
            </label>
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowAddress" ${pdfSettings.showAddress ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowAddress">${t('settings.pdfShowAddress')}</span>
            </label>
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowDate" ${pdfSettings.showDate ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowDate">${t('settings.pdfShowDate')}</span>
            </label>
          </div>
        </div>

        <!-- Elementos del cuerpo -->
        <div class="settings__section">
          <h4 class="settings__section-title" data-i18n="settings.pdfBody">${t('settings.pdfBody')}</h4>
          <div class="settings__toggle-list">
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowAccountCodes" ${pdfSettings.showAccountCodes ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowCodes">${t('settings.pdfShowCodes')}</span>
            </label>
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowEquation" ${pdfSettings.showEquation ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowEquation">${t('settings.pdfShowEquation')}</span>
            </label>
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowZeroBalances" ${pdfSettings.showZeroBalances ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowZero">${t('settings.pdfShowZero')}</span>
            </label>
          </div>
        </div>

        <!-- Elementos del pie -->
        <div class="settings__section">
          <h4 class="settings__section-title" data-i18n="settings.pdfFooter">${t('settings.pdfFooter')}</h4>
          <div class="settings__toggle-list">
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowSignatures" ${pdfSettings.showSignatures ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowSignatures">${t('settings.pdfShowSignatures')}</span>
            </label>
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowCurrencyNote" ${pdfSettings.showCurrencyNote ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowNote">${t('settings.pdfShowNote')}</span>
            </label>
            <label class="settings__toggle-item">
              <input type="checkbox" id="pdfShowPageNumbers" ${pdfSettings.showPageNumbers ? 'checked' : ''}>
              <span data-i18n="settings.pdfShowPages">${t('settings.pdfShowPages')}</span>
            </label>
          </div>
        </div>

        <!-- Formato -->
        <div class="settings__section">
          <h4 class="settings__section-title" data-i18n="settings.pdfFormat">${t('settings.pdfFormat')}</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" data-i18n="settings.pdfOrientation">${t('settings.pdfOrientation')}</label>
              <select class="form-input form-select" id="pdfOrientation">
                <option value="portrait" ${pdfSettings.orientation === 'portrait' ? 'selected' : ''}>${t('settings.portrait')}</option>
                <option value="landscape" ${pdfSettings.orientation === 'landscape' ? 'selected' : ''}>${t('settings.landscape')}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="settings.pdfPageSize">${t('settings.pdfPageSize')}</label>
              <select class="form-input form-select" id="pdfPageSize">
                <option value="letter" ${pdfSettings.pageSize === 'letter' ? 'selected' : ''}>Carta (Letter)</option>
                <option value="a4" ${pdfSettings.pageSize === 'a4' ? 'selected' : ''}>A4</option>
                <option value="legal" ${pdfSettings.pageSize === 'legal' ? 'selected' : ''}>Oficio (Legal)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="settings.pdfFontSize">${t('settings.pdfFontSize')}</label>
              <select class="form-input form-select" id="pdfFontSize">
                <option value="small" ${pdfSettings.fontSize === 'small' ? 'selected' : ''}>${t('settings.small')}</option>
                <option value="medium" ${pdfSettings.fontSize === 'medium' ? 'selected' : ''}>${t('settings.medium')}</option>
                <option value="large" ${pdfSettings.fontSize === 'large' ? 'selected' : ''}>${t('settings.large')}</option>
              </select>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
          <button type="button" class="btn btn--secondary" onclick="resetPdfSettings()" data-i18n="settings.resetDefaults">${t('settings.resetDefaults')}</button>
          <button type="submit" class="btn btn--primary" data-i18n="general.save">${t('general.save')}</button>
        </div>
      </form>
    </div>
  `;
}

// === TAB: MACROS ===
function renderMacrosTab() {
    const commands = getCommandList();

    return `
    <div class="card" style="margin-top: var(--space-4);">
      <div class="card__header">
        <h3 class="card__title" data-i18n="settings.macrosTitle">${t('settings.macrosTitle')}</h3>
      </div>
      <p style="color: var(--color-gray-500); margin-bottom: var(--space-4); font-size: 0.875rem; padding: 0 var(--space-4);" data-i18n="settings.macrosDesc">${t('settings.macrosDesc')}</p>

      <!-- Botón para abrir el command palette -->
      <div style="padding: 0 var(--space-4) var(--space-4);">
        <button class="btn btn--primary" onclick="openCommandPalette()">
          ⌨️ <span data-i18n="settings.openPalette">${t('settings.openPalette')}</span>
          <kbd style="margin-left: 8px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-size: 11px;">Ctrl+K</kbd>
        </button>
      </div>

      <!-- Lista de macros disponibles -->
      <div class="settings__macros-list">
        ${commands.map(cmd => `
          <div class="settings__macro-item" onclick="executeCommand('${cmd.id}')">
            <span class="settings__macro-icon">${cmd.icon}</span>
            <span class="settings__macro-name">${t(cmd.nameKey)}</span>
            <span class="settings__macro-action">→</span>
          </div>
        `).join('')}
      </div>

      <!-- Atajos de teclado -->
      <div style="margin-top: var(--space-5); padding: var(--space-4); border-top: 1px solid var(--color-gray-200);">
        <h4 style="margin-bottom: var(--space-3); color: var(--color-gray-700);" data-i18n="settings.keyboardShortcuts">${t('settings.keyboardShortcuts')}</h4>
        <div class="settings__shortcuts-grid">
          <div class="settings__shortcut">
            <kbd>Ctrl + K</kbd>
            <span data-i18n="settings.shortcutPalette">${t('settings.shortcutPalette')}</span>
          </div>
          <div class="settings__shortcut">
            <kbd>↑ ↓</kbd>
            <span data-i18n="settings.shortcutNav">${t('settings.shortcutNav')}</span>
          </div>
          <div class="settings__shortcut">
            <kbd>Enter</kbd>
            <span data-i18n="settings.shortcutExecute">${t('settings.shortcutExecute')}</span>
          </div>
          <div class="settings__shortcut">
            <kbd>Esc</kbd>
            <span data-i18n="settings.shortcutClose">${t('settings.shortcutClose')}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Alterno entre tabs de configuración
function switchSettingsTab(tab) {
    // Actualizo los botones
    document.querySelectorAll('#settingsTabs .tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    // Renderizo el contenido del tab
    const content = document.getElementById('settingsContent');
    const data = getAppData();
    const company = data.company || {};
    const pdfSettings = data.pdfSettings || getDefaultPdfSettings();

    switch (tab) {
        case 'company':
            content.innerHTML = renderCompanyTab(company, pdfSettings);
            break;
        case 'pdf':
            content.innerHTML = renderPdfTab();
            break;
        case 'macros':
            content.innerHTML = renderMacrosTab();
            break;
    }

    if (window.updateIcons) updateIcons();
}

// Configuración por defecto del PDF
function getDefaultPdfSettings() {
    return {
        showCompanyName: true, showRfc: true, showAddress: true, showDate: true,
        showAccountCodes: false, showEquation: true, showZeroBalances: false,
        showSignatures: true, showCurrencyNote: true, showPageNumbers: true,
        orientation: 'portrait', pageSize: 'letter', fontSize: 'medium'
    };
}

// Guardo la configuración de la empresa
async function saveCompanySettings(event) {
    event.preventDefault();

    const company = {
        name: document.getElementById('companyName').value.trim(),
        rfc: document.getElementById('companyRfc').value.trim(),
        address: document.getElementById('companyAddress').value.trim(),
        phone: document.getElementById('companyPhone').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        fiscalYear: document.getElementById('companyFiscalYear').value.trim(),
        currency: document.getElementById('companyCurrency').value,
        sigPreparedName: document.getElementById('sigPreparedName').value.trim(),
        sigReviewedName: document.getElementById('sigReviewedName').value.trim(),
        sigAuthorizedName: document.getElementById('sigAuthorizedName').value.trim()
    };

    await updateCompanyInfo(company);
    showToast(t('toast.dataSaved'), 'success');
}

// Restablecer catálogo de cuentas al valor por defecto
async function resetCatalogToDefault() {
    if (confirm(t('settings.confirmResetCatalog') || '¿Estás seguro de restablecer el catálogo? Se perderán las cuentas creadas manualmente.')) {
        try {
            // Leer el catálogo por defecto
            const defaultCatalog = await window.api.readDefaultCatalog();
            
            // Reemplazar las cuentas en memoria
            const appData = getAppData();
            appData.accounts = defaultCatalog;
            
            // Guardar al disco indirectamente actualizando el appData "hacky"
            // store.js expone updateAppData('accounts', appData.accounts), pero updateAppData no es pública.
            // Para forzar guardar los datos cambiados, podemos usar window.api.writeData(appData) directamente,
            // pero store.js internamente usa saveDataAppData. Como workaround llamamos a updateCompany() pero realmente hemos modificado la memoria compartida.
            
            await window.api.writeData(appData);
            
            showToast(t('toast.dataSaved'), 'success');
        } catch (error) {
            console.error('Error al restablecer catálogo:', error);
            showToast(t('general.error') + ': ' + error.message, 'error');
        }
    }
}

// Guardo la configuración del PDF
async function savePdfSettings(event) {
    event.preventDefault();

    const pdfSettings = {
        showCompanyName: document.getElementById('pdfShowCompany').checked,
        showRfc: document.getElementById('pdfShowRfc').checked,
        showAddress: document.getElementById('pdfShowAddress').checked,
        showDate: document.getElementById('pdfShowDate').checked,
        showAccountCodes: document.getElementById('pdfShowAccountCodes').checked,
        showEquation: document.getElementById('pdfShowEquation').checked,
        showZeroBalances: document.getElementById('pdfShowZeroBalances').checked,
        showSignatures: document.getElementById('pdfShowSignatures').checked,
        showCurrencyNote: document.getElementById('pdfShowCurrencyNote').checked,
        showPageNumbers: document.getElementById('pdfShowPageNumbers').checked,
        orientation: document.getElementById('pdfOrientation').value,
        pageSize: document.getElementById('pdfPageSize').value,
        fontSize: document.getElementById('pdfFontSize').value
    };

    await updatePdfSettings(pdfSettings);
    showToast(t('toast.dataSaved'), 'success');
}

// Reseteo la configuración del PDF a los valores por defecto
async function resetPdfSettings() {
    await updatePdfSettings(getDefaultPdfSettings());
    switchSettingsTab('pdf');
    showToast(t('toast.dataSaved'), 'success');
}
