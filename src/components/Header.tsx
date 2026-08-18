import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  RotateCcw
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  onExportExcel: () => void;
  onResetData: () => void;
  activeTab: ActiveTab;
  invoiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onExportExcel,
  onResetData,
}) => {
  return (
    <header className="bg-[#107c41] text-white shadow-md border-b border-[#0d6334]">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-wrap justify-between items-center gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-800/80 p-2.5 rounded-xl border border-emerald-600/40 shadow-inner flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Control de Facturas y Vencimiento de Prod.
              </h1>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium">
              Registro simplificado y agrupado por productos
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel (.xlsx) */}
          <button
            id="header-btn-descargar-excel"
            onClick={onExportExcel}
            className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition shadow border border-emerald-700"
            title="Descargar libro en archivo Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span className="hidden md:inline">Descargar Excel (.xlsx)</span>
            <span className="md:hidden">Excel</span>
          </button>

          {/* Reset / Reload Demo Data */}
          <button
            id="header-btn-reiniciar-datos"
            onClick={onResetData}
            className="bg-emerald-900/40 hover:bg-emerald-900/80 text-emerald-200 hover:text-white p-2 rounded-lg text-sm transition"
            title="Reiniciar datos de muestra"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
