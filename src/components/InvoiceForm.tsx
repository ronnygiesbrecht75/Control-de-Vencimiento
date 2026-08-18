import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  User, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  X
} from 'lucide-react';
import { InvoiceItem, CatalogProduct, PlazoUnidad } from '../types';
import { 
  getTodayDateString, 
  calculateExpiration,
  calculateExpirationByMonths, 
  calculateExpirationByDays,
  formatInvoiceNumber, 
  incrementSequence,
  padZeroes
} from '../utils/formatters';

interface InvoiceFormProps {
  catalog: CatalogProduct[];
  onSaveInvoice: (newItems: InvoiceItem[], newProducts: string[]) => void;
  onCancel: () => void;
  lastInvoiceNumber?: string;
}

interface ProductEntry {
  id: string;
  name: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  catalog,
  onSaveInvoice,
  onCancel,
  lastInvoiceNumber
}) => {
  // Invoice Number Parts
  const [sucursal, setSucursal] = useState('001');
  const [caja, setCaja] = useState('009');
  const [secuencia, setSecuencia] = useState('0006431');

  // Products array for this invoice
  const [products, setProducts] = useState<ProductEntry[]>([
    { id: 'p-1', name: '' }
  ]);

  // Active autocomplete index and keyboard selection state
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [dropdownFocusIndex, setDropdownFocusIndex] = useState<number>(-1);

  // Dates & Plazo
  const [fechaVenta, setFechaVenta] = useState(getTodayDateString());
  const [fechaElaboracion, setFechaElaboracion] = useState(getTodayDateString());
  const [plazoValor, setPlazoValor] = useState<number | string>(12);
  const [plazoUnidad, setPlazoUnidad] = useState<PlazoUnidad>('meses');
  const [vencimiento, setVencimiento] = useState(calculateExpiration(getTodayDateString(), 12, 'meses'));

  // Cliente
  const [cliente, setCliente] = useState('OSORIO CALLE 2');

  // Success Feedback
  const [successInfo, setSuccessInfo] = useState<{ message: string; visible: boolean } | null>(null);

  // Refs for keyboard focus navigation
  const sucursalRef = useRef<HTMLInputElement>(null);
  const cajaRef = useRef<HTMLInputElement>(null);
  const secuenciaRef = useRef<HTMLInputElement>(null);
  const productInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fechaVentaRef = useRef<HTMLInputElement>(null);
  const fechaElabRef = useRef<HTMLInputElement>(null);
  const plazoRef = useRef<HTMLInputElement>(null);
  const vencimientoRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  // Initialize from lastInvoiceNumber if available
  useEffect(() => {
    if (lastInvoiceNumber) {
      const parts = lastInvoiceNumber.split('-');
      if (parts.length === 3) {
        setSucursal(parts[0]);
        setCaja(parts[1]);
        setSecuencia(incrementSequence(parts[2]));
      }
    }
  }, [lastInvoiceNumber]);

  // Handle global keyboard shortcut: Shift to focus the Save button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.key === 'F9') {
        saveBtnRef.current?.focus();
        saveBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update dates when Fecha de Venta changes
  const handleFechaVentaChange = (val: string) => {
    setFechaVenta(val);
    setFechaElaboracion(val);
    const num = Number(plazoValor) || 12;
    setVencimiento(calculateExpiration(val, num, plazoUnidad));
  };

  // Update expiration when Fecha de Elaboración changes
  const handleFechaElaboracionChange = (val: string) => {
    setFechaElaboracion(val);
    const num = Number(plazoValor) || 12;
    setVencimiento(calculateExpiration(val, num, plazoUnidad));
  };

  // Update expiration when Plazo Valor changes
  const handlePlazoValorChange = (val: string | number) => {
    setPlazoValor(val);
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    if (!isNaN(num) && num > 0 && fechaElaboracion) {
      setVencimiento(calculateExpiration(fechaElaboracion, num, plazoUnidad));
    }
  };

  // Update expiration when Plazo Unidad changes ('meses' | 'dias')
  const handlePlazoUnidadChange = (unit: PlazoUnidad) => {
    setPlazoUnidad(unit);
    const num = Number(plazoValor) || 12;
    if (fechaElaboracion) {
      setVencimiento(calculateExpiration(fechaElaboracion, num, unit));
    }
  };

  // Autocomplete matching items
  const getFilteredCatalog = (searchTerm: string) => {
    const clean = (searchTerm || '').trim().toUpperCase();
    if (!clean) return catalog;
    return catalog.filter(c => c.name.toUpperCase().includes(clean));
  };

  // Scroll active dropdown item into view when navigating with keyboard
  useEffect(() => {
    if (activeDropdownIndex !== null && dropdownFocusIndex >= 0) {
      const activeEl = document.getElementById(`catalog-opt-${activeDropdownIndex}-${dropdownFocusIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [dropdownFocusIndex, activeDropdownIndex]);

  // Product Row Management
  const addProductRow = (initialValue = '') => {
    const newId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setProducts(prev => {
      const next = [...prev, { id: newId, name: initialValue }];
      setTimeout(() => {
        const nextIdx = next.length - 1;
        if (productInputRefs.current[nextIdx]) {
          productInputRefs.current[nextIdx]?.focus();
          productInputRefs.current[nextIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
      return next;
    });
  };

  const handleAddOrFocusNextProduct = () => {
    const lastIdx = products.length - 1;
    if (lastIdx >= 0 && products[lastIdx].name.trim() === '') {
      productInputRefs.current[lastIdx]?.focus();
      productInputRefs.current[lastIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    addProductRow();
  };

  const removeProductRow = (index: number) => {
    if (products.length <= 1) return;
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateProductName = (index: number, val: string) => {
    setProducts(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: val.toUpperCase() };
      return copy;
    });

    // Check if the typed name matches a product in the catalog
    const matched = catalog.find(c => c.name.toUpperCase() === val.trim().toUpperCase());
    if (matched && matched.plazoValor !== undefined) {
      const matchedUnit = matched.plazoUnidad || 'meses';
      setPlazoValor(matched.plazoValor);
      setPlazoUnidad(matchedUnit);
      if (fechaElaboracion) {
        setVencimiento(calculateExpiration(fechaElaboracion, matched.plazoValor, matchedUnit));
      }
    }
  };

  const selectCatalogItem = (index: number, item: CatalogProduct) => {
    updateProductName(index, item.name);

    // Apply product catalog plazo if defined
    if (item.plazoValor !== undefined) {
      const unit = item.plazoUnidad || 'meses';
      setPlazoValor(item.plazoValor);
      setPlazoUnidad(unit);
      if (fechaElaboracion) {
        setVencimiento(calculateExpiration(fechaElaboracion, item.plazoValor, unit));
      }
    }

    setActiveDropdownIndex(null);
    setDropdownFocusIndex(-1);

    // Jump to Fecha de Venta or next product
    if (index === products.length - 1) {
      fechaVentaRef.current?.focus();
    } else {
      productInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Product Keyboard Navigation (Up/Down/Enter)
  const handleProductKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    filteredItems: CatalogProduct[]
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveDropdownIndex(index);
      setDropdownFocusIndex(prev => (prev + 1 >= filteredItems.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveDropdownIndex(index);
      setDropdownFocusIndex(prev => (prev - 1 < 0 ? filteredItems.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeDropdownIndex === index && dropdownFocusIndex >= 0 && filteredItems[dropdownFocusIndex]) {
        selectCatalogItem(index, filteredItems[dropdownFocusIndex]);
      } else if (filteredItems.length > 0 && products[index].name.trim() !== '') {
        const exactMatch = filteredItems.find(f => f.name.toUpperCase() === products[index].name.trim().toUpperCase());
        if (exactMatch) {
          selectCatalogItem(index, exactMatch);
        } else {
          setActiveDropdownIndex(null);
          fechaVentaRef.current?.focus();
        }
      } else {
        setActiveDropdownIndex(null);
        fechaVentaRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      setActiveDropdownIndex(null);
      setDropdownFocusIndex(-1);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedInvoiceNum = formatInvoiceNumber(sucursal, caja, secuencia);
    const validProducts = products.filter(p => p.name.trim().length > 0);

    if (validProducts.length === 0) {
      alert('Debe ingresar al menos un producto para la factura.');
      return;
    }

    if (!cliente.trim()) {
      alert('Debe ingresar el nombre del cliente.');
      clienteRef.current?.focus();
      return;
    }

    const newInvoiceItems: InvoiceItem[] = validProducts.map((p, idx) => ({
      id: `inv-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      numFactura: formattedInvoiceNum,
      tipoFactura: p.name.trim().toUpperCase(),
      fechaVenta,
      fechaElaboracion,
      vencimiento,
      cliente: cliente.trim().toUpperCase(),
      createdAt: Date.now() + idx
    }));

    const newCatalogNames = validProducts.map(p => p.name.trim().toUpperCase());

    onSaveInvoice(newInvoiceItems, newCatalogNames);

    // Show Feedback Toast
    setSuccessInfo({
      message: `¡Factura Nº ${formattedInvoiceNum} registrada con ${validProducts.length} producto${validProducts.length > 1 ? 's' : ''}!`,
      visible: true
    });

    // Increment Sequence for next invoice, reset product list
    setSecuencia(prev => incrementSequence(prev));
    setProducts([{ id: `p-${Date.now()}`, name: '' }]);

    // Keep focus ready on Secuencia or first product for ultra-fast data entry
    setTimeout(() => {
      secuenciaRef.current?.focus();
    }, 100);
  };

  // Preview computed invoice number
  const fullInvoiceNumber = formatInvoiceNumber(sucursal, caja, secuencia);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Form Card */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 pb-4 mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-emerald-100 text-[#107c41] p-1.5 rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </span>
            Formulario de Carga de Factura
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ingrese el número de factura, seleccione o escriba los productos y verifique las fechas.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successInfo?.visible && (
          <div className="mb-5 bg-emerald-50 border border-emerald-400 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-[#107c41] shrink-0" />
              <span>{successInfo.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessInfo(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md hover:bg-emerald-100/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          
          {/* Section 1: Nº DE FACTURA (3 segmented boxes) */}
          <div className="bg-emerald-50/60 p-2.5 sm:p-3 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-emerald-950 tracking-wider uppercase">
                Nº DE FACTURA
              </label>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Sucursal */}
              <div className="col-span-3">
                <span className="text-[10px] text-emerald-900 font-semibold block mb-0.5">
                  Sucursal
                </span>
                <input
                  ref={sucursalRef}
                  type="text"
                  required
                  maxLength={3}
                  value={sucursal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setSucursal(val);
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => setSucursal(padZeroes(sucursal, 3))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      cajaRef.current?.focus();
                    }
                  }}
                  placeholder="001"
                  className="w-full bg-white border border-emerald-300 rounded-lg py-1 px-2 text-center font-mono font-bold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] shadow-xs"
                />
              </div>

              <div className="col-span-1 text-center font-bold text-emerald-400 text-sm self-end pb-1">
                -
              </div>

              {/* Caja */}
              <div className="col-span-3">
                <span className="text-[10px] text-emerald-900 font-semibold block mb-0.5">
                  Caja
                </span>
                <input
                  ref={cajaRef}
                  type="text"
                  required
                  maxLength={3}
                  value={caja}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCaja(val);
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => setCaja(padZeroes(caja, 3))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      secuenciaRef.current?.focus();
                    }
                  }}
                  placeholder="009"
                  className="w-full bg-white border border-emerald-300 rounded-lg py-1 px-2 text-center font-mono font-bold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] shadow-xs"
                />
              </div>

              <div className="col-span-1 text-center font-bold text-emerald-400 text-sm self-end pb-1">
                -
              </div>

              {/* Factura / Secuencia */}
              <div className="col-span-4">
                <span className="text-[10px] text-emerald-900 font-semibold block mb-0.5">
                  Factura
                </span>
                <input
                  ref={secuenciaRef}
                  type="text"
                  required
                  maxLength={7}
                  value={secuencia}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setSecuencia(val);
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => setSecuencia(padZeroes(secuencia, 7))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      productInputRefs.current[0]?.focus();
                    }
                  }}
                  placeholder="0006431"
                  className="w-full bg-white border border-emerald-300 rounded-lg py-1 px-2 text-center font-mono font-bold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] shadow-xs"
                />
              </div>
            </div>

            {/* Quick Preview & Sequence Increment Helper */}
            <div className="flex flex-wrap items-center justify-between pt-0.5 text-xs gap-2">
              <div className="text-emerald-900 text-[11px]">
                Resultado Factura: <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-[#107c41]">{fullInvoiceNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => setSecuencia(prev => incrementSequence(prev))}
                className="text-[11px] font-semibold text-[#107c41] hover:text-[#0d6334] hover:underline flex items-center gap-1"
              >
                +1 Siguiente secuencia
              </button>
            </div>
          </div>

          {/* Section 2: PRODUCTOS / TIPO DE FACTURA (Dynamic list with keyboard autocomplete) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">
                PRODUCTOS / TIPO DE FACTURA
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                Usa <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">↓</kbd> y <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">Enter</kbd> para autocompletar
              </span>
            </div>

            <div className="space-y-1.5">
              {products.map((p, index) => {
                const filtered = getFilteredCatalog(p.name);
                const showDropdown = activeDropdownIndex === index && filtered.length > 0;

                return (
                  <div key={p.id} className="flex items-center gap-1.5 relative">
                    <span className="text-xs font-mono font-semibold text-gray-400 w-4 text-right">
                      {index + 1}.
                    </span>

                    <div className="relative flex-1">
                      <input
                        ref={(el) => { productInputRefs.current[index] = el; }}
                        type="text"
                        required
                        value={p.name}
                        placeholder="Buscar o escribir producto (Ej. AVENA, HARINA...)"
                        onChange={(e) => {
                          updateProductName(index, e.target.value);
                          setActiveDropdownIndex(index);
                          setDropdownFocusIndex(-1);
                        }}
                        onFocus={() => {
                          setActiveDropdownIndex(index);
                          setDropdownFocusIndex(-1);
                        }}
                        onKeyDown={(e) => handleProductKeyDown(e, index, filtered)}
                        className="w-full bg-white border border-gray-300 rounded-lg py-1 px-2.5 uppercase text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] transition h-8"
                      />

                      {/* Autocomplete Dropdown List */}
                      {showDropdown && (
                        <div 
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-emerald-400 rounded-xl shadow-2xl z-30 max-h-60 sm:max-h-72 overflow-y-auto divide-y divide-gray-100 scroll-smooth"
                        >
                          {filtered.map((catItem, catIdx) => {
                            const isFocused = dropdownFocusIndex === catIdx;
                            const plazoText = catItem.plazoValor 
                              ? `${catItem.plazoValor} ${catItem.plazoUnidad === 'dias' ? 'días' : 'meses'}`
                              : '12 meses';

                            return (
                              <div
                                key={catItem.id}
                                id={`catalog-opt-${index}-${catIdx}`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectCatalogItem(index, catItem);
                                }}
                                onMouseEnter={() => setDropdownFocusIndex(catIdx)}
                                className={`px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer flex justify-between items-center transition ${
                                  isFocused
                                    ? 'bg-[#107c41] text-white font-semibold'
                                    : 'text-gray-800 hover:bg-emerald-50 hover:text-[#107c41]'
                                }`}
                              >
                                <span className="font-bold">{catItem.name}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold whitespace-nowrap ${
                                  isFocused 
                                    ? 'bg-emerald-800 text-white' 
                                    : 'bg-emerald-100 text-[#107c41]'
                                }`}>
                                  {plazoText}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Delete row button */}
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      disabled={products.length <= 1}
                      className={`p-1.5 h-8 w-8 flex items-center justify-center rounded-lg transition ${
                        products.length <= 1
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Button to add another product row to this same invoice */}
            <button
              type="button"
              onClick={() => addProductRow()}
              className="mt-1 text-xs font-semibold text-[#107c41] hover:text-[#0d6334] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar otro producto a esta factura</span>
            </button>
          </div>

          {/* Section 3: FECHAS (Venta, Elaboracion, Vencimiento Plazo, Fecha de Vencimiento) */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 items-start">
            {/* Fecha de Venta */}
            <div className="w-full sm:flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-[#107c41]" />
                FECHA DE VENTA
              </label>
              <input
                ref={fechaVentaRef}
                type="date"
                required
                value={fechaVenta}
                onChange={(e) => handleFechaVentaChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fechaElabRef.current?.focus();
                  }
                }}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] font-mono"
              />
            </div>

            {/* Fecha de Elaboración */}
            <div className="w-full sm:flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                FECHA DE ELABORACIÓN
              </label>
              <input
                ref={fechaElabRef}
                type="date"
                required
                value={fechaElaboracion}
                onChange={(e) => handleFechaElaboracionChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    plazoRef.current?.focus();
                  }
                }}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] font-mono"
              />
            </div>

            {/* Plazo / Vencimiento (Valor numérico + Unidad: meses / días) */}
            <div className="w-full sm:w-[155px] shrink-0">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                PLAZO VENC.
              </label>
              <div className="flex items-center gap-1">
                <input
                  ref={plazoRef}
                  type="number"
                  min={1}
                  max={3650}
                  value={plazoValor}
                  onChange={(e) => handlePlazoValorChange(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      vencimientoRef.current?.focus();
                    }
                  }}
                  placeholder="12"
                  className="w-14 bg-emerald-50/70 border border-emerald-300 rounded-lg py-2 px-1 text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] font-mono text-center"
                />
                <select
                  value={plazoUnidad}
                  onChange={(e) => handlePlazoUnidadChange(e.target.value as PlazoUnidad)}
                  className="flex-1 bg-emerald-50/70 border border-emerald-300 rounded-lg py-2 px-1 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] cursor-pointer"
                >
                  <option value="meses">meses</option>
                  <option value="dias">días</option>
                </select>
              </div>
            </div>

            {/* Fecha de Vencimiento */}
            <div className="w-full sm:flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                FECHA DE VENCIMIENTO
              </label>
              <input
                ref={vencimientoRef}
                type="date"
                required
                value={vencimiento}
                onChange={(e) => setVencimiento(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    clienteRef.current?.focus();
                  }
                }}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41] font-mono"
              />
            </div>
          </div>

          {/* Section 4: CLIENTE */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#107c41]" />
                CLIENTE / RAZÓN SOCIAL
              </label>
              <span className="text-[11px] text-emerald-800 font-medium">
                Presiona <kbd className="px-1.5 py-0.5 bg-emerald-100/80 border border-emerald-300 rounded text-[10px] font-bold text-emerald-900 font-mono">Enter</kbd> para agregar otro producto · <kbd className="px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-bold font-mono">Shift</kbd> para ir a Guardar
              </span>
            </div>
            <input
              ref={clienteRef}
              type="text"
              required
              value={cliente}
              placeholder="Ej. OSORIO CALLE 2"
              onChange={(e) => setCliente(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOrFocusNextProduct();
                }
              }}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 uppercase text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#107c41] focus:border-[#107c41]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer"
            >
              Ver Tabla
            </button>

            <div className="flex items-center gap-3">
              <button
                ref={saveBtnRef}
                type="submit"
                id="btn-guardar-factura-form"
                className="px-6 py-2.5 bg-[#107c41] hover:bg-[#0d6334] active:scale-98 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer focus:ring-4 focus:ring-emerald-300"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Factura</span>
                <span className="bg-emerald-900 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-mono ml-1">
                  Shift + Enter
                </span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
