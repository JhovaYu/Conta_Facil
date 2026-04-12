// Aquí configuro el bridge seguro entre el proceso principal y el renderer
// Uso contextBridge para exponer solo las funciones que necesito, sin dar acceso directo a Node.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Leer los datos guardados (catálogo, asientos, configuración)
    readData: () => ipcRenderer.invoke('data:read'),

    // Leer el catálogo por defecto
    readDefaultCatalog: () => ipcRenderer.invoke('data:readDefaultCatalog'),

    // Guardar los datos actualizados
    writeData: (data) => ipcRenderer.invoke('data:write', data),

    // Obtener la ruta donde se guardan los archivos
    getDataPath: () => ipcRenderer.invoke('data:getPath'),

    // Abrir diálogo para guardar un archivo (para el PDF)
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:saveFile', options),

    // Escribir un archivo binario (el PDF generado)
    writeBinaryFile: (filePath, base64Data) =>
        ipcRenderer.invoke('file:writeBinary', filePath, base64Data)
});
