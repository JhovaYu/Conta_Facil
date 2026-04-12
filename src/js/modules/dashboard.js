// Aquí renderizo el Dashboard, la vista principal de la app
// Muestro las stat cards con resúmenes, una gráfica y los accesos rápidos

// Renderizo la vista completa del dashboard
function renderDashboard() {
    const entries = getEntries();
    if (!entries || entries.length === 0) {
        setTimeout(() => updateIcons(), 0);
        return `
        <div class="dashboard">
          <div class="empty-state" style="margin-top: 10vh;">
            <div class="empty-state__icon"><i data-lucide="bar-chart-2" style="width: 32px; height: 32px;"></i></div>
            <div class="empty-state__title" data-i18n="dashboard.noDataTitle">No hay asientos registrados</div>
            <div class="empty-state__description" data-i18n="dashboard.noDataDesc">Crea tu primer asiento para comenzar.</div>
            <button class="btn btn--primary" onclick="navigateTo('entries')" style="display:flex; align-items:center; gap:4px">
              <i data-lucide="plus" style="width: 16px; height: 16px;"></i> <span data-i18n="dashboard.startEntry">Registrar Asiento</span>
            </button>
          </div>
        </div>
        `;
    }

    const summary = generateDashboardSummary();

    const html = `
    <div class="dashboard">
      <!-- Encabezado de bienvenida -->
      <div class="dashboard__welcome">
        <h1 class="dashboard__welcome-title" data-i18n="dashboard.welcome">${t('dashboard.welcome')}</h1>
        <p class="dashboard__welcome-subtitle" data-i18n="dashboard.welcomeSubtitle">${t('dashboard.welcomeSubtitle')}</p>
      </div>

      <!-- Cards estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label" data-i18n="dashboard.totalAssets">${t('dashboard.totalAssets')}</div>
          <div class="stat-card__value">${formatCurrency(summary.totalAssets)}</div>
          <div class="stat-card__indicator stat-card__indicator--${summary.totalAssets > 0 ? 'up' : 'neutral'}">
            <span>${summary.totalAssets > 0 ? '▲' : '—'}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__label" data-i18n="dashboard.totalLiabilities">${t('dashboard.totalLiabilities')}</div>
          <div class="stat-card__value">${formatCurrency(summary.totalLiabilities)}</div>
          <div class="stat-card__indicator stat-card__indicator--${summary.totalLiabilities > 0 ? 'down' : 'neutral'}">
            <span>${summary.totalLiabilities > 0 ? '▼' : '—'}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__label" data-i18n="dashboard.totalEquity">${t('dashboard.totalEquity')}</div>
          <div class="stat-card__value">${formatCurrency(summary.totalEquity)}</div>
          <div class="stat-card__indicator">
              <span style="color: ${summary.isBalanced ? 'var(--color-success)' : 'var(--color-error)'}; display:flex; align-items:center;">
                ${summary.isBalanced ? '<i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>' : '<i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>'}
              </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__label" data-i18n="dashboard.totalEntries">${t('dashboard.totalEntries')}</div>
          <div class="stat-card__value">${summary.totalEntries}</div>
          <div class="stat-card__indicator stat-card__indicator--neutral">
            <span>${summary.totalEntries} ${t('dashboard.entries')}</span>
          </div>
        </div>
      </div>

      <!-- Contenido en 2 columnas -->
      <div class="content-grid content-grid--wide-left">
        <!-- Columna izquierda: Gráfica + Últimos asientos -->
        <div>
          <!-- Gráfica -->
          <div class="card" style="margin-bottom: var(--space-5);">
            <div class="card__header">
              <h3 class="card__title" data-i18n="dashboard.chartTitle">${t('dashboard.chartTitle')}</h3>
            </div>
            <div class="dashboard__chart-container">
              <canvas id="dashboardChart"></canvas>
            </div>
          </div>

          <!-- Últimos asientos -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title" data-i18n="dashboard.recentEntries">${t('dashboard.recentEntries')}</h3>
            </div>
            ${renderRecentEntriesList(summary.recentEntries)}
          </div>
        </div>

        <!-- Columna derecha: Accesos rápidos -->
        <div>
          <div class="card">
            <div class="card__header">
              <h3 class="card__title" data-i18n="dashboard.quickActions">${t('dashboard.quickActions')}</h3>
            </div>
            <div class="dashboard__quick-actions">
              ${renderQuickActions()}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => updateIcons(), 0);
    return html;
}

// Renderizo la lista de últimos asientos del dashboard
function renderRecentEntriesList(entries) {
    if (!entries || entries.length === 0) {
        return `
      <div class="empty-state">
        <div class="empty-state__icon"><i data-lucide="file-text" style="width: 32px; height: 32px;"></i></div>
        <div class="empty-state__title" data-i18n="dashboard.noEntries">${t('dashboard.noEntries')}</div>
        <div class="empty-state__description" data-i18n="dashboard.noEntriesDesc">${t('dashboard.noEntriesDesc')}</div>
        <button class="btn btn--primary" onclick="navigateTo('entries')" data-i18n="dashboard.startEntry" style="display:flex; align-items:center; gap:4px">
          <i data-lucide="plus" style="width: 16px; height: 16px;"></i> ${t('dashboard.startEntry')}
        </button>
      </div>
    `;
    }

    return entries.map(entry => {
        const totalDebit = entry.movements.reduce((sum, m) => sum + (m.debit || 0), 0);
        return `
      <div class="entries__history-item" onclick="navigateTo('entries')">
        <div class="entries__history-number">${entry.id}</div>
        <div class="entries__history-info">
          <div class="entries__history-desc">${entry.description}</div>
          <div class="entries__history-date">${formatDate(entry.date)}</div>
        </div>
        <div class="entries__history-amount">${formatCurrency(totalDebit)}</div>
      </div>
    `;
    }).join('');
}

// Renderizo los accesos rápidos (quick actions)
function renderQuickActions() {
    const types = getEntryTypesList().slice(0, 7); // Solo los 7 tipos obligatorios

    return types.map(type => `
    <div class="quick-action" onclick="navigateToEntry('${type.type}')">
      <div class="quick-action__icon"><i data-lucide="${type.icon}" style="width: 24px; height: 24px;"></i></div>
      <div class="quick-action__text">
        <div class="quick-action__title" data-i18n="${type.nameKey}">${t(type.nameKey)}</div>
        <div class="quick-action__desc" data-i18n="${type.descKey}">${t(type.descKey)}</div>
      </div>
      <div class="quick-action__arrow">→</div>
    </div>
  `).join('');
}

// Formato de fecha legible
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(getCurrentLanguage() === 'es' ? 'es-MX' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Inicializo la gráfica del dashboard con Chart.js
function initDashboardChart(summary) {
    const canvas = document.getElementById('dashboardChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Si ya hay una gráfica, la destruyo primero
    if (window.dashboardChartInstance) {
        window.dashboardChartInstance.destroy();
    }

    window.dashboardChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [t('dashboard.totalAssets'), t('dashboard.totalLiabilities'), t('dashboard.totalEquity')],
            datasets: [{
                label: t('dashboard.chartTitle'),
                data: [summary.totalAssets, summary.totalLiabilities, summary.totalEquity],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(34, 197, 94, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: '500'
                        },
                        color: '#6b7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.04)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        color: '#9ca3af',
                        callback: function (value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Función para navegar a un tipo específico de asiento desde el dashboard
function navigateToEntry(type) {
    navigateTo('entries');
    // Le doy un pequeño delay para que la vista cargue primero
    setTimeout(() => {
        if (typeof showEntryForm === 'function') {
            showEntryForm(type);
        }
    }, 100);
}
