// Aquí está el punto de entrada de la app
// Cargo los datos, inicializo el idioma, configuro los event listeners y arranco la vista inicial

// Variables globales para jsPDF (las cargo desde node_modules)
// Las voy a necesitar cuando el usuario quiera exportar el Balance a PDF

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
}
