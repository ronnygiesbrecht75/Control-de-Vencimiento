import React, { useState } from 'react';
import { 
  Table, 
  PlusCircle, 
  Boxes, 
  FileSpreadsheet, 
  Download, 
  RotateCcw,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  invoiceCount: number;
  catalogCount: number;
  onExportExcel: () => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  invoiceCount,
  catalogCount,
  onExportExcel,
  onResetData,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    {
      id: 'registro' as ActiveTab,
      label: 'Tabla de Facturas',
      icon: Table,
      badge: invoiceCount,
      description: 'Ver y filtrar registros'
    },
    {
      id: 'agregar' as ActiveTab,
      label: 'Agregar Factura',
      icon: PlusCircle,
      badge: null,
      description: 'Nueva factura con cálculo'
    },
    {
      id: 'productos' as ActiveTab,
      label: 'Catálogo de Productos',
      icon: Boxes,
      badge: catalogCount,
      description: 'Gestionar nombres y plazos'
    },
    {
      id: 'ajustes' as ActiveTab,
      label: 'Ajustes y Sistema',
      icon: Settings,
      badge: null,
      description: 'Tema, versiones y respaldo'
    }
  ];

  const handleSelectTab = (id: ActiveTab) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Barra superior en móviles con botón hamburguesa */}
      <div className="lg:hidden bg-[#107c41] text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30 border-b border-[#0d6334]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-[#0d6334] hover:bg-[#084c26] text-white cursor-pointer transition"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-sm">Control de Facturas</span>
          </div>
        </div>

        <button
          onClick={onExportExcel}
          className="bg-[#0d6334] hover:bg-[#084c26] text-white px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 border border-emerald-600/40 shadow-xs cursor-pointer font-medium"
        >
          <Download className="w-3.5 h-3.5 text-emerald-200" />
          <span>Excel</span>
        </button>
      </div>

      {/* Fondo oscuro móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Barra lateral verde fija (Sidebar) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 xl:w-72 shrink-0 bg-[#107c41] text-white border-r border-[#0d6334] flex flex-col shadow-xl lg:shadow-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-4 bg-[#0d6334] border-b border-[#084c26] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#107c41] p-2 rounded-xl border border-emerald-500/40 shadow-inner flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight text-white">Control de Facturas</h1>
                <p className="text-[11px] text-emerald-200/90 font-medium">Vencimiento de Productos</p>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-emerald-200 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Etiqueta de Sección */}
        <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-emerald-200/80 uppercase tracking-wider shrink-0">
          Pestañas de Navegación
        </div>

        {/* Botones de Pestañas Verticales (con scroll interno si es necesario) */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => handleSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#107c41] shadow-md font-bold'
                    : 'text-emerald-50 hover:bg-[#0d6334] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#107c41] text-white' : 'bg-emerald-900/60 text-emerald-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate text-xs">{tab.label}</div>
                    <div
                      className={`text-[10px] font-normal truncate ${
                        isActive ? 'text-emerald-800' : 'text-emerald-200/70'
                      }`}
                    >
                      {tab.description}
                    </div>
                  </div>
                </div>

                {tab.badge !== null && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-emerald-100 text-[#107c41]'
                        : 'bg-[#0d6334] text-emerald-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Área de Acciones Inferior Fija */}
        <div className="p-3 border-t border-[#0d6334] bg-[#0d6334]/60 space-y-2 shrink-0">
          {/* Botón Descargar Excel */}
          <button
            id="sidebar-btn-excel"
            onClick={onExportExcel}
            className="w-full bg-[#107c41] hover:bg-[#084c26] active:scale-[0.99] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer border border-emerald-500/40"
            title="Descargar tabla en formato Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Descargar Excel (.xlsx)</span>
          </button>

          {/* Botón Restablecer Datos */}
          <button
            id="sidebar-btn-reset"
            onClick={onResetData}
            className="w-full bg-emerald-900/40 hover:bg-emerald-900/80 text-emerald-100 hover:text-white text-xs font-medium py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-emerald-700/50 transition cursor-pointer"
            title="Reiniciar datos de muestra"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-200" />
            <span>Restablecer Datos</span>
          </button>

          {/* Versión */}
          <div className="pt-1 text-center text-[11px] text-emerald-200/80 font-medium font-mono">
            Control de Facturas &bull; v1.2
          </div>
        </div>
      </aside>
    </>
  );
};
