import React from 'react';
import { Trash2, AlertTriangle, X, ShieldCheck, Download } from 'lucide-react';
import { InvoiceItem } from '../types';

interface ConfirmClearInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoicesCount: number;
  catalogCount: number;
  onExportBackup?: () => void;
}

export const ConfirmClearInvoicesModal: React.FC<ConfirmClearInvoicesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoicesCount,
  catalogCount,
  onExportBackup
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-[#282a2c] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden transform transition-all text-xs"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera de Advertencia */}
        <div className="bg-red-50 dark:bg-red-950/40 p-4 border-b border-red-200 dark:border-red-900/50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                Eliminar Todas las Facturas
              </h3>
              <p className="text-[11px] text-red-700 dark:text-red-300">
                Acción de limpieza de registros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-black/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-xs">
                ¿Estás seguro de que deseas eliminar todas las facturas registradas?
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Se borrarán permanentemente las <span className="font-bold font-mono">{invoicesCount} facturas</span> cargadas en el sistema.
              </p>
            </div>
          </div>

          {/* Información sobre el Catálogo Preservado */}
          <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-[#107c41] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-xs">
                El Catálogo de Productos NO se borrará
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Tus <span className="font-bold font-mono">{catalogCount} productos</span> con sus respectivos plazos de vencimiento permanecerán totalmente guardados y disponibles.
              </p>
            </div>
          </div>

          {/* Opción de descargar copia antes */}
          {onExportBackup && invoicesCount > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-[#1e1f20] rounded-xl border border-gray-200 dark:border-[#3c4043]">
              <span className="text-[11px] text-gray-600 dark:text-[#bdc1c6]">
                ¿Deseas guardar una copia antes?
              </span>
              <button
                type="button"
                onClick={onExportBackup}
                className="bg-white dark:bg-[#282a2c] hover:bg-gray-100 dark:hover:bg-[#333538] text-gray-800 dark:text-[#e3e3e3] border border-gray-300 dark:border-[#3c4043] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Descargar Copia</span>
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="bg-gray-50 dark:bg-[#1e1f20] px-5 py-3 border-t border-gray-200 dark:border-[#3c4043] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-gray-700 dark:text-[#bdc1c6] hover:bg-gray-200 dark:hover:bg-[#333538] font-semibold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sí, Eliminar Facturas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
