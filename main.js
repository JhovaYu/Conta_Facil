// Aquí configuro el proceso principal de Electron, es el corazón de la app
// Me encargo de crear la ventana, manejar el ciclo de vida y los handlers de IPC

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Aquí defino la ruta donde voy a guardar los datos del usuario
const DATA_DIR = path.join(app.getPath('userData'), 'contafacil-data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const DEFAULT_CATALOG = path.join(__dirname, 'data', 'default-catalog.json');

// Me aseguro de que el directorio de datos exista cuando arranca la app
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Cargo los datos del archivo JSON, si no existe creo uno con el catálogo por defecto
function loadData() {
  ensureDataDirectory();

  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  }

  // Si es la primera vez, creo los datos iniciales con el catálogo por defecto
  const defaultCatalog = JSON.parse(fs.readFileSync(DEFAULT_CATALOG, 'utf-8'));
  const initialData = {
    company: {
      name: 'Mi Empresa S.A. de C.V.',
      rfc: '',
      address: '',
      fiscalYear: new Date().getFullYear()
    },
    accounts: defaultCatalog,
    entries: [],
    settings: {
      language: 'es',
      currency: 'MXN'
    }
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

// Guardo los datos actualizados al archivo JSON
function saveData(data) {
  ensureDataDirectory();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Aquí creo la ventana principal con todas las configuraciones de responsividad
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    minimizable: true,
    fullscreenable: true,
    title: 'ContaFácil',
    backgroundColor: '#f5f5f7',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Quito el menú por defecto de Electron para que se vea más limpio
  mainWindow.setMenuBarVisibility(false);

  // Cargo la página principal
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Muestro la ventana cuando esté lista para evitar el flash blanco
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

// Configuro los handlers de IPC para comunicar el renderer con el main process
function setupIPCHandlers() {
  // Leer todos los datos guardados
  ipcMain.handle('data:read', async () => {
    return loadData();
  });

  // Guardar todos los datos
  ipcMain.handle('data:write', async (_event, data) => {
    saveData(data);
    return { success: true };
  });

  // Obtener la ruta del directorio de datos (por si necesito saber dónde se guardan)
  ipcMain.handle('data:getPath', async () => {
    return DATA_DIR;
  });

  // Diálogo para guardar archivos (para el PDF)
  ipcMain.handle('dialog:saveFile', async (_event, options) => {
    const result = await dialog.showSaveDialog(options);
    return result;
  });

  // Escribir archivo binario (para guardar el PDF generado)
  ipcMain.handle('file:writeBinary', async (_event, filePath, base64Data) => {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { success: true };
  });
}

// Inicio la app cuando Electron esté listo
app.whenReady().then(() => {
  setupIPCHandlers();
  createMainWindow();
});

// Cierro la app cuando todas las ventanas estén cerradas (en Windows)
app.on('window-all-closed', () => {
  app.quit();
});
