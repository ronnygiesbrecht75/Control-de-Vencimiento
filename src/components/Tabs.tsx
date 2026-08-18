import React from 'react';
import { 
  Table, 
  PlusCircle, 
  Boxes 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface TabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  invoiceCount: number;
  catalogCount: number;
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab,
  onTabChange,
  invoiceCount,
  catalogCount
}) => {
  const tabs = [
    {
      id: 'registro' as ActiveTab,
      label: 'Tabla de Facturas',
      icon: Table,
      badge: invoiceCount,
      badgeColor: 'bg-emerald-100 text-[#107c41]'
    },
    {
      id: 'agregar' as ActiveTab,
      label: 'Agregar Factura',
      icon: PlusCircle,
      badge: null
    },
    {
      id: 'productos' as ActiveTab,
      label: 'Catálogo de Productos',
      icon: Boxes,
      badge: catalogCount,
      badgeColor: 'bg-gray-100 text-gray-700'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-xs sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'border-[#107c41] text-[#107c41] bg-emerald-50/40'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#107c41]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ml-0.5 ${
                    isActive ? tab.badgeColor : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
