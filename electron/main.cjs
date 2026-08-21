const { app, BrowserWindow, shell, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;

// Configure Auto-Updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowPrerelease = false;
autoUpdater.allowDowngrade = false;

function sendToWindow(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    sendToWindow('updater-status', { status: 'checking', message: 'Buscando actualizaciones...' });
  });

  autoUpdater.on('update-available', (info) => {
    sendToWindow('updater-status', {
      status: 'available',
      version: info.version,
      message: `Nueva versión v${info.version} encontrada. Descargando en segundo plano...`
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    sendToWindow('updater-status', {
      status: 'not-available',
      version: info?.version || app.getVersion(),
      message: 'Tienes instalada la versión más reciente.'
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.min(100, Math.max(0, Math.round(progressObj.percent || 0)));
    const speedMB = ((progressObj.bytesPerSecond || 0) / (1024 * 1024)).toFixed(2);
    const transferredMB = ((progressObj.transferred || 0) / (1024 * 1024)).toFixed(1);
    const totalMB = ((progressObj.total || 0) / (1024 * 1024)).toFixed(1);

    sendToWindow('updater-status', {
      status: 'downloading',
      percent: percent,
      speed: `${speedMB} MB/s`,
      transferred: `${transferredMB} MB`,
      total: `${totalMB} MB`,
      bytesPerSecond: progressObj.bytesPerSecond || 0,
      transferredBytes: progressObj.transferred || 0,
      totalBytes: progressObj.total || 0,
      version: autoUpdater.currentVersion?.version || '',
      message: `Descargando actualización: ${percent}% (${transferredMB} de ${totalMB} MB a ${speedMB} MB/s)`
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendToWindow('updater-status', {
      status: 'downloaded',
      version: info.version,
      message: `¡Versión v${info.version} descargada y lista para instalar!`
    });

    dialog.showMessageBox(mainWindow || null, {
      type: 'info',
      title: 'Actualización lista para instalar',
      message: `Se ha descargado la versión ${info.version} de Control de Facturas.`,
      detail: '¿Deseas reiniciar la aplicación ahora para aplicar la actualización?',
      buttons: ['Reiniciar y Actualizar ahora', 'Más tarde'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  autoUpdater.on('error', (err) => {
    const errorMsg = err ? (err.message || String(err)) : 'Error desconocido al buscar actualizaciones';
    sendToWindow('updater-status', {
      status: 'error',
      message: errorMsg
    });
    console.error('Error en auto-updater:', errorMsg);
  });

  // IPC Handlers
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
      return {
        status: 'dev-mode',
        message: 'Modo desarrollo (Vite): el auto-updater se activa en la aplicación empaquetada (.exe instalador).'
      };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      return {
        status: 'success',
        updateInfo: result?.updateInfo
      };
    } catch (err) {
      return {
        status: 'error',
        message: err ? (err.message || String(err)) : 'Error al consultar GitHub Releases.'
      };
    }
  });

  ipcMain.handle('restart-and-install', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // Check for updates shortly after launch if packaged
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.log('Verificación automática inicial:', err ? err.message : err);
      });
    }, 4000);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Control de Facturas y Vencimiento de Productos',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    backgroundColor: '#1e1f20',
  });

  // Remove default menu bar for clean native app look
  Menu.setApplicationMenu(null);

  // In development, load dev server; in production, load dist/index.html
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null);

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open target="_blank" links in default external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
