// Aquí manejo la navegación entre las vistas de la app
// Es un router sencillo que intercambia el contenido del contenedor principal

// La ruta actual
let currentRoute = 'dashboard';

// Las rutas disponibles y sus funciones de renderizado
const ROUTES = {
    dashboard: {
        render: renderDashboard,
        afterRender: (summary) => {
            // Inicializo la gráfica después de montar el DOM
            const dashSummary = generateDashboardSummary();
            initDashboardChart(dashSummary);
        }
    },
    catalog: {
        render: renderCatalog,
        afterRender: () => { }
    },
    entries: {
        render: renderEntries,
        afterRender: () => { }
    },
    balance: {
        render: renderBalance,
        afterRender: () => { }
    },
    settings: {
        render: renderSettings,
        afterRender: () => { }
    }
};

// Navego a una ruta específica
function navigateTo(route) {
    if (!ROUTES[route]) {
        console.warn(`Ruta "${route}" no existe`);
        return;
    }

    currentRoute = route;

    // Actualizo el estado visual de la navegación
    document.querySelectorAll('.topbar__nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-route') === route);
    });

    // Renderizo la vista correspondiente
    const container = document.getElementById('viewContainer');
    if (container) {
        // Primero hago un fade out rápido
        container.style.opacity = '0';
        container.style.transform = 'translateY(8px)';

        setTimeout(() => {
            container.innerHTML = ROUTES[route].render();

            // Ejecuto el afterRender (por ejemplo para las gráficas)
            ROUTES[route].afterRender();

            // Fade in
            requestAnimationFrame(() => {
                container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            });
        }, 150);
    }
}

// Obtengo la ruta actual
function getCurrentRoute() {
    return currentRoute;
}
