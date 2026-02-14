// Aquí defino las constantes y funciones relacionadas con las cuentas contables
// Es como el "esqueleto" del catálogo de cuentas

// Los tipos de cuenta que manejo
const ACCOUNT_TYPES = {
    ASSET: 'asset',
    LIABILITY: 'liability',
    EQUITY: 'equity',
    REVENUE: 'revenue',
    EXPENSE: 'expense'
};

// La naturaleza de cada tipo de cuenta (si es deudora o acreedora)
const ACCOUNT_NATURES = {
    DEBIT: 'debit',
    CREDIT: 'credit'
};

// Mapeo de tipo a naturaleza por defecto
const TYPE_NATURE_MAP = {
    [ACCOUNT_TYPES.ASSET]: ACCOUNT_NATURES.DEBIT,
    [ACCOUNT_TYPES.LIABILITY]: ACCOUNT_NATURES.CREDIT,
    [ACCOUNT_TYPES.EQUITY]: ACCOUNT_NATURES.CREDIT,
    [ACCOUNT_TYPES.REVENUE]: ACCOUNT_NATURES.CREDIT,
    [ACCOUNT_TYPES.EXPENSE]: ACCOUNT_NATURES.DEBIT
};

// Obtengo la etiqueta traducida para el tipo de cuenta
function getAccountTypeLabel(type) {
    const labels = {
        [ACCOUNT_TYPES.ASSET]: 'catalog.asset',
        [ACCOUNT_TYPES.LIABILITY]: 'catalog.liability',
        [ACCOUNT_TYPES.EQUITY]: 'catalog.equity',
        [ACCOUNT_TYPES.REVENUE]: 'catalog.revenue',
        [ACCOUNT_TYPES.EXPENSE]: 'catalog.expense'
    };
    return t(labels[type] || type);
}

// Obtengo la clase CSS del badge según el tipo
function getAccountTypeBadgeClass(type) {
    return `badge--${type}`;
}

// Obtengo la etiqueta traducida para la naturaleza
function getAccountNatureLabel(nature) {
    const labels = {
        [ACCOUNT_NATURES.DEBIT]: 'catalog.debit',
        [ACCOUNT_NATURES.CREDIT]: 'catalog.credit'
    };
    return t(labels[nature] || nature);
}

// Obtengo el nombre de la cuenta según el idioma actual
function getAccountName(account) {
    if (getCurrentLanguage() === 'en' && account.nameEn) {
        return account.nameEn;
    }
    return account.name;
}

// Calculo el saldo de una cuenta sumando todos sus movimientos
function calculateAccountBalance(accountCode) {
    const account = findAccountByCode(accountCode);
    if (!account) return 0;

    const entries = getEntries();
    let balance = 0;

    entries.forEach(entry => {
        entry.movements.forEach(mov => {
            if (mov.accountCode === accountCode) {
                // Si la naturaleza es deudora: cargo suma, abono resta
                // Si la naturaleza es acreedora: abono suma, cargo resta
                if (account.nature === ACCOUNT_NATURES.DEBIT) {
                    balance += (mov.debit || 0) - (mov.credit || 0);
                } else {
                    balance += (mov.credit || 0) - (mov.debit || 0);
                }
            }
        });
    });

    return balance;
}

// Calculo los saldos de todas las cuentas y los agrupo por tipo
function calculateAllBalances() {
    const accounts = getAccounts().filter(acc => !acc.isGroup);
    const balances = {};

    accounts.forEach(account => {
        balances[account.code] = {
            ...account,
            balance: calculateAccountBalance(account.code)
        };
    });

    return balances;
}

// Agrupo las cuentas por tipo para el balance general
function groupAccountsByType() {
    const balances = calculateAllBalances();
    const grouped = {
        assets: [],
        liabilities: [],
        equity: []
    };

    Object.values(balances).forEach(acc => {
        if (acc.balance !== 0 || true) { // Muestro todas las cuentas, incluso con saldo 0
            switch (acc.type) {
                case ACCOUNT_TYPES.ASSET:
                    grouped.assets.push(acc);
                    break;
                case ACCOUNT_TYPES.LIABILITY:
                    grouped.liabilities.push(acc);
                    break;
                case ACCOUNT_TYPES.EQUITY:
                    grouped.equity.push(acc);
                    break;
            }
        }
    });

    return grouped;
}

// Formato de moneda para mostrar cantidades
function formatCurrency(amount) {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${t('general.currency')}${formatted}`;
}
