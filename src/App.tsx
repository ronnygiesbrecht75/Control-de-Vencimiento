import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceForm } from './components/InvoiceForm';
import { ProductCatalog } from './components/ProductCatalog';
import { SettingsTab } from './components/SettingsTab';
import { EditInvoiceModal } from './components/EditInvoiceModal';
import { ConfirmClearInvoicesModal } from './components/ConfirmClearInvoicesModal';

import { InvoiceItem, CatalogProduct, ActiveTab, PlazoUnidad, ThemeMode } from './types';
import { 
  loadStoredInvoices, 
  saveStoredInvoices, 
  loadStoredCatalog, 
  saveStoredCatalog,
  INITIAL_INVOICES,
  INITIAL_CATALOG
} from './utils/storage';
import { getStoredTheme, saveStoredTheme, applyTheme } from './utils/theme';
import { exportInvoicesToExcel } from './utils/excel';

export default function App() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => loadStoredInvoices());
  const [catalog, setCatalog] = useState<CatalogProduct[]>(() => loadStoredCatalog());
  const [activeTab, setActiveTab] = useState<ActiveTab>('registro');
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // Modals
  const [editingInvoice, setEditingInvoice] = useState<InvoiceItem | null>(null);
  const [isClearInvoicesModalOpen, setIsClearInvoicesModalOpen] = useState(false);

  // Theme Sync & System changes listener
  useEffect(() => {
    applyTheme(theme);
    saveStoredTheme(theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  // Sync to local storage on changes
  useEffect(() => {
    saveStoredInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    saveStoredCatalog(catalog);
  }, [catalog]);

  // Compute catalog usage dynamically based on invoice rows
  const catalogWithUsage = useMemo(() => {
    const counts: Record<string, number> = {};
    invoices.forEach(i => {
      const name = i.tipoFactura.toUpperCase();
      counts[name] = (counts[name] || 0) + 1;
    });

    return catalog.map(c => ({
      ...c,
      usageCount: counts[c.name.toUpperCase()] || 0
    }));
  }, [invoices, catalog]);

  // Save new invoice items from the Form
  const handleSaveInvoice = (newItems: InvoiceItem[], newProductNames: string[]) => {
    setInvoices(prev => [...newItems, ...prev]);

    // Automatically add any new product names to catalog if not present
    setCatalog(prev => {
      const currentNames = new Set(prev.map(p => p.name.toUpperCase()));
      const toAdd: CatalogProduct[] = [];

      newProductNames.forEach(name => {
        const clean = name.trim().toUpperCase();
        if (clean && !currentNames.has(clean)) {
          currentNames.add(clean);
          toAdd.push({
            id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: clean,
            plazoValor: 12,
            plazoUnidad: 'meses',
            usageCount: 1
          });
        }
      });

      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  };

  // Delete an invoice row
  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Update a single invoice row
  const handleUpdateInvoice = (updated: InvoiceItem) => {
    setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));

    // Ensure edited product is also in catalog
    const prodName = updated.tipoFactura.trim().toUpperCase();
    if (prodName && !catalog.some(c => c.name.toUpperCase() === prodName)) {
      setCatalog(prev => [
        ...prev,
        {
          id: `cat-${Date.now()}`,
          name: prodName,
          plazoValor: 12,
          plazoUnidad: 'meses',
          usageCount: 1
        }
      ]);
    }
  };

  // Catalog actions
  const handleAddCatalogProduct = (name: string, plazoValor: number, plazoUnidad: PlazoUnidad) => {
    const clean = name.trim().toUpperCase();
    if (!clean) return;
    if (catalog.some(c => c.name.toUpperCase() === clean)) {
      alert('El producto ya se encuentra en el catálogo.');
      return;
    }
    setCatalog(prev => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name: clean,
        plazoValor: plazoValor || 12,
        plazoUnidad: plazoUnidad || 'meses',
        usageCount: 0
      }
    ]);
  };

  const handleUpdateCatalogProduct = (id: string, newName: string, plazoValor: number, plazoUnidad: PlazoUnidad) => {
    const clean = newName.trim().toUpperCase();
    if (!clean) return;
    setCatalog(prev => prev.map(c => c.id === id ? { 
      ...c, 
      name: clean,
      plazoValor: plazoValor || 12,
      plazoUnidad: plazoUnidad || 'meses'
    } : c));
  };

  const handleDeleteCatalogProduct = (id: string) => {
    setCatalog(prev => prev.filter(c => c.id !== id));
  };

  const handleResetCatalog = () => {
    if (window.confirm('¿Desea restablecer el catálogo de productos a la lista por defecto?')) {
      setCatalog(INITIAL_CATALOG);
    }
  };

  // Clear ALL registered invoices, keeping product catalog intact
  const handleConfirmClearInvoices = () => {
    setInvoices([]);
    saveStoredInvoices([]);
  };

  // Export backup JSON helper
  const handleExportBackup = () => {
    const backupData = {
      version: '1.2.7',
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

  // Import backup callback
  const handleImportBackupData = (importedInvoices: InvoiceItem[], importedCatalog: CatalogProduct[]) => {
    setInvoices(importedInvoices);
    setCatalog(importedCatalog);
  };

  // Excel Export
  const handleExportExcel = () => {
    if (invoices.length === 0) {
      alert('No hay facturas registradas para exportar.');
      return;
    }
    exportInvoicesToExcel(invoices);
  };

  // Get last registered invoice number to seed next increment
  const lastInvoiceNumber = invoices.length > 0 ? invoices[0].numFactura : '001-009-0006431';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#f8f9fa] dark:bg-[#1e1f20] text-gray-900 dark:text-[#e3e3e3] transition-colors">
      
      {/* Left Sidebar Navigation (Fixed & Non-scrolling) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        invoiceCount={invoices.length}
        catalogCount={catalog.length}
        onExportExcel={handleExportExcel}
        onResetData={() => setIsClearInvoicesModalOpen(true)}
      />

      {/* Main Content Area to the Right (Scrolls independently) */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col">
        {/* Top Header */}
        <div className="sticky top-0 z-20 shrink-0">
          <Header
            onExportExcel={handleExportExcel}
            activeTab={activeTab}
            invoiceCount={invoices.length}
          />
        </div>

        {/* Dynamic Sheet Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full max-w-[1600px] mx-auto">
          {activeTab === 'registro' && (
            <InvoiceTable
              invoices={invoices}
              onDeleteInvoice={handleDeleteInvoice}
              onEditInvoice={setEditingInvoice}
              onAddNew={() => setActiveTab('agregar')}
              onExportExcel={handleExportExcel}
            />
          )}

          {activeTab === 'agregar' && (
            <InvoiceForm
              catalog={catalogWithUsage}
              onSaveInvoice={handleSaveInvoice}
              onCancel={() => setActiveTab('registro')}
              lastInvoiceNumber={lastInvoiceNumber}
            />
          )}

          {activeTab === 'productos' && (
            <ProductCatalog
              catalog={catalogWithUsage}
              onAddProduct={handleAddCatalogProduct}
              onUpdateProduct={handleUpdateCatalogProduct}
              onDeleteProduct={handleDeleteCatalogProduct}
              onResetCatalog={handleResetCatalog}
            />
          )}

          {activeTab === 'ajustes' && (
            <SettingsTab
              currentTheme={theme}
              onThemeChange={setTheme}
              invoices={invoices}
              catalog={catalog}
              onImportData={handleImportBackupData}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-[#282a2c] border-t border-gray-200 dark:border-[#3c4043] py-2.5 px-6 text-xs text-gray-500 dark:text-[#9aa0a6] shrink-0 transition-colors">
          <div className="flex flex-wrap justify-between items-center gap-2 max-w-[1600px] mx-auto">
            <span>Control de Facturas y Vencimiento de Prod. &bull; Sistema de Gestión</span>
            <span className="font-mono text-[11px] text-gray-400 dark:text-[#80868b]">Excel Spreadsheets &bull; v1.2</span>
          </div>
        </footer>
      </div>

      {/* Edit Row Modal */}
      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          catalog={catalogWithUsage}
          onSave={handleUpdateInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}

      {/* Clear Invoices Confirmation Modal */}
      <ConfirmClearInvoicesModal
        isOpen={isClearInvoicesModalOpen}
        onClose={() => setIsClearInvoicesModalOpen(false)}
        onConfirm={handleConfirmClearInvoices}
        invoicesCount={invoices.length}
        catalogCount={catalog.length}
        onExportBackup={handleExportBackup}
      />

    </div>
  );
}
