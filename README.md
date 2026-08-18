# Control de Facturas y Vencimiento de Productos

Aplicación web rápida e intuitiva para el registro, control de vencimiento y gestión de facturas de productos (como Avena, Harina, Granos, etc.) con cálculo dinámico de fechas, autocompletado inteligente por teclado, catálogo configurable y exportación directa a Microsoft Excel.

---

## 🚀 Requisitos Previos

Para ejecutar la aplicación en tu computadora local necesitas tener instalado:
- **Node.js** (versión 18.x, 20.x o superior): [Descargar Node.js](https://nodejs.org/)
- **npm** (se instala automáticamente junto con Node.js) o **bun** / **yarn** / **pnpm**

---

## 💻 Instalación y Puesta en Marcha en tu PC

### 1. Clonar el repositorio o descargar el código
Si usas Git en tu terminal:
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```
*(O simplemente descomprime el archivo ZIP descargado y abre una terminal en esa carpeta).*

### 2. Instalar las dependencias
Ejecuta el siguiente comando en la carpeta del proyecto:
```bash
npm install
```

### 3. Iniciar la aplicación

#### Opción A: Modo Web (Navegador)
```bash
npm run dev
```
Abre tu navegador web en `http://localhost:3000`.

#### Opción B: Modo Aplicación Nativa de Escritorio (Electron)
```bash
npm run electron:dev
```
Se abrirá automáticamente como una ventana nativa de escritorio independiente.

---

## 🖥️ Generar Instalador `.exe` para Windows

Para compilar la aplicación y crear un instalador ejecutable `.exe` independiente para Windows:

```bash
npm run electron:build
```

Esto generará en la carpeta `release/`:
- **Instalador NSIS (`.exe`)**: Crea el acceso directo en el Escritorio y Menú Inicio.
- **Versión Portable (`.exe`)**: Funciona directamente sin necesidad de instalar (ideal para llevar en un pendrive).

---

## 🔄 Actualizaciones Automáticas (Auto-Updater con GitHub)

La aplicación viene configurada con **`electron-updater`**. Cuando los usuarios abren la aplicación en Windows, esta consulta a GitHub si hay una versión más reciente y la descarga automáticamente en segundo plano.

### ¿Cómo lanzar una actualización para tus usuarios?
1. Incrementa el número de versión en `package.json` (por ejemplo, de `"version": "1.0.0"` a `"version": "1.0.1"`).
2. Si tienes tu token de GitHub configurado (`GH_TOKEN`), ejecuta:
   ```bash
   npm run electron:publish
   ```
   *(O sube el instalador `.exe` compilado y el archivo `latest.yml` generado a la sección **Releases** de tu repositorio en GitHub).*
3. Cuando tus usuarios o tú abran la aplicación instalada en su PC, verán automáticamente un aviso:
   > *"Se ha descargado la versión 1.0.1 de la aplicación. ¿Deseas reiniciar para instalar la actualización?"*
4. Al hacer clic en **"Reiniciar y Actualizar"**, la aplicación se actualiza sola sin perder los datos guardados.

---

## 📦 Construir para Servidor Web (Build)

Si deseas generar los archivos optimizados listos para desplegar en cualquier servidor web:
```bash
npm run build
```
Los archivos finales se generarán dentro de la carpeta `dist/`.

---

## ✨ Características Principales

1. **Carga Rápida de Facturas**:
   - Formato numérico oficial `001-001-0000001` con incremento automático de secuencia (+1).
   - Soporte para múltiples productos por factura.
   - Autocompletado con navegación por teclado (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Enter</kbd>) y desplazamiento automático.
2. **Cálculo de Vencimiento Automático**:
   - Calcula la fecha de vencimiento a partir de la Fecha de Elaboración y el plazo del producto (en **meses** o en **días**).
3. **Catálogo de Productos Personalizable**:
   - Administra nombres y plazos por defecto para cada producto.
4. **Tabla Compacta tipo Hoja de Cálculo**:
   - Vista de facturas optimizada con filas compactas y tipografía clara.
   - Filtros instantáneos por producto, cliente y búsqueda global.
5. **Exportación a Excel**:
   - Exporta el libro completo a formato `.xlsx` con un solo clic.
6. **Persistencia Local**:
   - Tus datos y catálogo se guardan de forma segura y persistente en el navegador (`localStorage`).

---

## 🛠️ Tecnologías Utilizadas
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **XLSX (SheetJS)**
