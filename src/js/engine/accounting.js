// Aquí está el corazón de la contabilidad: el motor de partida doble
// Me encargo de validar, crear y procesar los asientos contables

// Los tipos de asiento que manejo en la app (los 7 obligatorios + libre)
const ENTRY_TYPES = {
    OPENING: 'opening',
    CASH_PURCHASE: 'cashPurchase',
    CREDIT_PURCHASE: 'creditPurchase',
    COMBINED_PURCHASE: 'combinedPurchase',
    CUSTOMER_ADVANCE: 'customerAdvance',
    STATIONERY_PURCHASE: 'stationeryPurchase',
    PREPAID_RENT: 'prepaidRent',
    FREE: 'free'
};

// Templates predefinidos para cada tipo de asiento
// Cada template dice qué cuentas usar y si son cargo o abono
const ENTRY_TEMPLATES = {
    [ENTRY_TYPES.OPENING]: {
        descriptionKey: 'entries.opening',
        movements: [
            // El asiento de apertura es libre, el usuario pone las cuentas iniciales
        ]
    },

    [ENTRY_TYPES.CASH_PURCHASE]: {
        descriptionKey: 'entries.cashPurchase',
        movements: [
            { accountCode: '1040', type: 'debit', label: 'Almacén / Inventario' },
            { accountCode: '1010', type: 'credit', label: 'Caja' }
        ]
    },

    [ENTRY_TYPES.CREDIT_PURCHASE]: {
        descriptionKey: 'entries.creditPurchase',
        movements: [
            { accountCode: '1040', type: 'debit', label: 'Almacén / Inventario' },
            { accountCode: '2010', type: 'credit', label: 'Proveedores' }
        ]
    },

    [ENTRY_TYPES.COMBINED_PURCHASE]: {
        descriptionKey: 'entries.combinedPurchase',
        movements: [
            { accountCode: '1040', type: 'debit', label: 'Almacén / Inventario' },
            { accountCode: '1010', type: 'credit', label: 'Caja' },
            { accountCode: '2010', type: 'credit', label: 'Proveedores' }
        ]
    },

    [ENTRY_TYPES.CUSTOMER_ADVANCE]: {
        descriptionKey: 'entries.customerAdvance',
        movements: [
            { accountCode: '1010', type: 'debit', label: 'Caja' },
            { accountCode: '2020', type: 'credit', label: 'Anticipo de clientes' }
        ]
    },

    [ENTRY_TYPES.STATIONERY_PURCHASE]: {
        descriptionKey: 'entries.stationeryPurchase',
        movements: [
            { accountCode: '1050', type: 'debit', label: 'Papelería y útiles' },
            { accountCode: '1010', type: 'credit', label: 'Caja' }
        ]
    },

    [ENTRY_TYPES.PREPAID_RENT]: {
        descriptionKey: 'entries.prepaidRent',
        movements: [
            { accountCode: '1060', type: 'debit', label: 'Rentas pagadas por anticipado' },
            { accountCode: '1010', type: 'credit', label: 'Caja' }
        ]
    },

    [ENTRY_TYPES.FREE]: {
        descriptionKey: 'entries.freeEntry',
        movements: []
    }
};

// Valido que un asiento cumpla con la partida doble (Σ Cargos = Σ Abonos)
function validateEntry(movements) {
    const totalDebits = movements.reduce((sum, m) => sum + (parseFloat(m.debit) || 0), 0);
    const totalCredits = movements.reduce((sum, m) => sum + (parseFloat(m.credit) || 0), 0);

    // Uso una tolerancia de 0.01 por los decimales flotantes
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return {
        isBalanced,
        totalDebits,
        totalCredits,
        difference: Math.abs(totalDebits - totalCredits)
    };
}

// Creo un nuevo asiento contable completo
function createEntry(type, date, description, movements) {
    // Primero valido que cuadre
    const validation = validateEntry(movements);

    if (!validation.isBalanced) {
        return {
            success: false,
            error: 'toast.validationError',
            validation
        };
    }

    // Valido que todos los movimientos tengan cuenta y monto
    const hasEmptyFields = movements.some(m =>
        !m.accountCode || ((!m.debit || m.debit === 0) && (!m.credit || m.credit === 0))
    );

    if (hasEmptyFields) {
        return {
            success: false,
            error: 'toast.requiredFields',
            validation
        };
    }

    // Creo el objeto del asiento
    const entry = {
        type,
        date: date || new Date().toISOString().split('T')[0],
        description: description || t(ENTRY_TEMPLATES[type]?.descriptionKey || 'entries.freeEntry'),
        movements: movements.map(m => ({
            accountCode: m.accountCode,
            debit: parseFloat(m.debit) || 0,
            credit: parseFloat(m.credit) || 0
        })),
        createdAt: new Date().toISOString()
    };

    return {
        success: true,
        entry
    };
}

// Obtengo la lista de tipos de asiento con sus datos para mostrar en la UI
function getEntryTypesList() {
    return [
        {
            type: ENTRY_TYPES.OPENING,
            nameKey: 'entries.opening',
            descKey: 'entries.openingDesc',
            icon: '📋'
        },
        {
            type: ENTRY_TYPES.CASH_PURCHASE,
            nameKey: 'entries.cashPurchase',
            descKey: 'entries.cashPurchaseDesc',
            icon: '💵'
        },
        {
            type: ENTRY_TYPES.CREDIT_PURCHASE,
            nameKey: 'entries.creditPurchase',
            descKey: 'entries.creditPurchaseDesc',
            icon: '🏷️'
        },
        {
            type: ENTRY_TYPES.COMBINED_PURCHASE,
            nameKey: 'entries.combinedPurchase',
            descKey: 'entries.combinedPurchaseDesc',
            icon: '🔄'
        },
        {
            type: ENTRY_TYPES.CUSTOMER_ADVANCE,
            nameKey: 'entries.customerAdvance',
            descKey: 'entries.customerAdvanceDesc',
            icon: '🤝'
        },
        {
            type: ENTRY_TYPES.STATIONERY_PURCHASE,
            nameKey: 'entries.stationeryPurchase',
            descKey: 'entries.stationeryPurchaseDesc',
            icon: '📎'
        },
        {
            type: ENTRY_TYPES.PREPAID_RENT,
            nameKey: 'entries.prepaidRent',
            descKey: 'entries.prepaidRentDesc',
            icon: '🏠'
        },
        {
            type: ENTRY_TYPES.FREE,
            nameKey: 'entries.freeEntry',
            descKey: 'entries.freeEntryDesc',
            icon: '✏️'
        }
    ];
}

// Obtengo el template de movimientos para un tipo de asiento
function getEntryTemplate(type) {
    return ENTRY_TEMPLATES[type] || ENTRY_TEMPLATES[ENTRY_TYPES.FREE];
}

// Calculo los totales de un array de movimientos (útil para la UI en tiempo real)
function calculateMovementTotals(movements) {
    const totalDebits = movements.reduce((sum, m) => sum + (parseFloat(m.debit) || 0), 0);
    const totalCredits = movements.reduce((sum, m) => sum + (parseFloat(m.credit) || 0), 0);
    return { totalDebits, totalCredits };
}
