import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUpDown, 
  FolderOpen,
  X
} from 'lucide-react';
import { InvoiceItem } from '../types';
import { formatDateVenta, formatDateShort } from '../utils/formatters';

interface InvoiceTableProps {
  invoices: InvoiceItem[];
  onDeleteInvoice: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  onEditInvoice: (item: InvoiceItem) => void;
  onAddNew: () => void;
  onExportExcel: () => void;
}

type SortField = 'numFactura' | 'tipoFactura' | 'fechaVenta' | 'fechaElaboracion' | 'vencimiento' | 'cliente' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onDeleteInvoice,
  onEditInvoice,
  onAddNew,
  onExportExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Extract unique products and clients for filter pills
  const uniqueProducts = useMemo(() => {
    return Array.from(new Set(invoices.map(i => i.tipoFactura).filter(Boolean))).sort();
  }, [invoices]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(invoices.map(i => i.cliente).filter(Boolean))).sort();
  }, [invoices]);

  const uniqueInvoicesCount = useMemo(() => {
    return new Set(invoices.map(i => i.numFactura)).size;
  }, [invoices]);

  // Filter & Sort
  const filteredInvoices = useMemo(() => {
    let result = invoices.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        item.numFactura.toLowerCase().includes(q) ||
        item.tipoFactura.toLowerCase().includes(q) ||
        item.cliente.toLowerCase().includes(q) ||
        item.fechaVenta.includes(q) ||
        item.fechaElaboracion.includes(q) ||
        item.vencimiento.includes(q)
      );

      const matchesProduct = !productFilter || item.tipoFactura === productFilter;
      const matchesClient = !clientFilter || item.cliente === clientFilter;

      return matchesSearch && matchesProduct && matchesClient;
    });

    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, searchTerm, productFilter, clientFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Group invoice rows visually by invoice number
  let lastNumFactura = '';
  let groupBgToggle = false;

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-[260px] sm:min-w-[320px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="invoice-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Nº Factura, Producto, Cliente, Fecha..."
              className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAddNew}
              className="bg-[#107c41] hover:bg-[#0d6334] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar Factura</span>
            </button>
          </div>
        </div>

        {/* Secondary filters & summary stats */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600 gap-2">
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Product Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#107c41]"
            >
              <option value="">Todos los Productos ({uniqueProducts.length})</option>
              {uniqueProducts.map(prod => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>

            {/* Client Filter */}
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#107c41]"
            >
              <option value="">Todos los Clientes ({uniqueClients.length})</option>
              {uniqueClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {(productFilter || clientFilter) && (
              <button
                onClick={() => { setProductFilter(''); setClientFilter(''); }}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 hover:underline"
              >
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 font-medium">
            <span>
              Filas mostradas: <b className="text-gray-900 font-bold">{filteredInvoices.length}</b>
              {filteredInvoices.length !== invoices.length && ` de ${invoices.length}`}
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Facturas: <b className="text-[#107c41] font-bold">{uniqueInvoicesCount}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#107c41] text-white text-[11px] font-semibold tracking-wider uppercase border-b border-[#0d6334]">
                {/* Column 1: Nº DE FACTURA */}
                <th 
                  onClick={() => handleSort('numFactura')}
                  className="py-1.5 px-2.5 border-r border-[#0d6334] cursor-pointer hover:bg-emerald-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Nº DE FACTURA</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                  </div>
                </th>

                {/* Column 2: TIPO DE FACTURA (PRODUCTO) */}
                <th 
                  onClick={() => handleSort('tipoFactura')}
                  className="py-1.5 px-2.5 border-r border-[#0d6334] cursor-pointer hover:bg-emerald-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>TIPO DE FACTURA (PRODUCTO)</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                  </div>
                </th>

                {/* Column 3: FECHA DE VENTA */}
                <th 
                  onClick={() => handleSort('fechaVenta')}
                  className="py-1.5 px-2.5 border-r border-[#0d6334] cursor-pointer hover:bg-emerald-800 transition select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>FECHA DE VENTA</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                  </div>
                </th>

                {/* Column 4: FECHA DE ELABORACION */}
                <th 
                  onClick={() => handleSort('fechaElaboracion')}
                  className="py-1.5 px-2.5 border-r border-[#0d6334] cursor-pointer hover:bg-emerald-800 transition select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>FECHA DE ELABORACIÓN</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                  </div>
                </th>

                {/* Column 5: FECHA DE VENCIMIENTO */}
                <th 
                  onClick={() => handleSort('vencimiento')}
                  className="py-1.5 px-2.5 border-r border-[#0d6334] cursor-pointer hover:bg-emerald-800 transition select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>FECHA DE VENCIMIENTO</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                  </div>
                </th>

                {/* Column 6: CLIENTE */}
                <th 
                  onClick={() => handleSort('cliente')}
                  className="py-1.5 px-2.5 border-r border-[#0d6334] cursor-pointer hover:bg-emerald-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>CLIENTE</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                  </div>
                </th>

                {/* Column 7: ACCIONES */}
                <th className="py-1.5 px-2.5 text-center w-20">
                  ACCIONES
                </th>
              </tr>
            </thead>

            <tbody className="text-xs divide-y divide-gray-200 font-sans">
              {filteredInvoices.map((item) => {
                // Group row alternating background
                if (item.numFactura !== lastNumFactura) {
                  groupBgToggle = !groupBgToggle;
                  lastNumFactura = item.numFactura;
                }

                return (
                  <tr
                    key={item.id}
                    className={`transition hover:bg-emerald-50/70 ${
                      groupBgToggle
                        ? 'bg-emerald-50/20'
                        : 'bg-white'
                    }`}
                  >
                    {/* Nº Factura */}
                    <td className="py-1 px-2.5 font-medium font-mono text-gray-800 border-r border-gray-100 whitespace-nowrap">
                      {item.numFactura}
                    </td>

                    {/* Tipo de Factura / Producto */}
                    <td className="py-1 px-2.5 font-normal text-gray-800 border-r border-gray-100">
                      {item.tipoFactura}
                    </td>

                    {/* Fecha de Venta (DD,MM,YY) */}
                    <td className="py-1 px-2.5 font-normal text-gray-700 border-r border-gray-100 whitespace-nowrap">
                      {formatDateShort(item.fechaVenta)}
                    </td>

                    {/* Fecha Elaboracion (DD,MM,YY) */}
                    <td className="py-1 px-2.5 font-normal text-gray-700 border-r border-gray-100 whitespace-nowrap">
                      {formatDateShort(item.fechaElaboracion)}
                    </td>

                    {/* Vencimiento (DD,MM,YY) */}
                    <td className="py-1 px-2.5 font-normal text-gray-700 border-r border-gray-100 whitespace-nowrap">
                      {formatDateShort(item.vencimiento)}
                    </td>

                    {/* Cliente */}
                    <td className="py-1 px-2.5 font-normal text-gray-800 border-r border-gray-100">
                      {item.cliente}
                    </td>

                    {/* Acciones */}
                    <td className="py-1 px-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditInvoice(item)}
                          className="p-0.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                          title="Editar fila"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(item.id)}
                          className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">No se encontraron facturas</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {searchTerm || productFilter || clientFilter
                  ? 'No hay registros que coincidan con los filtros aplicados.'
                  : 'Aún no hay facturas registradas en el libro.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onAddNew}
                className="bg-[#107c41] hover:bg-[#0d6334] text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cargar Nueva Factura</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
