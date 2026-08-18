/**
 * Utility functions for date and invoice number formatting
 */

// Formats YYYY-MM-DD to DD/MM/YYYY (e.g. 15/08/2026)
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

export const formatDateVenta = formatDateDisplay;
export const formatDateShort = formatDateDisplay;


// Pads numbers with leading zeroes
export function padZeroes(val: string | number, length: number): string {
  const str = String(val || '').trim();
  if (!str) return '0'.repeat(length);
  return str.padStart(length, '0');
}

// Formats 3 parts into standardized Paraguay invoice number: SSS-PPP-NNNNNNN
export function formatInvoiceNumber(sucursal: string, caja: string, secuencia: string): string {
  const s = padZeroes(sucursal.replace(/\D/g, '') || '1', 3);
  const c = padZeroes(caja.replace(/\D/g, '') || '1', 3);
  const n = padZeroes(secuencia.replace(/\D/g, '') || '1', 7);
  return `${s}-${c}-${n}`;
}

// Parses "001-009-0006431" into { sucursal, caja, secuencia }
export function parseInvoiceNumber(numFactura: string): { sucursal: string; caja: string; secuencia: string } {
  const parts = (numFactura || '').split('-');
  return {
    sucursal: parts[0] || '001',
    caja: parts[1] || '001',
    secuencia: parts[2] || '0000001'
  };
}

// Increments sequence by 1: "0006431" -> "0006432"
export function incrementSequence(secuencia: string): string {
  const clean = secuencia.replace(/\D/g, '');
  const num = parseInt(clean || '0', 10) + 1;
  return String(num).padStart(7, '0');
}

// Gets today's date formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculates expiration date based on months to add (e.g. 6 months, 12 months, 24 months)
export function calculateExpirationByMonths(baseDateStr: string, monthsToAdd: number): string {
  if (!baseDateStr || !monthsToAdd || isNaN(monthsToAdd)) return '';
  const parts = baseDateStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return '';

  d.setMonth(d.getMonth() + monthsToAdd);

  const resYear = d.getFullYear();
  const resMonth = String(d.getMonth() + 1).padStart(2, '0');
  const resDay = String(d.getDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDay}`;
}

// Calculates expiration date based on days to add (e.g. 30 days, 90 days, 180 days)
export function calculateExpirationByDays(baseDateStr: string, daysToAdd: number): string {
  if (!baseDateStr || !daysToAdd || isNaN(daysToAdd)) return '';
  const parts = baseDateStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return '';

  d.setDate(d.getDate() + daysToAdd);

  const resYear = d.getFullYear();
  const resMonth = String(d.getMonth() + 1).padStart(2, '0');
  const resDay = String(d.getDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDay}`;
}

// Unified expiration calculator supporting 'meses' and 'dias'
export function calculateExpiration(
  baseDateStr: string,
  value: number,
  unit: 'meses' | 'dias' = 'meses'
): string {
  if (unit === 'dias') {
    return calculateExpirationByDays(baseDateStr, value);
  }
  return calculateExpirationByMonths(baseDateStr, value);
}

// Calculates expiration date (+1 year default from base date)
export function calculateExpirationDate(baseDateStr: string, yearsToAdd = 1): string {
  return calculateExpirationByMonths(baseDateStr, yearsToAdd * 12);
}

