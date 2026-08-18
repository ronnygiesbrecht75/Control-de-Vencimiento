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

### 3. Iniciar la aplicación en modo desarrollo
Para abrir la aplicación localmente:
```bash
npm run dev
```

Abre tu navegador web y entra a la dirección que aparece en la terminal (por defecto: `http://localhost:3000` o `http://localhost:5173`).

---

## 📦 Construir para Producción (Build)

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
