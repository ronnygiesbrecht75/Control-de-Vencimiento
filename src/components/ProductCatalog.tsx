import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Search, 
  Tag, 
  RotateCcw,
  Clock
} from 'lucide-react';
import { CatalogProduct, PlazoUnidad } from '../types';

interface ProductCatalogProps {
  catalog: CatalogProduct[];
  onAddProduct: (name: string, plazoValor: number, plazoUnidad: PlazoUnidad) => void;
  onUpdateProduct: (id: string, newName: string, plazoValor: number, plazoUnidad: PlazoUnidad) => void;
  onDeleteProduct: (id: string) => void;
  onResetCatalog: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  catalog,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetCatalog
}) => {
  const [newProductName, setNewProductName] = useState('');
  const [newPlazoValor, setNewPlazoValor] = useState<number | string>(12);
  const [newPlazoUnidad, setNewPlazoUnidad] = useState<PlazoUnidad>('meses');

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPlazoValor, setEditingPlazoValor] = useState<number | string>(12);
  const [editingPlazoUnidad, setEditingPlazoUnidad] = useState<PlazoUnidad>('meses');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newProductName.trim().toUpperCase();
    if (!clean) return;

    const val = Number(newPlazoValor) || 1;
    onAddProduct(clean, val, newPlazoUnidad);
    setNewProductName('');
    setNewPlazoValor(12);
    setNewPlazoUnidad('meses');
  };

  const startEdit = (item: CatalogProduct) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingPlazoValor(item.plazoValor ?? 12);
    setEditingPlazoUnidad(item.plazoUnidad || 'meses');
  };

  const saveEdit = (id: string) => {
    const clean = editingName.trim().toUpperCase();
    const val = Number(editingPlazoValor) || 1;
    if (clean) {
      onUpdateProduct(id, clean, val, editingPlazoUnidad);
    }
    setEditingId(null);
  };

  const filteredCatalog = catalog.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 pb-4 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-emerald-100 text-[#107c41] p-1.5 rounded-lg">
                <Boxes className="w-5 h-5" />
              </span>
              Catálogo de Productos y Plazos de Vencimiento
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure los productos y sus plazos por defecto (meses o días). Al cargar una factura, el cálculo de vencimiento se aplicará automáticamente.
            </p>
          </div>

          <button
            onClick={onResetCatalog}
            className="text-xs text-gray-500 hover:text-[#107c41] flex items-center gap-1 font-medium hover:underline cursor-pointer"
            title="Restablecer lista por defecto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer Catálogo</span>
          </button>
        </div>

        {/* Form to Add New Product */}
        <form
          onSubmit={handleAddSubmit}
          className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3"
        >
          <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#107c41]" />
            <span>Registrar Nuevo Producto en Catálogo</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Nombre */}
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-emerald-900 mb-1 uppercase tracking-wide">
                Nombre del Producto
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ej. AVENA, HARINA, DIESEL, AZUCAR..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm uppercase font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41]"
                />
              </div>
            </div>

            {/* Plazo / Vencimiento */}
            <div className="w-full sm:w-[220px]">
              <label className="block text-[11px] font-bold text-emerald-900 mb-1 uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Plazo de Vencimiento
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  required
                  min={1}
                  max={3650}
                  value={newPlazoValor}
                  onChange={(e) => setNewPlazoValor(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-20 bg-white border border-emerald-300 rounded-lg py-2 px-2 text-center text-sm font-bold text-emerald-950 font-mono focus:outline-none focus:ring-2 focus:ring-[#107c41]"
                />
                <select
                  value={newPlazoUnidad}
                  onChange={(e) => setNewPlazoUnidad(e.target.value as PlazoUnidad)}
                  className="flex-1 bg-white border border-emerald-300 rounded-lg py-2 px-2.5 text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] cursor-pointer"
                >
                  <option value="meses">Meses</option>
                  <option value="dias">Días</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#107c41] hover:bg-[#0d6334] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Producto</span>
            </button>
          </div>
        </form>

        {/* Search & List */}
        <div className="space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto en catálogo..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#107c41]"
              />
            </div>

            <span className="text-xs text-gray-500 font-medium">
              Total catálogo: <b className="text-gray-900">{filteredCatalog.length}</b> productos
            </span>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#107c41] text-white text-[11px] font-semibold tracking-wider uppercase border-b border-[#0d6334]">
                  <th className="py-1.5 px-2.5 w-12 text-center border-r border-[#0d6334]">#</th>
                  <th className="py-1.5 px-2.5 border-r border-[#0d6334]">NOMBRE DEL PRODUCTO</th>
                  <th className="py-1.5 px-2.5 text-center border-r border-[#0d6334] w-40">PLAZO / VENCIMIENTO</th>
                  <th className="py-1.5 px-2.5 text-center border-r border-[#0d6334] w-28">USO EN FACTURAS</th>
                  <th className="py-1.5 px-2.5 text-center w-20">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-200">
                {filteredCatalog.map((item, idx) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-emerald-50/40 transition">
                      <td className="py-1 px-2.5 text-center font-mono text-gray-400 border-r border-gray-100 font-normal">
                        {idx + 1}
                      </td>

                      {/* Product Name */}
                      <td className="py-1 px-2.5 font-normal text-gray-800 border-r border-gray-100">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(item.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-full bg-white border border-[#107c41] rounded px-2 py-0.5 uppercase text-xs font-normal text-gray-900"
                            autoFocus
                          />
                        ) : (
                          <span className="text-gray-800 font-normal">{item.name}</span>
                        )}
                      </td>

                      {/* Plazo / Vencimiento */}
                      <td className="py-1 px-2.5 text-center border-r border-gray-100">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={3650}
                              value={editingPlazoValor}
                              onChange={(e) => setEditingPlazoValor(e.target.value)}
                              className="w-14 bg-white border border-[#107c41] rounded px-1 py-0.5 text-center text-xs font-medium font-mono"
                            />
                            <select
                              value={editingPlazoUnidad}
                              onChange={(e) => setEditingPlazoUnidad(e.target.value as PlazoUnidad)}
                              className="bg-white border border-[#107c41] rounded px-1 py-0.5 text-xs font-medium"
                            >
                              <option value="meses">meses</option>
                              <option value="dias">días</option>
                            </select>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium text-xs font-mono border border-emerald-200/60">
                            <Clock className="w-3 h-3 text-[#107c41]" />
                            {item.plazoValor ?? 12} {item.plazoUnidad === 'dias' ? 'días' : 'meses'}
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-1 px-2.5 text-center border-r border-gray-100">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-normal text-[10px]">
                          {item.usageCount || 0} registros
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-1 px-2.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded hover:bg-emerald-50 cursor-pointer"
                              title="Guardar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-0.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Editar producto y plazo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(item.id)}
                              className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Eliminar de catálogo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredCatalog.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-xs font-medium">
                No se encontraron productos en el catálogo con el término "{searchTerm}".
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

