export interface InvoiceItem {
  id: string;
  numFactura: string;       // e.g. "001-009-0006431"
  tipoFactura: string;      // Product / Type e.g. "AVENA"
  fechaVenta: string;       // YYYY-MM-DD
  fechaElaboracion: string; // YYYY-MM-DD
  vencimiento: string;      // YYYY-MM-DD
  cliente: string;          // e.g. "OSORIO CALLE 2"
  createdAt?: number;
}

export type PlazoUnidad = 'meses' | 'dias';

export interface CatalogProduct {
  id: string;
  name: string;
  plazoValor?: number;         // e.g. 12, 6, 180, 30
  plazoUnidad?: PlazoUnidad;   // 'meses' | 'dias'
  category?: string;
  usageCount?: number;
}

export type ActiveTab = 'registro' | 'agregar' | 'productos' | 'ajustes';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  invoiceNum?: string;
  count?: number;
}
