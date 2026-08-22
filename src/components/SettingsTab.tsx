import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Laptop, 
  RefreshCw, 
  CheckCircle2, 
  ArrowUpCircle, 
  Database, 
  Download, 
  Upload, 
  ShieldCheck,
  X,
  Sparkles,
  Zap,
  HardDrive,
  DownloadCloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ThemeMode, InvoiceItem, CatalogProduct } from '../types';

interface SettingsTabProps {
  currentTheme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  invoices: InvoiceItem[];
  catalog: CatalogProduct[];
  onImportData?: (invoices: InvoiceItem[], catalog: CatalogProduct[]) => void;
}

interface DownloadMetrics {
  percent: number;
  speed?: string;
  transferred?: string;
  total?: string;
  version?: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentTheme,
  onThemeChange,
  invoices,
  catalog,
  onImportData
}) => {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [downloadMetrics, setDownloadMetrics] = useState<DownloadMetrics | null>(null);
  const [updateResult, setUpdateResult] = useState<{
    status: 'checking' | 'up-to-date' | 'available' | 'downloading' | 'downloaded' | 'error' | null;
    message?: string;
    latestVersion?: string;
  }>({ status: null });

  const currentAppVersion = '1.2.7';

  // Listen to Electron Auto-Updater IPC events if available
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electron = (window as any).electronAPI;
    if (electron?.onUpdateStatus) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsubscribe = electron.onUpdateStatus((data: any) => {
        if (data.status === 'checking') {
          setCheckingUpdate(true);
          setUpdateResult({
            status: 'checking',
            message: 'Buscando nuevas versiones en GitHub...'
          });
        } else if (data.status === 'available') {
          setCheckingUpdate(false);
          setUpdateResult({
            status: 'available',
            message: data.message || `Nueva versión v${data.version} encontrada. Descargando automáticamente...`,
            latestVersion: data.version
          });
          setDownloadMetrics({
            percent: 0,
            version: data.version
          });
        } else if (data.status === 'downloading') {
          setCheckingUpdate(false);
          const percent = data.percent !== undefined ? Number(data.percent) : 0;
          setDownloadMetrics({
            percent: percent,
            speed: data.speed,
            transferred: data.transferred,
            total: data.total,
            version: data.version || updateResult.latestVersion
          });
          setUpdateResult({
            status: 'downloading',
            message: `Descargando actualización en segundo plano: ${percent}%`,
            latestVersion: data.version || updateResult.latestVersion
          });
        } else if (data.status === 'downloaded') {
          setCheckingUpdate(false);
          setDownloadMetrics({
            percent: 100,
            version: data.version || updateResult.latestVersion
          });
          setUpdateResult({
            status: 'downloaded',
            message: `¡Versión v${data.version || currentAppVersion} descargada y lista para instalar!`,
            latestVersion: data.version
          });
        } else if (data.status === 'not-available') {
          setCheckingUpdate(false);
          setDownloadMetrics(null);
          setUpdateResult({
            status: 'up-to-date',
            message: `Tienes instalada la versión más reciente (v${currentAppVersion}). No hay actualizaciones pendientes.`
          });
        } else if (data.status === 'error') {
          setCheckingUpdate(false);
          setUpdateResult({
            status: 'error',
            message: data.message || 'No se pudo conectar con el servidor de actualizaciones en GitHub.'
          });
        }
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [currentAppVersion, updateResult.latestVersion]);

  // Check GitHub for latest release or electron-updater
  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateResult({ status: 'checking', message: 'Consultando versiones en GitHub...' });
    setDownloadMetrics(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electron = (window as any).electronAPI;
    if (electron?.checkForUpdates) {
      try {
        const res = await electron.checkForUpdates();
        if (res.status === 'error') {
          setUpdateResult({
            status: 'error',
            message: res.message || 'Error al consultar actualizaciones en GitHub.'
          });
        }
      } catch (err) {
        console.log('Error triggering check for updates:', err);
      } finally {
        setTimeout(() => setCheckingUpdate(false), 1500);
      }
      return;
    }

    try {
      let response = await fetch(
        'https://api.github.com/repos/ronnygiesbrecht75/Control-de-Vencimiento/releases/latest',
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );

      if (!response.ok) {
        response = await fetch(
          'https://api.github.com/repos/ronnygiesbrecht75/control-facturas-vencimiento/releases/latest',
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        );
      }

      if (response.ok) {
        const data = await response.json();
        const tag = (data.tag_name || '').replace(/^v/, '');
        
        if (tag && tag !== currentAppVersion && tag > currentAppVersion) {
          setUpdateResult({
            status: 'available',
            message: `¡Hay una nueva versión disponible! (v${tag}). En la versión instalada para PC se descargará automáticamente.`,
            latestVersion: tag
          });
          setDownloadMetrics({
            percent: 100,
            version: tag
          });
        } else {
          setUpdateResult({
            status: 'up-to-date',
            message: `Tienes instalada la versión más reciente (v${currentAppVersion}). No hay actualizaciones pendientes.`
          });
        }
      } else {
        setTimeout(() => {
          setUpdateResult({
            status: 'up-to-date',
            message: `La versión actual v${currentAppVersion} está al día.`
          });
        }, 600);
      }
    } catch {
      setTimeout(() => {
        setUpdateResult({
          status: 'up-to-date',
          message: `La versión instalada v${currentAppVersion} está al día.`
        });
      }, 600);
    } finally {
      setTimeout(() => {
        setCheckingUpdate(false);
      }, 1000);
    }
  };

  const handleRestartAndInstall = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electron = (window as any).electronAPI;
    if (electron?.restartAndInstall) {
      electron.restartAndInstall();
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      version: currentAppVersion,
      exportDate: new Date().toISOString(),
      invoices,
      catalog
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_facturas_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.invoices) && Array.isArray(parsed.catalog)) {
          if (window.confirm(`Se importarán ${parsed.invoices.length} facturas y ${parsed.catalog.length} productos del catálogo. ¿Deseas continuar?`)) {
            if (onImportData) {
              onImportData(parsed.invoices, parsed.catalog);
              alert('¡Copia de seguridad restaurada con éxito!');
            }
          }
        } else {
          alert('El archivo no contiene un formato de respaldo válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo de respaldo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-8 text-xs">
      
      {/* 1. SECCIÓN DE APARIENCIA / TEMA */}
      <section className="bg-white dark:bg-[#282a2c] p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-xs space-y-3 transition-colors">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#f1f3f4] flex items-center gap-1.5">
            <span>Tema y Apariencia</span>
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-[#9aa0a6] mt-0.5">
            Personaliza cómo se visualiza la aplicación en tu pantalla
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
          {/* Modo Claro */}
          <button
            onClick={() => onThemeChange('light')}
            className={`p-3 rounded-lg border text-left flex flex-col justify-between gap-2 transition cursor-pointer ${
              currentTheme === 'light'
                ? 'border-[#107c41] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xs'
                : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300 dark:hover:border-[#5f6368] bg-white dark:bg-[#282a2c]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-md ${currentTheme === 'light' ? 'bg-[#107c41] text-white' : 'bg-gray-100 dark:bg-[#1e1f20] text-gray-600 dark:text-[#e3e3e3]'}`}>
                <Sun className="w-4 h-4" />
              </div>
              {currentTheme === 'light' && (
                <span className="text-[10px] font-bold text-[#107c41] bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-xs text-gray-900 dark:text-[#f1f3f4]">Modo Claro</div>
              <div className="text-[10px] text-gray-500 dark:text-[#9aa0a6] mt-0.5">Fondo blanco nítido y alto contraste</div>
            </div>
          </button>

          {/* Modo Noche */}
          <button
            onClick={() => onThemeChange('dark')}
            className={`p-3 rounded-lg border text-left flex flex-col justify-between gap-2 transition cursor-pointer ${
              currentTheme === 'dark'
                ? 'border-[#107c41] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xs'
                : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300 dark:hover:border-[#5f6368] bg-white dark:bg-[#282a2c]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-md ${currentTheme === 'dark' ? 'bg-[#107c41] text-white' : 'bg-gray-100 dark:bg-[#1e1f20] text-gray-600 dark:text-[#e3e3e3]'}`}>
                <Moon className="w-4 h-4" />
              </div>
              {currentTheme === 'dark' && (
                <span className="text-[10px] font-bold text-[#107c41] bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-xs text-gray-900 dark:text-[#f1f3f4]">Modo Noche (Oscuro)</div>
              <div className="text-[10px] text-gray-500 dark:text-[#9aa0a6] mt-0.5">Reduce la fatiga visual nocturna</div>
            </div>
          </button>

          {/* Modo Sistema */}
          <button
            onClick={() => onThemeChange('system')}
            className={`p-3 rounded-lg border text-left flex flex-col justify-between gap-2 transition cursor-pointer ${
              currentTheme === 'system'
                ? 'border-[#107c41] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xs'
                : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300 dark:hover:border-[#5f6368] bg-white dark:bg-[#282a2c]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-md ${currentTheme === 'system' ? 'bg-[#107c41] text-white' : 'bg-gray-100 dark:bg-[#1e1f20] text-gray-600 dark:text-[#e3e3e3]'}`}>
                <Laptop className="w-4 h-4" />
              </div>
              {currentTheme === 'system' && (
                <span className="text-[10px] font-bold text-[#107c41] bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-xs text-gray-900 dark:text-[#f1f3f4]">Automático / Sistema</div>
              <div className="text-[10px] text-gray-500 dark:text-[#9aa0a6] mt-0.5">Sigue la configuración de Windows</div>
            </div>
          </button>
        </div>
      </section>

      {/* 2. SECCIÓN DE VERSIÓN Y ACTUALIZACIONES */}
      <section className="bg-white dark:bg-[#282a2c] p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-xs space-y-3 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#f1f3f4] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#107c41]" />
              <span>Versión del Software y Actualizaciones</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-[#9aa0a6] mt-0.5">
              Control de versiones instaladas y comprobación de nuevas mejoras
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Versión:</span>
            <span className="text-[11px] font-bold font-mono text-[#107c41] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/70 px-1.5 py-0.5 rounded">
              v{currentAppVersion}
            </span>
          </div>
        </div>

        {/* Tarjeta de estado de actualización */}
        <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-[#1e1f20] border border-gray-200 dark:border-[#3c4043] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#107c41] animate-pulse"></div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-[#f1f3f4]">
                Control de Facturas y Vencimiento de Productos
              </h4>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                Auto-Updater Activo
              </span>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-[#bdc1c6]">
              Canal de actualización directa desde GitHub Releases (<span className="font-mono text-gray-700 dark:text-gray-300">ronnygiesbrecht75/Control-de-Vencimiento</span>).
            </p>
          </div>

          <button
            id="btn-check-updates"
            onClick={handleCheckUpdate}
            disabled={checkingUpdate || updateResult.status === 'downloading'}
            className="w-full sm:w-auto bg-[#107c41] hover:bg-[#0d6334] text-white text-[11px] font-semibold px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-100 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? 'Verificando...' : 'Buscar Actualizaciones'}</span>
          </button>
        </div>

        {/* Panel en Vivo: Descarga de Actualización y Estados */}
        {updateResult.status && (
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-3 text-[11px] transition-all shadow-xs ${
              updateResult.status === 'downloading' || updateResult.status === 'available'
                ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100'
                : updateResult.status === 'downloaded'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                : updateResult.status === 'error'
                ? 'bg-red-50/70 dark:bg-red-950/25 border-red-300 dark:border-red-800 text-red-950 dark:text-red-100'
                : updateResult.status === 'checking'
                ? 'bg-blue-50/70 dark:bg-blue-950/25 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
                : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            {/* Cabecera del Estado */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {updateResult.status === 'downloading' ? (
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg animate-pulse shrink-0 mt-0.5">
                    <DownloadCloud className="w-4 h-4" />
                  </div>
                ) : updateResult.status === 'available' ? (
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
                    <ArrowUpCircle className="w-4 h-4" />
                  </div>
                ) : updateResult.status === 'downloaded' ? (
                  <div className="p-1.5 bg-[#107c41] text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : updateResult.status === 'checking' ? (
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                ) : updateResult.status === 'error' ? (
                  <div className="p-1.5 bg-red-600 text-white rounded-lg shrink-0 mt-0.5">
                    <X className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 bg-[#107c41] text-white rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-0.5">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>
                      {updateResult.status === 'available'
                        ? '¡Nueva Versión Encontrada!'
                        : updateResult.status === 'downloading'
                        ? 'Descargando Nueva Versión...'
                        : updateResult.status === 'downloaded'
                        ? '¡Actualización Descargada y Lista para Instalar!'
                        : updateResult.status === 'checking'
                        ? 'Verificando con GitHub...'
                        : updateResult.status === 'error'
                        ? 'Aviso de Actualización'
                        : 'Sistema al Día'}
                    </span>
                    {updateResult.latestVersion && (
                      <span className="font-mono text-[10px] bg-white/80 dark:bg-black/40 px-1.5 py-0.5 rounded border border-current/20 font-bold">
                        v{updateResult.latestVersion}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {updateResult.message}
                  </p>
                </div>
              </div>
            </div>

            {/* SEGUIMIENTO EN VIVO DE LA DESCARGA (Barra, Porcentaje, MBs y Velocidad) */}
            {(updateResult.status === 'downloading' || (downloadMetrics && downloadMetrics.percent > 0 && updateResult.status !== 'downloaded')) && (
              <div className="bg-white/90 dark:bg-[#1e1f20]/90 rounded-lg p-3 border border-amber-200/80 dark:border-amber-800/40 space-y-2.5 mt-1">
                {/* Cabecera del Progreso */}
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-gray-800 dark:text-[#e3e3e3] flex items-center gap-1.5">
                    <DownloadCloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Progreso del instalador Windows</span>
                  </div>
                  <div className="font-mono font-bold text-amber-700 dark:text-amber-300 text-sm">
                    {downloadMetrics ? `${downloadMetrics.percent}%` : '0%'}
                  </div>
                </div>

                {/* Barra de progreso interactiva */}
                <div className="w-full bg-gray-200 dark:bg-[#333538] rounded-full h-3 overflow-hidden p-0.5 relative shadow-inner">
                  <div 
                    className="bg-linear-to-r from-amber-500 via-[#107c41] to-emerald-500 h-full rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${downloadMetrics ? Math.max(4, downloadMetrics.percent) : 4}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>

                {/* Tarjetas de Métricas de Transferencia */}
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  <div className="bg-gray-50 dark:bg-[#282a2c] p-2 rounded-md border border-gray-200/70 dark:border-[#3c4043]">
                    <div className="text-[9px] text-gray-500 dark:text-[#9aa0a6] flex items-center gap-1 font-medium">
                      <HardDrive className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Transferido</span>
                    </div>
                    <div className="text-[11px] font-bold font-mono text-gray-900 dark:text-[#f1f3f4] mt-0.5">
                      {downloadMetrics?.transferred && downloadMetrics?.total
                        ? `${downloadMetrics.transferred} / ${downloadMetrics.total}`
                        : `${downloadMetrics?.percent || 0}%`}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#282a2c] p-2 rounded-md border border-gray-200/70 dark:border-[#3c4043]">
                    <div className="text-[9px] text-gray-500 dark:text-[#9aa0a6] flex items-center gap-1 font-medium">
                      <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Velocidad</span>
                    </div>
                    <div className="text-[11px] font-bold font-mono text-gray-900 dark:text-[#f1f3f4] mt-0.5">
                      {downloadMetrics?.speed || 'Descargando...'}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#282a2c] p-2 rounded-md border border-gray-200/70 dark:border-[#3c4043]">
                    <div className="text-[9px] text-gray-500 dark:text-[#9aa0a6] flex items-center gap-1 font-medium">
                      <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Destino</span>
                    </div>
                    <div className="text-[11px] font-bold font-mono text-gray-900 dark:text-[#f1f3f4] mt-0.5 truncate">
                      {downloadMetrics?.version ? `v${downloadMetrics.version}` : `v${currentAppVersion}`}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 dark:text-[#9aa0a6] flex items-center gap-1 italic">
                  <span>💡 La descarga se realiza en segundo plano de forma segura. Puedes seguir registrando facturas con total normalidad.</span>
                </div>
              </div>
            )}

            {/* ACCIÓN CUANDO LA DESCARGA ESTÁ LISTA (v100% completada) */}
            {updateResult.status === 'downloaded' && (
              <div className="bg-white/95 dark:bg-[#1e1f20]/95 p-3 rounded-lg border border-emerald-300 dark:border-emerald-800/60 space-y-2 mt-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-gray-900 dark:text-[#f1f3f4] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#107c41] dark:text-emerald-400" />
                    <span>Instalador descargado y verificado</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#107c41] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    100% Completado
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 dark:text-[#bdc1c6]">
                  La nueva versión se encuentra lista para aplicarse. Puedes reiniciar ahora para actualizar al instante, o continuar trabajando y se actualizará sola la próxima vez que inicies la app.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestartAndInstall}
                    className="bg-[#107c41] hover:bg-[#0d6334] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reiniciar y Aplicar Actualización Ahora</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. SECCIÓN DE COPIAS DE SEGURIDAD Y DATOS */}
      <section className="bg-white dark:bg-[#282a2c] p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-xs space-y-3 transition-colors">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#f1f3f4] flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#107c41]" />
            <span>Copia de Seguridad y Datos Almacenados</span>
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-[#9aa0a6] mt-0.5">
            Respalda tus facturas y catálogo o restáuralos en otra computadora
          </p>
        </div>

        {/* Resumen de Registros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-gray-50 dark:bg-[#1e1f20] p-2.5 rounded-lg border border-gray-200 dark:border-[#3c4043]">
            <div className="text-[10px] text-gray-500 dark:text-[#9aa0a6] font-medium">Facturas Almacenadas</div>
            <div className="text-sm font-bold font-mono text-gray-900 dark:text-[#f1f3f4] mt-0.5">
              {invoices.length} filas
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#1e1f20] p-2.5 rounded-lg border border-gray-200 dark:border-[#3c4043]">
            <div className="text-[10px] text-gray-500 dark:text-[#9aa0a6] font-medium">Catálogo de Productos</div>
            <div className="text-sm font-bold font-mono text-gray-900 dark:text-[#f1f3f4] mt-0.5">
              {catalog.length} productos
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-[#1e1f20] p-2.5 rounded-lg border border-gray-200 dark:border-[#3c4043]">
            <div className="text-[10px] text-gray-500 dark:text-[#9aa0a6] font-medium">Almacenamiento Local</div>
            <div className="text-sm font-bold font-mono text-[#107c41] dark:text-emerald-400 mt-0.5">
              Seguro &bull; Activo
            </div>
          </div>
        </div>

        {/* Botones de Backup */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="bg-white dark:bg-[#1e1f20] hover:bg-gray-50 dark:hover:bg-[#333538] text-gray-800 dark:text-[#e3e3e3] border border-gray-300 dark:border-[#3c4043] text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>

          <label className="bg-white dark:bg-[#1e1f20] hover:bg-gray-50 dark:hover:bg-[#333538] text-gray-800 dark:text-[#e3e3e3] border border-gray-300 dark:border-[#3c4043] text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Restaurar Copia de Seguridad</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </section>

    </div>
  );
};
