import * as XLSX from 'xlsx';
import { InvoiceItem } from '../types';
import { formatDateVenta, formatDateShort } from './formatters';

export function exportInvoicesToExcel(invoices: InvoiceItem[], filename?: string): void {
  if (invoices.length === 0) return;

  const rows = invoices.map(item => ({
    'Nº DE FACTURA': item.numFactura,
    'TIPO DE FACTURA': item.tipoFactura,
    'FECHA DE VENTA': formatDateShort(item.fechaVenta),
    'FECHA DE ELABORACION': formatDateShort(item.fechaElaboracion),
    'VENCIMIENTO': formatDateShort(item.vencimiento),
    'CLIENTE': item.cliente
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 22 }, // Nº DE FACTURA
    { wch: 30 }, // TIPO DE FACTURA
    { wch: 18 }, // FECHA DE VENTA
    { wch: 24 }, // FECHA DE ELABORACION
    { wch: 18 }, // VENCIMIENTO
    { wch: 28 }  // CLIENTE
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
  const dateSuffix = new Date().toISOString().slice(0, 10);
  const actualFilename = filename || `Registro_Facturas_${dateSuffix}.xlsx`;

  XLSX.writeFile(wb, actualFilename);
}

export function parseExcelFile(file: File): Promise<InvoiceItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        const importedItems: InvoiceItem[] = [];

        for (let i = 0; i < rawJson.length; i++) {
          const row = rawJson[i];
          // Look for invoice number with various possible header names
          const numFactura = (row['Nº DE FACTURA'] || row['NUMERO DE FACTURA'] || row['FACTURA'] || row['NRO FACTURA'] || row['numFactura'] || '').toString().trim();
          const tipoFactura = (row['TIPO DE FACTURA'] || row['PRODUCTO'] || row['DESCRIPCION'] || row['tipoFactura'] || '').toString().trim().toUpperCase();
          let fechaVenta = (row['FECHA DE VENTA'] || row['FECHA VENTA'] || row['fechaVenta'] || '').toString().trim();
          let fechaElaboracion = (row['FECHA DE ELABORACION'] || row['FECHA ELABORACION'] || row['fechaElaboracion'] || '').toString().trim();
          let vencimiento = (row['VENCIMIENTO'] || row['FECHA VENCIMIENTO'] || row['vencimiento'] || '').toString().trim();
          const cliente = (row['CLIENTE'] || row['RAZON SOCIAL'] || row['cliente'] || '').toString().trim().toUpperCase();

          if (!numFactura && !tipoFactura) continue;

          // Helper to normalize dates to YYYY-MM-DD
          const normalizeDate = (val: any): string => {
            if (!val) return '';
            if (val instanceof Date && !isNaN(val.getTime())) {
              return val.toISOString().slice(0, 10);
            }
            const s = String(val).trim();
            // Match DD/MM/YYYY or DD-MM-YYYY
            const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
            if (dmy) {
              return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
            }
            // Match DD,MM,YY
            const shortDmy = s.match(/^(\d{1,2}),(\d{1,2}),(\d{2})$/);
            if (shortDmy) {
              const fullYear = 2000 + parseInt(shortDmy[3], 10);
              return `${fullYear}-${shortDmy[2].padStart(2, '0')}-${shortDmy[1].padStart(2, '0')}`;
            }
            // Match YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
            return '';
          };

          const normalizedVenta = normalizeDate(fechaVenta) || new Date().toISOString().slice(0, 10);
          const normalizedElab = normalizeDate(fechaElaboracion) || normalizedVenta;
          const normalizedVenc = normalizeDate(vencimiento) || normalizedVenta;

          importedItems.push({
            id: `imp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            numFactura: numFactura || '001-001-0000001',
            tipoFactura: tipoFactura || 'MERCADERIA',
            fechaVenta: normalizedVenta,
            fechaElaboracion: normalizedElab,
            vencimiento: normalizedVenc,
            cliente: cliente || 'CLIENTE MOSTRADOR',
            createdAt: Date.now() + i
          });
        }

        resolve(importedItems);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
