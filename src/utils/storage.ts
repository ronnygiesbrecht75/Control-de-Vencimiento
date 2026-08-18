import { InvoiceItem, CatalogProduct } from '../types';

export const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    numFactura: '001-009-0006431',
    tipoFactura: 'AVENA',
    fechaVenta: '2026-03-25',
    fechaElaboracion: '2026-03-23',
    vencimiento: '2027-03-23',
    cliente: 'OSORIO CALLE 2',
    createdAt: Date.now() - 100000
  },
  {
    id: 'inv-2',
    numFactura: '001-009-0006431',
    tipoFactura: 'MERCADERIAS VARIAS',
    fechaVenta: '2026-03-25',
    fechaElaboracion: '2026-03-23',
    vencimiento: '2027-03-23',
    cliente: 'OSORIO CALLE 2',
    createdAt: Date.now() - 90000
  },
  {
    id: 'inv-3',
    numFactura: '001-009-0006430',
    tipoFactura: 'HARINA',
    fechaVenta: '2026-03-24',
    fechaElaboracion: '2026-03-20',
    vencimiento: '2027-03-20',
    cliente: 'SUPERMERCADO CENTRAL',
    createdAt: Date.now() - 200000
  },
  {
    id: 'inv-4',
    numFactura: '001-009-0006430',
    tipoFactura: 'AZUCAR',
    fechaVenta: '2026-03-24',
    fechaElaboracion: '2026-03-20',
    vencimiento: '2027-03-20',
    cliente: 'SUPERMERCADO CENTRAL',
    createdAt: Date.now() - 190000
  }
];

export const INITIAL_CATALOG: CatalogProduct[] = [
  { id: 'cat-1', name: 'AVENA', plazoValor: 12, plazoUnidad: 'meses', usageCount: 15 },
  { id: 'cat-2', name: 'MERCADERIAS VARIAS', plazoValor: 6, plazoUnidad: 'meses', usageCount: 22 },
  { id: 'cat-3', name: 'TRIGO', plazoValor: 12, plazoUnidad: 'meses', usageCount: 8 },
  { id: 'cat-4', name: 'MAIZ', plazoValor: 12, plazoUnidad: 'meses', usageCount: 12 },
  { id: 'cat-5', name: 'HARINA', plazoValor: 6, plazoUnidad: 'meses', usageCount: 19 },
  { id: 'cat-6', name: 'AZUCAR', plazoValor: 24, plazoUnidad: 'meses', usageCount: 14 },
  { id: 'cat-7', name: 'ACEITE', plazoValor: 12, plazoUnidad: 'meses', usageCount: 10 },
  { id: 'cat-8', name: 'ARROZ', plazoValor: 12, plazoUnidad: 'meses', usageCount: 7 },
  { id: 'cat-9', name: 'LECHE EN POLVO', plazoValor: 180, plazoUnidad: 'dias', usageCount: 5 }
];

const INVOICES_STORAGE_KEY = 'facturas_py_invoices_v1';
const CATALOG_STORAGE_KEY = 'facturas_py_catalog_v1';

export function loadStoredInvoices(): InvoiceItem[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) return INITIAL_INVOICES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
}

export function saveStoredInvoices(invoices: InvoiceItem[]): void {
  try {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.error('Error saving invoices to localStorage:', err);
  }
}

export function loadStoredCatalog(): CatalogProduct[] {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return INITIAL_CATALOG;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: CatalogProduct) => ({
        ...item,
        plazoValor: item.plazoValor !== undefined ? Number(item.plazoValor) : 6,
        plazoUnidad: item.plazoUnidad || 'meses'
      }));
    }
    return INITIAL_CATALOG;
  } catch {
    return INITIAL_CATALOG;
  }
}

export function saveStoredCatalog(catalog: CatalogProduct[]): void {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
  } catch (err) {
    console.error('Error saving catalog to localStorage:', err);
  }
}
