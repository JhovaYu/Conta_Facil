// Aquí genero los reportes financieros, en particular el Balance General
// También preparo los datos para exportarlos a PDF

// Genero el reporte del Balance General / Estado de Situación Financiera
function generateBalanceSheet() {
    const company = getCompany();
    const grouped = groupAccountsByType();

    // Calculamos el Estado de Resultados para inyectar la Utilidad/Pérdida en el Capital
    const incomeData = generateIncomeStatement();
    const netProfit = incomeData.totals.netProfit;

    // Buscamos o agregamos la cuenta 3300 (Utilidad/Pérdida del ejercicio)
    let account3300 = grouped.equity.find(acc => acc.code === '3300');
    if (!account3300) {
        account3300 = { code: '3300', balance: 0 };
        grouped.equity.push(account3300);
    }
    // Asignamos el resultado del ejercicio a su balance (Naturaleza Acreedora)
    account3300.balance = netProfit;
    account3300.isDynamicName = true;
    account3300.dynamicName = netProfit >= 0 ? "Utilidad del ejercicio" : "Pérdida del ejercicio";

    // Si hay PTU por pagar, lo inyectamos en Pasivo (cuenta 2040) o lo agregamos
    if (incomeData.body.ptu > 0) {
        let accountPTU = grouped.liabilities.find(acc => acc.code === '2040');
        if (!accountPTU) {
            accountPTU = { code: '2040', balance: 0 };
            grouped.liabilities.push(accountPTU);
        }
        accountPTU.balance += incomeData.body.ptu;
    }

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
                    name: acc.isDynamicName ? acc.dynamicName : getAccountName(acc),
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

// Genero el Estado de Resultados
function generateIncomeStatement() {
    const grouped = groupAccountsByType();

    // 4xxx: Ingresos
    const revenues = grouped.revenues.map(acc => ({
        code: acc.code,
        name: getAccountName(acc),
        balance: acc.balance
    }));
    const totalRevenues = revenues.reduce((sum, acc) => sum + acc.balance, 0);

    // 5xxx: Costo de Ventas
    const costOfSales = grouped.expenses.filter(acc => acc.code.startsWith('5')).map(acc => ({
        code: acc.code,
        name: getAccountName(acc),
        balance: acc.balance
    }));
    const totalCostOfSales = costOfSales.reduce((sum, acc) => sum + acc.balance, 0);

    const grossProfit = totalRevenues - totalCostOfSales;

    // 6xxx y 7xxx: Gastos de Operación
    const operatingExpenses = grouped.expenses.filter(acc => !acc.code.startsWith('5')).map(acc => ({
        code: acc.code,
        name: getAccountName(acc),
        balance: acc.balance
    }));
    const totalOperatingExpenses = operatingExpenses.reduce((sum, acc) => sum + acc.balance, 0);

    const operatingProfit = grossProfit - totalOperatingExpenses;

    // PTU e ISR solo aplican sobre utilidades de operación positivas
    let ptu = 0;
    let incomeTax = 0;
    if (operatingProfit > 0) {
        ptu = operatingProfit * 0.10;
        incomeTax = operatingProfit * 0.30;
    }

    const netProfit = operatingProfit - ptu - incomeTax;

    return {
        header: {
            companyName: getCompany()?.name || 'Mi Empresa S.A. de C.V.',
            reportTitle: t('incomeStatement.reportTitle'),
            periodName: t('incomeStatement.period')
        },
        body: {
            revenues: {
                title: t('incomeStatement.revenues') || 'Ingresos',
                accounts: revenues,
                total: totalRevenues
            },
            costOfSales: {
                title: t('incomeStatement.costOfSales') || 'Costo de Ventas',
                accounts: costOfSales,
                total: totalCostOfSales
            },
            operatingExpenses: {
                title: t('incomeStatement.operatingExpenses') || 'Gastos de Operación',
                accounts: operatingExpenses,
                total: totalOperatingExpenses
            },
            incomeTax,
            ptu
        },
        totals: {
            grossProfit,
            operatingProfit,
            netProfit
        }
    };
}
