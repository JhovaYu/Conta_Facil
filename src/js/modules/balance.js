// Aquí renderizo el Balance General / Estado de Situación Financiera
// Es la vista más importante para la rúbrica: encabezado, cuerpo y pie

// Renderizo la vista completa del balance
function renderBalance() {
    const entries = getEntries();
    const balanceData = generateBalanceSheet();

    // Si no hay asientos, muestro un estado vacío
    if (entries.length === 0) {
        return `
      <div class="balance">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 class="page-title" data-i18n="balance.title">${t('balance.title')}</h1>
            <p class="page-subtitle" data-i18n="balance.subtitle">${t('balance.subtitle')}</p>
          </div>
        </div>
        <div class="card">
          <div class="empty-state">
            <div class="empty-state__icon">📊</div>
            <div class="empty-state__title" data-i18n="balance.noData">${t('balance.noData')}</div>
            <div class="empty-state__description" data-i18n="balance.noDataDesc">${t('balance.noDataDesc')}</div>
            <button class="btn btn--primary" onclick="navigateTo('entries')" data-i18n="dashboard.startEntry">${t('dashboard.startEntry')}</button>
          </div>
        </div>
      </div>
    `;
    }

    return `
    <div class="balance">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 class="page-title" data-i18n="balance.title">${t('balance.title')}</h1>
          <p class="page-subtitle" data-i18n="balance.subtitle">${t('balance.subtitle')}</p>
        </div>
        <div style="display: flex; gap: var(--space-3);">
          <button class="btn btn--primary" onclick="exportBalancePDF()">
            📄 <span data-i18n="balance.exportPdf">${t('balance.exportPdf')}</span>
          </button>
        </div>
      </div>

      <!-- El reporte del Balance General -->
      <div class="balance__report" id="balanceReport">
        <!-- ENCABEZADO -->
        <div class="balance__header">
          <div class="balance__company-name">${balanceData.header.companyName}</div>
          <div class="balance__report-title">${balanceData.header.reportTitle}</div>
          <div class="balance__report-date">${t('balance.asOf')} ${balanceData.header.date}</div>
        </div>

        <!-- CUERPO -->
        <div class="balance__body">
          <!-- ACTIVO -->
          <div class="balance__section">
            <div class="balance__section-title">${balanceData.body.assets.title}</div>
            ${balanceData.body.assets.accounts.map(acc => `
              <div class="balance__line-item">
                <span class="balance__line-item-name">${acc.name}</span>
                <span class="balance__line-item-amount">${formatCurrency(acc.balance)}</span>
              </div>
            `).join('')}
            <div class="balance__subtotal">
              <span>${t('balance.totalAssets')}</span>
              <span>${formatCurrency(balanceData.totals.totalAssets)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- PASIVO -->
          <div class="balance__section">
            <div class="balance__section-title">${balanceData.body.liabilities.title}</div>
            ${balanceData.body.liabilities.accounts.map(acc => `
              <div class="balance__line-item">
                <span class="balance__line-item-name">${acc.name}</span>
                <span class="balance__line-item-amount">${formatCurrency(acc.balance)}</span>
              </div>
            `).join('')}
            <div class="balance__subtotal">
              <span>${t('balance.totalLiabilities')}</span>
              <span>${formatCurrency(balanceData.totals.totalLiabilities)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- CAPITAL CONTABLE -->
          <div class="balance__section">
            <div class="balance__section-title">${balanceData.body.equity.title}</div>
            ${balanceData.body.equity.accounts.map(acc => `
              <div class="balance__line-item">
                <span class="balance__line-item-name">${acc.name}</span>
                <span class="balance__line-item-amount">${formatCurrency(acc.balance)}</span>
              </div>
            `).join('')}
            <div class="balance__subtotal">
              <span>${t('balance.totalEquity')}</span>
              <span>${formatCurrency(balanceData.totals.totalEquity)}</span>
            </div>
          </div>

          <!-- TOTAL PASIVO + CAPITAL -->
          <div class="balance__grand-total">
            <span>${t('balance.totalLiabilitiesEquity')}</span>
            <span>${formatCurrency(balanceData.totals.totalLiabilitiesEquity)}</span>
          </div>

          <!-- Ecuación contable -->
          <div class="balance__equation balance__equation--${balanceData.totals.isBalanced ? 'valid' : 'invalid'}">
            <span class="balance__equation-text">
              ${balanceData.totals.isBalanced ? t('balance.equationValid') : t('balance.equationInvalid')}
            </span>
          </div>
        </div>

        <!-- PIE -->
        <div class="balance__footer">
          <div class="balance__signature">
            <div class="balance__signature-line"></div>
            <div class="balance__signature-title" data-i18n="balance.preparedBy">${t('balance.preparedBy')}</div>
            <div class="balance__signature-role" data-i18n="balance.accountant">${t('balance.accountant')}</div>
          </div>
          <div class="balance__signature">
            <div class="balance__signature-line"></div>
            <div class="balance__signature-title" data-i18n="balance.reviewedBy">${t('balance.reviewedBy')}</div>
            <div class="balance__signature-role" data-i18n="balance.manager">${t('balance.manager')}</div>
          </div>
          <div class="balance__signature">
            <div class="balance__signature-line"></div>
            <div class="balance__signature-title" data-i18n="balance.authorizedBy">${t('balance.authorizedBy')}</div>
            <div class="balance__signature-role" data-i18n="balance.director">${t('balance.director')}</div>
          </div>
        </div>

        <div class="balance__note" data-i18n="balance.currencyNote">${t('balance.currencyNote')}</div>
      </div>
    </div>
  `;
}
