import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceForm } from './components/InvoiceForm';
import { ProductCatalog } from './components/ProductCatalog';
import { EditInvoiceModal } from './components/EditInvoiceModal';

import { InvoiceItem, CatalogProduct, ActiveTab, PlazoUnidad } from './types';
import { 
  loadStoredInvoices, 
  saveStoredInvoices, 
  loadStoredCatalog, 
  saveStoredCatalog,
  INITIAL_INVOICES,
  INITIAL_CATALOG
} from './utils/storage';
import { exportInvoicesToExcel } from './utils/excel';

export default function App() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => loadStoredInvoices());
  const [catalog, setCatalog] = useState<CatalogProduct[]>(() => loadStoredCatalog());
  const [activeTab, setActiveTab] = useState<ActiveTab>('registro');

  // Modals
  const [editingInvoice, setEditingInvoice] = useState<InvoiceItem | null>(null);

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

  // Reset entire application data with demo records
  const handleResetAllData = () => {
    if (window.confirm('¿Desea reiniciar todos los registros con los datos de ejemplo iniciales?')) {
      setInvoices(INITIAL_INVOICES);
      setCatalog(INITIAL_CATALOG);
    }
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
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      
      {/* Top Header */}
      <Header
        onExportExcel={handleExportExcel}
        onResetData={handleResetAllData}
        activeTab={activeTab}
        invoiceCount={invoices.length}
      />

      {/* Main Sheet Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        invoiceCount={invoices.length}
        catalogCount={catalog.length}
      />

      {/* Sheet Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>Control de Facturas y Vencimiento de Prod. &bull; Sistema de Gestión</span>
          <span className="font-mono text-[11px] text-gray-400">Registro Simplificado</span>
        </div>
      </footer>

      {/* Edit Row Modal */}
      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          catalog={catalogWithUsage}
          onSave={handleUpdateInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}

    </div>
  );
}
