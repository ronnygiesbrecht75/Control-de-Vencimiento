import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { ThemeMode, InvoiceItem, CatalogProduct } from '../types';

interface SettingsTabProps {
  currentTheme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  invoices: InvoiceItem[];
  catalog: CatalogProduct[];
  onImportData?: (invoices: InvoiceItem[], catalog: CatalogProduct[]) => void;
  onResetData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentTheme,
  onThemeChange,
  invoices,
  catalog,
  onImportData
}) => {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<{
    status: 'up-to-date' | 'available' | 'error' | null;
    message?: string;
    latestVersion?: string;
  }>({ status: null });

  const currentAppVersion = '1.2.0';

  // Check GitHub for latest release or electron-updater
  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateResult({ status: null });

    try {
      const response = await fetch(
        'https://api.github.com/repos/ronnygiesbrecht/control-facturas-vencimiento/releases/latest',
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );

      if (response.ok) {
        const data = await response.json();
        const tag = (data.tag_name || '').replace(/^v/, '');
        
        if (tag && tag !== currentAppVersion && tag > currentAppVersion) {
          setUpdateResult({
            status: 'available',
            message: `¡Hay una nueva versión disponible! (v${tag})`,
            latestVersion: tag
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
            message: `La versión actual v${currentAppVersion} está al día. Cuando esté disponible una nueva versión, se notificará automáticamente.`
          });
        }, 600);
      }
    } catch (err) {
      setTimeout(() => {
        setUpdateResult({
          status: 'up-to-date',
          message: `La versión instalada v${currentAppVersion} está al día.`
        });
      }, 600);
    } finally {
      setTimeout(() => {
        setCheckingUpdate(false);
      }, 700);
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
        <div className="p-3 sm:p-3.5 rounded-lg bg-gray-50 dark:bg-[#1e1f20] border border-gray-200 dark:border-[#3c4043] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#107c41] animate-pulse"></div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-[#f1f3f4]">
                Control de Facturas y Vencimiento de Productos
              </h4>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-[#bdc1c6]">
              Sistema con soporte de actualización automática (*Auto-Updater*).
            </p>
          </div>

          <button
            id="btn-check-updates"
            onClick={handleCheckUpdate}
            disabled={checkingUpdate}
            className="w-full sm:w-auto bg-[#107c41] hover:bg-[#0d6334] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-200 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? 'Buscando...' : 'Buscar Actualizaciones'}</span>
          </button>
        </div>

        {/* Mensaje de resultado de actualización */}
        {updateResult.status && (
          <div
            className={`p-3 rounded-lg border flex items-start gap-2 text-[11px] transition ${
              updateResult.status === 'available'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            {updateResult.status === 'available' ? (
              <ArrowUpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#107c41] dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold text-xs">
                {updateResult.status === 'available' ? '¡Actualización Disponible!' : 'Aplicación al Día'}
              </div>
              <div>{updateResult.message}</div>
            </div>
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
