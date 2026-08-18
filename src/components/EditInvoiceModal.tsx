import React, { useState } from 'react';
import { X, Save, FileEdit, Calendar, User, Hash, Tag, Clock } from 'lucide-react';
import { InvoiceItem, CatalogProduct, PlazoUnidad } from '../types';
import { 
  parseInvoiceNumber, 
  formatInvoiceNumber, 
  padZeroes,
  calculateExpiration
} from '../utils/formatters';

interface EditInvoiceModalProps {
  invoice: InvoiceItem;
  catalog: CatalogProduct[];
  onSave: (updated: InvoiceItem) => void;
  onClose: () => void;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoice,
  catalog,
  onSave,
  onClose
}) => {
  const parsed = parseInvoiceNumber(invoice.numFactura);
  const [sucursal, setSucursal] = useState(parsed.sucursal);
  const [caja, setCaja] = useState(parsed.caja);
  const [secuencia, setSecuencia] = useState(parsed.secuencia);

  const matchedProduct = catalog.find(c => c.name.toUpperCase() === invoice.tipoFactura.toUpperCase());
  const initialPlazoValor = matchedProduct?.plazoValor ?? 12;
  const initialPlazoUnidad = matchedProduct?.plazoUnidad ?? 'meses';

  const [tipoFactura, setTipoFactura] = useState(invoice.tipoFactura);
  const [fechaVenta, setFechaVenta] = useState(invoice.fechaVenta);
  const [fechaElaboracion, setFechaElaboracion] = useState(invoice.fechaElaboracion);
  const [plazoValor, setPlazoValor] = useState<number | string>(initialPlazoValor);
  const [plazoUnidad, setPlazoUnidad] = useState<PlazoUnidad>(initialPlazoUnidad);
  const [vencimiento, setVencimiento] = useState(invoice.vencimiento);
  const [cliente, setCliente] = useState(invoice.cliente);

  const handleTipoFacturaChange = (val: string) => {
    setTipoFactura(val);
    const prod = catalog.find(c => c.name.toUpperCase() === val.trim().toUpperCase());
    if (prod && prod.plazoValor !== undefined) {
      const unit = prod.plazoUnidad || 'meses';
      setPlazoValor(prod.plazoValor);
      setPlazoUnidad(unit);
      if (fechaElaboracion) {
        setVencimiento(calculateExpiration(fechaElaboracion, prod.plazoValor, unit));
      }
    }
  };

  const handlePlazoValorChange = (val: string | number) => {
    setPlazoValor(val);
    const m = typeof val === 'string' ? parseInt(val, 10) : val;
    if (!isNaN(m) && m > 0 && fechaElaboracion) {
      setVencimiento(calculateExpiration(fechaElaboracion, m, plazoUnidad));
    }
  };

  const handlePlazoUnidadChange = (unit: PlazoUnidad) => {
    setPlazoUnidad(unit);
    const m = Number(plazoValor) || 12;
    if (fechaElaboracion) {
      setVencimiento(calculateExpiration(fechaElaboracion, m, unit));
    }
  };

  const handleElabChange = (val: string) => {
    setFechaElaboracion(val);
    const m = Number(plazoValor) || 12;
    setVencimiento(calculateExpiration(val, m, plazoUnidad));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedNum = formatInvoiceNumber(sucursal, caja, secuencia);

    onSave({
      ...invoice,
      numFactura: formattedNum,
      tipoFactura: tipoFactura.trim().toUpperCase(),
      fechaVenta,
      fechaElaboracion,
      vencimiento,
      cliente: cliente.trim().toUpperCase()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl text-[#107c41]">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Editar Registro de Factura</h3>
            <p className="text-xs text-gray-500">Modifique los datos individuales de esta fila</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nº Factura 3 parts */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              Nº DE FACTURA
            </label>
            <div className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                required
                maxLength={3}
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value.replace(/\D/g, ''))}
                onFocus={(e) => e.target.select()}
                onBlur={() => setSucursal(padZeroes(sucursal, 3))}
                className="col-span-3 bg-gray-50 border border-gray-300 rounded-lg py-1.5 text-center font-mono font-bold text-sm"
              />
              <span className="col-span-1 text-center font-bold text-gray-400">-</span>
              <input
                type="text"
                required
                maxLength={3}
                value={caja}
                onChange={(e) => setCaja(e.target.value.replace(/\D/g, ''))}
                onFocus={(e) => e.target.select()}
                onBlur={() => setCaja(padZeroes(caja, 3))}
                className="col-span-3 bg-gray-50 border border-gray-300 rounded-lg py-1.5 text-center font-mono font-bold text-sm"
              />
              <span className="col-span-1 text-center font-bold text-gray-400">-</span>
              <input
                type="text"
                required
                maxLength={7}
                value={secuencia}
                onChange={(e) => setSecuencia(e.target.value.replace(/\D/g, ''))}
                onFocus={(e) => e.target.select()}
                onBlur={() => setSecuencia(padZeroes(secuencia, 7))}
                className="col-span-4 bg-gray-50 border border-gray-300 rounded-lg py-1.5 text-center font-mono font-bold text-sm"
              />
            </div>
          </div>

          {/* Tipo Factura / Producto */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              TIPO DE FACTURA (PRODUCTO)
            </label>
            <input
              type="text"
              required
              value={tipoFactura}
              onChange={(e) => handleTipoFacturaChange(e.target.value.toUpperCase())}
              list="edit-catalog-suggestions"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm font-semibold uppercase focus:bg-white focus:ring-2 focus:ring-[#107c41]"
            />
            <datalist id="edit-catalog-suggestions">
              {catalog.map(c => (
                <option key={c.id} value={c.name}>
                  {c.plazoValor ? `${c.plazoValor} ${c.plazoUnidad || 'meses'}` : ''}
                </option>
              ))}
            </datalist>
          </div>

          {/* Fechas */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:flex-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 whitespace-nowrap">
                F. VENTA
              </label>
              <input
                type="date"
                required
                value={fechaVenta}
                onChange={(e) => setFechaVenta(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-1.5 px-1.5 text-xs font-mono"
              />
            </div>

            <div className="w-full sm:flex-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 whitespace-nowrap">
                F. ELABORACIÓN
              </label>
              <input
                type="date"
                required
                value={fechaElaboracion}
                onChange={(e) => handleElabChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-1.5 px-1.5 text-xs font-mono"
              />
            </div>

            <div className="w-full sm:w-[130px] shrink-0">
              <label className="block text-[11px] font-bold text-emerald-800 uppercase mb-1 whitespace-nowrap">
                PLAZO VENC.
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={plazoValor}
                  onChange={(e) => handlePlazoValorChange(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="12"
                  className="w-14 bg-emerald-50/70 border border-emerald-300 rounded-lg py-1.5 px-1 text-xs font-bold text-center font-mono"
                />
                <select
                  value={plazoUnidad}
                  onChange={(e) => handlePlazoUnidadChange(e.target.value as PlazoUnidad)}
                  className="flex-1 bg-emerald-50/70 border border-emerald-300 rounded-lg py-1.5 px-1 text-[11px] font-bold text-emerald-950"
                >
                  <option value="meses">meses</option>
                  <option value="dias">días</option>
                </select>
              </div>
            </div>

            <div className="w-full sm:flex-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 whitespace-nowrap">
                F. VENCIMIENTO
              </label>
              <input
                type="date"
                required
                value={vencimiento}
                onChange={(e) => setVencimiento(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-1.5 px-1.5 text-xs font-mono"
              />
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              CLIENTE
            </label>
            <input
              type="text"
              required
              value={cliente}
              onChange={(e) => setCliente(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm font-semibold uppercase focus:bg-white focus:ring-2 focus:ring-[#107c41]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#107c41] hover:bg-[#0d6334] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
