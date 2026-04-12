// Aquí está el punto de entrada de la app
// Cargo los datos, inicializo el idioma, configuro los event listeners y arranco la vista inicial

// Variables globales para jsPDF (las cargo desde node_modules)
// Las voy a necesitar cuando el usuario quiera exportar el Balance a PDF

// Helper the desarrollo
const __DEV__ = true; // ← Cambiar a false antes de producción

// Helper global para hidratar los iconos de Lucide
window.updateIcons = () => {
    if (window.lucide) {
        lucide.createIcons();
    }
};

// Inicializo todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Cargo el idioma guardado
    loadSavedLanguage();

    // Cargo los datos del store
    await loadAppData();

    // Configuro el idioma en la UI
    setLanguage(getCurrentLanguage());

    // Configuro los event listeners de la navegación
    setupNavigation();

    // Configuro el toggle de idioma
    setupLanguageToggle();

    // Configuro la búsqueda global
    setupGlobalSearch();

    // Cargo jsPDF como variable global para el export
    loadJsPDF();

    // Inyecto el command palette en el DOM
    injectCommandPalette();

    // Configuro los atajos de teclado para el command palette
    setupCommandPaletteShortcut();

    // Configuro el clic en el avatar para ir a settings
    setupAvatarClick();

    // Arranco en el dashboard
    navigateTo('dashboard');
    
    // Cargo de datos de prueba si estamos en modo dev
    if (__DEV__) {
        await loadYuKfeTestData();
    }
});

// Configuro los clicks en la navegación
function setupNavigation() {
    const navItems = document.querySelectorAll('.topbar__nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const route = item.getAttribute('data-route');
            if (route) {
                navigateTo(route);
            }
        });
    });
}

// Configuro el botón para alternar el idioma
function setupLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = toggleLanguage();

            // Re-renderizo la vista actual para que se actualicen todos los textos dinámicos
            setTimeout(() => {
                navigateTo(getCurrentRoute());
            }, 50);
        });
    }
}

// Configuro la búsqueda global (por ahora solo filtra en el catálogo)
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            // Si estoy en el catálogo, filtro las filas de la tabla
            if (getCurrentRoute() === 'catalog') {
                const rows = document.querySelectorAll('#catalogBody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            }
        });
    }
}

// Inyecto el HTML del command palette al body
function injectCommandPalette() {
    const paletteHTML = renderCommandPalette();
    const paletteContainer = document.createElement('div');
    paletteContainer.innerHTML = paletteHTML;
    document.body.appendChild(paletteContainer.firstElementChild);
}

// Configuro el clic en el avatar para ir a la página de perfil/settings
function setupAvatarClick() {
    const avatar = document.querySelector('.topbar__avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.addEventListener('click', () => navigateTo('settings'));
    }
}

// Cargo jsPDF como variable global
function loadJsPDF() {
    try {
        // Intento cargar desde node_modules vía script dinámico
        const script = document.createElement('script');
        script.src = '../node_modules/jspdf/dist/jspdf.umd.min.js';
        script.onload = () => {
            // También cargo el plugin autotable si lo necesito
            const autoTableScript = document.createElement('script');
            autoTableScript.src = '../node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js';
            document.head.appendChild(autoTableScript);
        };
        document.head.appendChild(script);
    } catch (e) {
        console.warn('No pude cargar jsPDF:', e);
    }
}

// === TOAST / NOTIFICACIONES ===
// Sistema de notificaciones toast sencillo

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <span class="toast__message">${message}</span>
  `;

    container.appendChild(toast);

    // Remuevo el toast después de 3 segundos con animación
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
    
    updateIcons();
}

// === DATOS DE PRUEBA YU'KFE ===
async function loadYuKfeTestData() {
    // Si ya tiene los 19 asientos, no corremos para no duplicar en hot reloads o navegación manual
    if (getEntries().length >= 19) return;
    
    console.log("Cargando asientos iniciales Yu'Kfe...");
    
    // Primero, limpiamos los entries actuales y cargamos catalog fresco manipulando directamente appData
    const appData = getAppData();
    appData.entries = [];
    appData.accounts = await window.api.readDefaultCatalog();
    
    // Función helper para forzar inyección
    async function forceEntry(entryObj) {
        const maxId = appData.entries.reduce((max, e) => Math.max(max, e.id || 0), 0);
        entryObj.id = maxId + 1;
        entryObj.createdAt = new Date().toISOString();
        appData.entries.push(entryObj);
    }

    const testEntries = [
        {
            type: 'opening', date: '2026-01-23', description: 'Apertura (23 Ene 2026)',
            movements: [
                { accountCode: '1010', debit: 50000, credit: 0 },
                { accountCode: '1020', debit: 27971300, credit: 0 },
                { accountCode: '1040', debit: 823000, credit: 0 },
                { accountCode: '1110', debit: 10200000, credit: 0 },
                { accountCode: '1120', debit: 7000000, credit: 0 },
                { accountCode: '1100', debit: 2500000, credit: 0 },
                { accountCode: '1130', debit: 425000, credit: 0 }, // Equipo de cómputo, validaré el catálogo luego
                { accountCode: '1140', debit: 972800, credit: 0 }, // Eq transporte
                { accountCode: '1210', debit: 50000, credit: 0 }, // Gastos Constitución
                { accountCode: '1220', debit: 128000, credit: 0 }, // Gastos de instalación
                { accountCode: '1050', debit: 28000, credit: 0 }, // Papelería
                { accountCode: '1060', debit: 42000, credit: 0 }, // Rentas pagadas X anticipado
                { accountCode: '3010', debit: 0, credit: 50190100 }
            ]
        },
        {
            type: 'cash_purchase', date: '2026-01-24', description: 'Compra en efectivo',
            movements: [
                { accountCode: '1040', debit: 86206.90, credit: 0 },
                { accountCode: '1070', debit: 13793.10, credit: 0 },
                { accountCode: '1020', debit: 0, credit: 100000 }
            ]
        },
        {
            type: 'credit_purchase', date: '2026-01-25', description: 'Compra a crédito',
            movements: [
                { accountCode: '1040', debit: 400000, credit: 0 },
                { accountCode: '1080', debit: 64000, credit: 0 }, // IVA X Acreditar
                { accountCode: '2010', debit: 0, credit: 464000 }
            ]
        },
        {
            type: 'free', date: '2026-01-26', description: 'Compra combinada (edificio)',
            movements: [
                { accountCode: '1120', debit: 1135000, credit: 0 },
                { accountCode: '1070', debit: 36320, credit: 0 },
                { accountCode: '1080', debit: 150328, credit: 0 }, // IVA X Acreditar
                { accountCode: '1020', debit: 0, credit: 263320 },
                { accountCode: '2040', debit: 0, credit: 1058328 }
            ]
        },
        {
            type: 'free', date: '2026-01-27', description: 'Anticipo de clientes',
            movements: [
                { accountCode: '1020', debit: 417600, credit: 0 },
                { accountCode: '2030', debit: 0, credit: 57600 }, // IVA Trasladado
                { accountCode: '2020', debit: 0, credit: 360000 }
            ]
        },
        {
            type: 'free', isAdjustment: true, date: '2026-01-28', description: 'Renta pagada por anticipado (ajuste)',
            movements: [
                { accountCode: '6110', debit: 12000, credit: 0 },
                { accountCode: '1060', debit: 0, credit: 12000 }
            ]
        },
        {
            type: 'free', date: '2026-01-29', description: 'Papelería',
            movements: [
                { accountCode: '6100', debit: 1250, credit: 0 },
                { accountCode: '1050', debit: 0, credit: 1250 }
            ]
        },
        {
            type: 'free', date: '2026-02-01', description: 'Venta con anticipo aplicado',
            movements: [
                { accountCode: '1030', debit: 278400, credit: 0 },
                { accountCode: '2020', debit: 360000, credit: 0 },
                { accountCode: '2030', debit: 57600, credit: 0 }, // IVA Trasladado
                { accountCode: '4100', debit: 0, credit: 600000 },
                { accountCode: '2035', debit: 0, credit: 96000 } // IVA X Trasladar
            ]
        },
        {
            type: 'free', isAdjustment: true, date: '2026-02-05', description: 'Ajustes de depreciación y amortización',
            movements: [
                { accountCode: '6110', debit: 6500, credit: 0 },
                { accountCode: '6100', debit: 101150.50, credit: 0 },
                { accountCode: '1291', debit: 0, credit: 33893.85 }, // Dep. Acum. Edificios
                { accountCode: '1292', debit: 0, credit: 20833.33 },
                { accountCode: '1293', debit: 0, credit: 14166.66 },
                { accountCode: '1294', debit: 0, credit: 28350.00 },
                { accountCode: '1296', debit: 0, credit: 10406.66 } // Amort. Acum. 
            ]
        },
        {
            type: 'cash_purchase', date: '2026-02-10', description: 'Compra en efectivo',
            movements: [
                { accountCode: '5200', debit: 100000, credit: 0 }, // Compras
                { accountCode: '1070', debit: 16000, credit: 0 },
                { accountCode: '1020', debit: 0, credit: 116000 }
            ]
        },
        {
            type: 'credit_purchase', date: '2026-02-15', description: 'Compra a crédito',
            movements: [
                { accountCode: '5200', debit: 50000, credit: 0 },
                { accountCode: '1080', debit: 8000, credit: 0 },
                { accountCode: '2010', debit: 0, credit: 58000 }
            ]
        },
        {
            type: 'cash_sale', date: '2026-02-20', description: 'Venta en efectivo',
            movements: [
                { accountCode: '1020', debit: 17400, credit: 0 },
                { accountCode: '4100', debit: 0, credit: 15000 },
                { accountCode: '2030', debit: 0, credit: 2400 }
            ]
        },
        {
            type: 'credit_sale', date: '2026-02-25', description: 'Venta a crédito',
            movements: [
                { accountCode: '1030', debit: 23200, credit: 0 },
                { accountCode: '4100', debit: 0, credit: 20000 },
                { accountCode: '2035', debit: 0, credit: 3200 }
            ]
        },
        {
            type: 'free', date: '2026-03-01', description: 'Gastos de compra',
            movements: [
                { accountCode: '5210', debit: 6000, credit: 0 }, // Gastos de compra
                { accountCode: '1070', debit: 960, credit: 0 },
                { accountCode: '1020', debit: 0, credit: 6960 }
            ]
        },
        {
            type: 'free', date: '2026-03-05', description: 'Devolución sobre venta',
            movements: [
                { accountCode: '4191', debit: 5500, credit: 0 }, // Dev S. Venta
                { accountCode: '2030', debit: 880, credit: 0 },
                { accountCode: '1020', debit: 0, credit: 6380 }
            ]
        },
        {
            type: 'free', date: '2026-03-10', description: 'Devolución sobre compra',
            movements: [
                { accountCode: '2010', debit: 8700, credit: 0 },
                { accountCode: '5291', debit: 0, credit: 7500 }, // Dev S. Compra
                { accountCode: '1080', debit: 0, credit: 1200 }
            ]
        },
        {
            type: 'free', date: '2026-03-15', description: 'Descuento sobre venta',
            movements: [
                { accountCode: '4192', debit: 5000, credit: 0 }, // Desctos S. Venta
                { accountCode: '2030', debit: 800, credit: 0 },
                { accountCode: '1020', debit: 0, credit: 5800 }
            ]
        },
        {
            type: 'free', date: '2026-03-20', description: 'Gasto de venta',
            movements: [
                { accountCode: '6110', debit: 12500, credit: 0 },
                { accountCode: '1020', debit: 0, credit: 12500 }
            ]
        },
        {
            type: 'free', date: '2026-03-25', description: 'Descuento sobre compra',
            movements: [
                { accountCode: '1020', debit: 2000, credit: 0 },
                { accountCode: '5292', debit: 0, credit: 1724.14 },
                { accountCode: '1070', debit: 0, credit: 275.86 }
            ]
        }
    ];

    for (let e of testEntries) {
        await forceEntry(e);
    }
    
    await window.api.writeData(appData);
    console.log("Carga de prueba finalizada correctamente.");
    // Forzamos actualización de vista en caso necesario
    navigateTo(getCurrentRoute());
}
