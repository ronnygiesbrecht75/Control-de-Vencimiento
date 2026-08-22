import React from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  onExportExcel?: () => void;
  activeTab: ActiveTab;
  invoiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
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
    </header>
  );
};

