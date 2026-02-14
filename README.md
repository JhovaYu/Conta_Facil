# ContaFácil

Aplicación de escritorio para contabilidad de partida doble. Desarrollada con Electron, permite gestionar catálogos de cuentas, registrar asientos contables y generar balances generales con exportación a PDF.

## Características

- **Catálogo de Cuentas**: Administra cuentas contables con clasificación por tipo (Activo, Pasivo, Capital, Ingreso, Gasto)
- **Asientos Contables**: Registro de transacciones con validación automática de partida doble
- **Balance General**: Generación automática del Estado de Situación Financiera
- **Exportación PDF**: Exporta reportes financieros personalizables
- **Búsqueda Inteligente**: Autocompletado de cuentas al registrar asientos
- **Paleta de Comandos**: Acceso rápido con Ctrl+K a todas las funciones
- **Configuración**: Personaliza datos de empresa y formato de reportes
- **Multiidioma**: Interfaz en español e inglés

## Instalación

### Opción 1: Instalador Windows (.exe)

1. Descarga el instalador desde el siguiente enlace: [Descargar ContaFácil Setup 1.0.0.exe](https://drive.google.com/file/d/1F3IMurQE2zIyFXd8cLTUXcHtBKxCFUIY/view?usp=sharing)
2. Una vez en Google Drive, haz clic en el botón de descarga (icono de flecha hacia abajo)
3. Ejecuta el archivo `ContaFácil Setup 1.0.0.exe` descargado
4. Sigue las instrucciones del asistente de instalación
5. Una vez instalado, busca "ContaFácil" en el menú de inicio de Windows

✓ El instalador creará un acceso directo en el escritorio y en el menú de inicio

⚠️ **Nota**: Windows puede mostrar una advertencia de seguridad porque la aplicación no está firmada digitalmente. Haz clic en "Más información" y luego en "Ejecutar de todas formas" para continuar con la instalación.

### Opción 2: Desarrollo (desde el código fuente)

Si deseas ejecutar la aplicación en modo desarrollo o contribuir al proyecto:

```bash
# Clona el repositorio
git clone https://github.com/JhovaYu/Conta_Facil.git
cd Conta_Facil

# Instala las dependencias
npm install

# Ejecuta la aplicación en modo desarrollo
npm start

# Genera el instalador
npm run build
```

**Requisitos**:
- Node.js 16 o superior
- npm 7 o superior

## Uso Rápido

1. **Primer inicio**: Al abrir la app por primera vez, ve a "Ajustes" (icono de avatar) para configurar los datos de tu empresa
2. **Catálogo**: Revisa y personaliza el catálogo de cuentas predefinido
3. **Asientos**: Registra transacciones usando el selector de tipo de asiento o crea asientos personalizados
4. **Balance**: Consulta el balance general actualizado automáticamente
5. **Atajos**: Presiona `Ctrl+K` para acceder rápidamente a cualquier función

## Tecnologías

- **Electron** - Framework para aplicaciones de escritorio
- **Chart.js** - Visualización de datos
- **jsPDF** - Generación de reportes PDF
- **HTML/CSS/JavaScript** - Interfaz de usuario

## Estructura del Proyecto

```
Programa_Contabilidad/
├── src/
│   ├── css/              # Estilos de la aplicación
│   ├── js/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── core/         # Motor contable y lógica de negocio
│   │   └── modules/      # Módulos de vistas (dashboard, catálogo, etc.)
│   ├── data/             # Datos persistentes (JSON)
│   └── index.html        # Punto de entrada
├── main.js               # Proceso principal de Electron
├── preload.js            # Script de preload para IPC
└── package.json          # Configuración y dependencias
```

## Autor

**Jhovanny Yuca Hernández**

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
