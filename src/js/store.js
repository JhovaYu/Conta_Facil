// Aquí manejo todo el almacenamiento de datos de la app
// Me comunico con el proceso principal de Electron vía IPC para leer y guardar JSON

// Variable global donde guardo los datos en memoria
let appData = null;

// Cargo los datos al iniciar la app
async function loadAppData() {
    try {
        appData = await window.api.readData();
        return appData;
    } catch (error) {
        console.error('Error al cargar datos:', error);
        // Si falla, creo datos vacíos como respaldo
        appData = {
            company: {
                name: 'Mi Empresa S.A. de C.V.',
                rfc: '',
                address: '',
                fiscalYear: new Date().getFullYear()
            },
            accounts: [],
            entries: [],
            settings: {
                language: 'es',
                currency: 'MXN'
            }
        };
        return appData;
    }
}

// Guardo los datos actuales al archivo JSON
async function saveAppData() {
    try {
        await window.api.writeData(appData);
        return true;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        return false;
    }
}

// Obtengo los datos actuales (sin ir al disco, uso los de memoria)
function getAppData() {
    return appData;
}

// Actualizo una sección específica de los datos y guardo
async function updateAppData(section, data) {
    if (appData) {
        appData[section] = data;
        return await saveAppData();
    }
    return false;
}

// === Funciones específicas para cuentas ===

// Obtengo todas las cuentas
function getAccounts() {
    return appData ? appData.accounts : [];
}

// Obtengo solo las cuentas que no son grupo (las que pueden recibir movimientos)
function getLeafAccounts() {
    return getAccounts().filter(acc => !acc.isGroup);
}

// Busco una cuenta por su código
function findAccountByCode(code) {
    return getAccounts().find(acc => acc.code === code);
}

// Agrego una nueva cuenta
async function addAccount(account) {
    if (appData) {
        appData.accounts.push(account);
        return await saveAppData();
    }
    return false;
}

// Actualizo una cuenta existente
async function updateAccount(code, updatedData) {
    if (appData) {
        const index = appData.accounts.findIndex(acc => acc.code === code);
        if (index !== -1) {
            appData.accounts[index] = { ...appData.accounts[index], ...updatedData };
            return await saveAppData();
        }
    }
    return false;
}

// Elimino una cuenta por su código
async function deleteAccount(code) {
    if (appData) {
        appData.accounts = appData.accounts.filter(acc => acc.code !== code);
        return await saveAppData();
    }
    return false;
}

// === Funciones específicas para asientos ===

// Obtengo todos los asientos
function getEntries() {
    return appData ? appData.entries : [];
}

// Agrego un nuevo asiento
async function addEntry(entry) {
    if (appData) {
        // Le asigno un ID incremental
        const maxId = appData.entries.reduce((max, e) => Math.max(max, e.id || 0), 0);
        entry.id = maxId + 1;
        appData.entries.push(entry);
        return await saveAppData();
    }
    return false;
}

// Elimino un asiento por su ID
async function deleteEntry(id) {
    if (appData) {
        appData.entries = appData.entries.filter(e => e.id !== id);
        return await saveAppData();
    }
    return false;
}

// === Funciones para la empresa ===

// Obtengo la info de la empresa
function getCompany() {
    return appData ? appData.company : {};
}

// Actualizo la info de la empresa
async function updateCompany(companyData) {
    return await updateAppData('company', companyData);
}

// Alias para la función de actualizar empresa (usado por settings.js)
async function updateCompanyInfo(companyData) {
    return await updateAppData('company', companyData);
}

// Actualizo la configuración del PDF
async function updatePdfSettings(pdfSettings) {
    return await updateAppData('pdfSettings', pdfSettings);
}

// Obtengo la configuración del PDF
function getPdfSettings() {
    return appData ? appData.pdfSettings : null;
}
