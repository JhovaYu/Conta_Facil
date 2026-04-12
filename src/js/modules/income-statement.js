// Aquí renderizo el Estado de Resultados (Income Statement)
// Sigue la misma estructura visual que el Balance General

function renderIncomeStatement() {
    const entries = getEntries();
    const incomeData = generateIncomeStatement();

    // Si no hay asientos, muestro un estado vacío
    if (entries.length === 0) {
        return `
      <div class="balance">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 class="page-title" data-i18n="incomeStatement.title">${t('incomeStatement.title') || 'Estado de Resultados'}</h1>
            <p class="page-subtitle" data-i18n="incomeStatement.subtitle">${t('incomeStatement.subtitle') || 'Resultados de operación'}</p>
          </div>
        </div>
        <div class="card">
          <div class="empty-state">
            <div class="empty-state__icon"><i data-lucide="trending-up" style="width: 32px; height: 32px;"></i></div>
            <div class="empty-state__title" data-i18n="balance.noData">${t('balance.noData')}</div>
            <div class="empty-state__description" data-i18n="balance.noDataDesc">${t('balance.noDataDesc')}</div>
            <button class="btn btn--primary" onclick="navigateTo('entries')" data-i18n="dashboard.startEntry" style="display:flex; align-items:center; gap:4px">
              <i data-lucide="plus" style="width: 16px; height: 16px;"></i> ${t('dashboard.startEntry')}
            </button>
          </div>
        </div>
      </div>
    `;
    }

    return `
    <div class="balance">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 class="page-title" data-i18n="incomeStatement.title">${t('incomeStatement.title') || 'Estado de Resultados'}</h1>
          <p class="page-subtitle" data-i18n="incomeStatement.subtitle">${t('incomeStatement.subtitle') || 'Resultados de operación'}</p>
        </div>
        <div style="display: flex; gap: var(--space-3);">
          <button class="btn btn--primary" onclick="exportIncomeStatementPDF()" style="display:flex; align-items:center; gap:4px">
            <i data-lucide="file-down" style="width: 16px; height: 16px;"></i> <span data-i18n="balance.exportPdf">${t('balance.exportPdf')}</span>
          </button>
        </div>
      </div>

      <!-- El reporte del Estado de Resultados -->
      <div class="balance__report" id="incomeStatementReport">
        <!-- ENCABEZADO -->
        <div class="balance__header">
          <div class="balance__company-name">${incomeData.header.companyName}</div>
          <div class="balance__report-title">${incomeData.header.reportTitle}</div>
          <div class="balance__report-date">${t('incomeStatement.period') || 'Del'} ${incomeData.header.periodStart} ${t('incomeStatement.to') || 'al'} ${incomeData.header.periodEnd}</div>
        </div>

        <!-- CUERPO -->
        <div class="balance__body">
          <!-- INGRESOS -->
          <div class="balance__section">
            <div class="balance__section-title">${incomeData.body.revenues.title}</div>
            ${incomeData.body.revenues.accounts.map(acc => `
              <div class="balance__line-item">
                <span class="balance__line-item-name">${acc.name}</span>
                <span class="balance__line-item-amount">${formatCurrency(acc.balance)}</span>
              </div>
            `).join('')}
            <div class="balance__subtotal">
              <span>${t('incomeStatement.totalRevenues') || 'Ventas Netas'}</span>
              <span>${formatCurrency(incomeData.totals.totalRevenues || incomeData.body.revenues.total)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- COSTO DE VENTAS -->
          <div class="balance__section">
            <div class="balance__section-title">${incomeData.body.costOfSales.title}</div>
            ${incomeData.body.costOfSales.accounts.map(acc => `
              <div class="balance__line-item">
                <span class="balance__line-item-name">${acc.name}</span>
                <span class="balance__line-item-amount">${formatCurrency(acc.balance)}</span>
              </div>
            `).join('')}
            <div class="balance__subtotal" style="color: var(--color-error);">
              <span>${t('incomeStatement.totalCostOfSales') || 'Total Costo de Ventas'}</span>
              <span>${formatCurrency(incomeData.body.costOfSales.total)}</span>
            </div>
          </div>

          <!-- UTILIDAD / PÉRDIDA BRUTA -->
          <div class="balance__grand-total" style="margin-top: var(--space-4); background-color: var(--color-gray-100); padding: var(--space-2) var(--space-3); border-radius: 4px;">
            <span>${incomeData.totals.grossProfit >= 0 ? (t('incomeStatement.grossProfit') || 'Utilidad Bruta') : 'Pérdida Bruta'}</span>
            <span style="color: ${incomeData.totals.grossProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)'}">${formatCurrency(incomeData.totals.grossProfit)}</span>
          </div>

          <div class="divider"></div>

          <!-- GASTOS DE OPERACIÓN -->
          <div class="balance__section">
            <div class="balance__section-title">${incomeData.body.operatingExpenses.title}</div>
            ${incomeData.body.operatingExpenses.accounts.map(acc => `
              <div class="balance__line-item">
                <span class="balance__line-item-name">${acc.name}</span>
                <span class="balance__line-item-amount">${formatCurrency(acc.balance)}</span>
              </div>
            `).join('')}
            <div class="balance__subtotal" style="color: var(--color-error);">
              <span>${t('incomeStatement.totalOperatingExpenses') || 'Total Gastos de Operación'}</span>
              <span>${formatCurrency(incomeData.body.operatingExpenses.total)}</span>
            </div>
          </div>

          <!-- UTILIDAD / PÉRDIDA DE OPERACIÓN -->
          <div class="balance__grand-total" style="margin-top: var(--space-4); background-color: var(--color-gray-100); padding: var(--space-2) var(--space-3); border-radius: 4px;">
            <span>${incomeData.totals.operatingProfit >= 0 ? (t('incomeStatement.operatingProfit') || 'Utilidad de Operación') : 'Pérdida de Operación'}</span>
            <span style="color: ${incomeData.totals.operatingProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)'}">${formatCurrency(incomeData.totals.operatingProfit)}</span>
          </div>

          <div class="divider"></div>

          <!-- PTU -->
          ${incomeData.body.ptu !== undefined ? `
          <div class="balance__line-item">
            <span class="balance__line-item-name" style="font-weight: 600;">PTU (10%)</span>
            <span class="balance__line-item-amount" style="color: var(--color-error);">${formatCurrency(incomeData.body.ptu)}</span>
          </div>` : ''}

          <!-- ISR -->
          <div class="balance__line-item">
            <span class="balance__line-item-name" style="font-weight: 600;">${t('incomeStatement.incomeTax') || 'ISR (30%)'}</span>
            <span class="balance__line-item-amount" style="color: var(--color-error);">${formatCurrency(incomeData.body.incomeTax)}</span>
          </div>

          <!-- UTILIDAD / PÉRDIDA NETA -->
          <div class="balance__grand-total" style="margin-top: var(--space-4);">
            <span>${incomeData.totals.netProfit >= 0 ? (t('incomeStatement.netProfit') || 'Utilidad Neta del Ejercicio') : 'Pérdida Neta del Ejercicio'}</span>
            <span style="color: ${incomeData.totals.netProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)'}">${formatCurrency(incomeData.totals.netProfit)}</span>
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
