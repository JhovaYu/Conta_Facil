// Aquí genero los reportes financieros, en particular el Balance General
// También preparo los datos para exportarlos a PDF

// Genero el reporte del Balance General / Estado de Situación Financiera
function generateBalanceSheet() {
    const company = getCompany();
    const grouped = groupAccountsByType();

    // Calculo totales por sección
    const totalAssets = grouped.assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = grouped.liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = grouped.equity.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilitiesEquity = totalLiabilities + totalEquity;

    // Verifico la ecuación contable: Activo = Pasivo + Capital
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01;

    return {
        // Encabezado
        header: {
            companyName: company.name || 'Mi Empresa S.A. de C.V.',
            reportTitle: t('balance.reportTitle'),
            date: new Date().toLocaleDateString(getCurrentLanguage() === 'es' ? 'es-MX' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },

        // Cuerpo
        body: {
            assets: {
                title: t('balance.assets'),
                accounts: grouped.assets.map(acc => ({
                    code: acc.code,
                    name: getAccountName(acc),
                    balance: acc.balance
                })),
                total: totalAssets
            },
            liabilities: {
                title: t('balance.liabilities'),
                accounts: grouped.liabilities.map(acc => ({
                    code: acc.code,
                    name: getAccountName(acc),
                    balance: acc.balance
                })),
                total: totalLiabilities
            },
            equity: {
                title: t('balance.equity'),
                accounts: grouped.equity.map(acc => ({
                    code: acc.code,
                    name: getAccountName(acc),
                    balance: acc.balance
                })),
                total: totalEquity
            }
        },

        // Totales y verificación
        totals: {
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalLiabilitiesEquity,
            isBalanced
        },

        // Pie
        footer: {
            preparedBy: t('balance.accountant'),
            reviewedBy: t('balance.manager'),
            authorizedBy: t('balance.director'),
            note: t('balance.currencyNote')
        }
    };
}

// Genero un resumen rápido para el dashboard
function generateDashboardSummary() {
    const grouped = groupAccountsByType();
    const entries = getEntries();

    const totalAssets = grouped.assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = grouped.liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = grouped.equity.reduce((sum, acc) => sum + acc.balance, 0);

    // Obtengo los últimos 5 asientos para la tabla de resumen
    const recentEntries = [...entries]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalEntries: entries.length,
        recentEntries,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    };
}
