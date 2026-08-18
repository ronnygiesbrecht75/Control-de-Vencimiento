import React from 'react';
import { 
  RotateCcw
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  onExportExcel?: () => void;
  onResetData: () => void;
  activeTab: ActiveTab;
  invoiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onResetData,
  activeTab,
  invoiceCount,
}) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'registro':
        return {
          title: 'Tabla de Facturas Registradas',
          subtitle: `${invoiceCount} registros cargados con cálculo de vencimiento`
        };
      case 'agregar':
        return {
          title: 'Cargar Nueva Factura',
          subtitle: 'Ingreso rápido con autocompletado y cálculo automático'
        };
      case 'productos':
        return {
          title: 'Catálogo de Productos',
          subtitle: 'Configuración de nombres y plazos de vencimiento'
        };
      case 'ajustes':
        return {
          title: 'Ajustes y Configuración del Sistema',
          subtitle: 'Tema visual, versión del software y copias de seguridad'
        };
      default:
        return {
          title: 'Control de Facturas',
          subtitle: 'Sistema de Gestión'
        };
    }
  };

  const info = getTabInfo();

  return (
    <header className="bg-[#107c41] text-white border-b border-[#0d6334] px-6 py-3 shadow-md hidden lg:flex items-center justify-between">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {info.title}
        </h2>
        <p className="text-xs text-emerald-100 font-medium">
          {info.subtitle}
        </p>
      </div>

      {/* Quick Actions in Green Header */}
      <div className="flex items-center gap-2.5">
        <button
          id="header-btn-reiniciar-datos"
          onClick={onResetData}
          className="bg-[#0d6334] hover:bg-[#084c26] text-emerald-100 hover:text-white p-1.5 rounded-lg text-xs transition cursor-pointer border border-emerald-600/40"
          title="Reiniciar datos de muestra"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
