import React, { useState } from 'react';
import { VentaUsado } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  User,
  Phone,
  BarChart3
} from 'lucide-react';

interface VentasUsadosViewProps {
  ventas: VentaUsado[];
  onAddVenta: (venta: Omit<VentaUsado, 'id' | 'gain'>) => void;
  onDeleteVenta: (id: string) => void;
}

export default function VentasUsadosView({
  ventas,
  onAddVenta,
  onDeleteVenta
}: VentasUsadosViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [phoneModel, setPhoneModel] = useState('');
  const [imei, setImei] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [saleDate, setSaleDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Calculate overall metrics
  const totalCost = ventas.reduce((acc, v) => acc + v.purchaseCost, 0);
  const totalSales = ventas.reduce((acc, v) => acc + v.sellPrice, 0);
  const totalProfit = ventas.reduce((acc, v) => acc + v.gain, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneModel || !purchaseCost || !sellPrice || !saleDate) return;

    onAddVenta({
      clientName: clientName || 'Consumidor Final',
      clientPhone: clientPhone || 'S/N',
      phoneModel,
      imei: imei || 'S/N',
      purchaseCost: parseFloat(purchaseCost),
      sellPrice: parseFloat(sellPrice),
      status: 'completado',
      saleDate
    });

    // Reset fields
    setClientName('');
    setClientPhone('');
    setPhoneModel('');
    setImei('');
    setPurchaseCost('');
    setSellPrice('');
    setShowAddModal(false);
  };

  // Group ventas by Month format: "YYYY-MM" -> e.g. "2026-06"
  // Map months numbers to spanish names
  const spanishMonths: { [key: string]: string } = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  const getMonthYearLabel = (dateStr: string) => {
    const parts = dateStr.split('-'); // YYYY-MM-DD
    if (parts.length >= 2) {
      const year = parts[0];
      const monthNum = parts[1];
      const monthName = spanishMonths[monthNum] || monthNum;
      return `${monthName} ${year}`;
    }
    return 'Otros meses';
  };

  const getMonthSortKey = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`; // YYYY-MM
    }
    return '0000-00';
  };

  // Grouping structure
  const groupedVentas: { [monthKey: string]: { label: string; items: VentaUsado[]; totalCost: number; totalGain: number; totalSold: number } } = {};

  ventas.forEach(v => {
    const monthKey = getMonthSortKey(v.saleDate);
    const label = getMonthYearLabel(v.saleDate);

    if (!groupedVentas[monthKey]) {
      groupedVentas[monthKey] = {
        label,
        items: [],
        totalCost: 0,
        totalGain: 0,
        totalSold: 0
      };
    }

    groupedVentas[monthKey].items.push(v);
    groupedVentas[monthKey].totalCost += v.purchaseCost;
    groupedVentas[monthKey].totalGain += v.gain;
    groupedVentas[monthKey].totalSold += v.sellPrice;
  });

  // Sort months descending (e.g. 2026-06 then 2026-05)
  const sortedMonthKeys = Object.keys(groupedVentas).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Ventas de Teléfonos Usados</h2>
        <p className="font-sans text-xs text-on-surface-variant">Gestione los equipos adquiridos, vendidos y sus ganancias por mes</p>
      </div>

      {/* Main stats counters */}
      <div className="grid grid-cols-3 gap-3" id="ventas-stats-grid">
        <div className="glass-panel rounded-xl p-3 border-t border-t-white/10 flex flex-col gap-1 text-center bg-surface-container-lowest/30">
          <span className="font-sans text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Vendidos</span>
          <span className="font-sans text-sm font-extrabold text-white">{ventas.length} ud</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border-t border-t-white/10 flex flex-col gap-1 text-center bg-surface-container-lowest/30">
          <span className="font-sans text-[8px] font-bold text-error uppercase tracking-wider">Costo Invertido</span>
          <span className="font-sans text-xs font-bold text-error-container line-clamp-1">RD$ {totalCost.toLocaleString('es-DO')}</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border-t border-t-white/10 flex flex-col gap-1 text-center bg-surface-container-lowest/30 border-l-2 border-l-emerald-500">
          <span className="font-sans text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Ganancia Neto</span>
          <span className="font-sans text-xs font-bold text-emerald-400 line-clamp-1">RD$ {totalProfit.toLocaleString('es-DO')}</span>
        </div>
      </div>

      {/* Trigger Button */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => setShowAddModal(true)}
        className="w-full relative overflow-hidden glass-panel rounded-2xl py-4 flex items-center justify-center gap-2 border border-secondary/20 hover:bg-white/5 transition-all cursor-pointer group mb-2"
        id="btn-trigger-register-venta-usado"
      >
        <div className="absolute inset-0 bg-secondary/5 blur-xl group-hover:bg-secondary/10 transition-all z-0"></div>
        <Smartphone className="text-secondary w-5 h-5 relative z-10" />
        <span className="font-sans text-xs font-bold text-white relative z-10 tracking-wide">+ Registrar Teléfono Usado Vendido</span>
      </motion.button>

      {/* Sales List grouped by months */}
      <div className="space-y-6">
        {sortedMonthKeys.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-white/5 space-y-2">
            <Smartphone className="w-10 h-10 text-slate-500 mx-auto opacity-70" />
            <p className="font-sans text-xs text-on-surface-variant font-medium">No hay ventas de teléfonos usados registradas todavía.</p>
          </div>
        ) : (
          sortedMonthKeys.map(monthKey => {
            const group = groupedVentas[monthKey];
            return (
              <div key={monthKey} className="space-y-3">
                {/* Month header with computed totals */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <h4 className="font-headline text-sm font-bold text-white capitalize">{group.label}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-on-surface-variant bg-surface-container-highest/50 px-2.5 py-1 rounded-full border border-white/5">
                    <div>Costo: <span className="text-error font-bold">RD$ {group.totalCost.toLocaleString('es-DO')}</span></div>
                    <div className="text-white/20">|</div>
                    <div>Ganancia: <span className="text-emerald-400 font-bold">RD$ {group.totalGain.toLocaleString('es-DO')}</span></div>
                  </div>
                </div>

                {/* Sales of the month */}
                <div className="space-y-3">
                  {group.items.map(v => (
                    <motion.div 
                      key={v.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline font-bold text-xs text-white">{v.phoneModel}</span>
                          {v.imei && v.imei !== 'S/N' && (
                            <span className="font-mono text-[9px] text-on-surface-variant bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                              IMEI: {v.imei}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                          <span className="flex items-center gap-0.5"><User className="w-3 h-3" /> {v.clientName}</span>
                          {v.clientPhone && v.clientPhone !== 'S/N' && (
                            <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {v.clientPhone}</span>
                          )}
                        </div>
                        <span className="font-sans text-[9px] text-[#94a3b8] font-normal">Vendió el: {v.saleDate}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-sans text-xs text-emerald-400 font-extrabold">+RD$ {v.sellPrice.toLocaleString('es-DO')}</div>
                          <div className="font-sans text-[10px] text-on-surface-variant mt-0.5">
                            Costo: <span className="text-error/80">RD$ {v.purchaseCost.toLocaleString('es-DO')}</span> 
                            {' • '} 
                            Gana: <span className="text-emerald-400 font-bold">RD$ {v.gain.toLocaleString('es-DO')}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => onDeleteVenta(v.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Sale Modal Popup Overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Atmospheric background */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="text-secondary w-5 h-5" />
                  <h3 className="font-headline text-md font-bold text-white">Registro de Venta Teléfono Usado</h3>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Modelo del Teléfono *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. iPhone 13 Pro Max 128GB"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Costo Adquisición (Qué gasté) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="RD$ Costo"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Precio de Venta *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="RD$ Venta"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">IMEI (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="IMEI del equipo"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Fecha de Venta *</label>
                    <input 
                      type="date" 
                      required
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Cliente (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Nombre del cliente"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Contacto (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 809-555-1234"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-br from-secondary-container to-secondary hover:opacity-90 font-bold text-xs text-on-secondary-container tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-2 bloom-secondary animate-pulse-subtle"
                >
                  <Check className="w-4 h-4 text-on-secondary-container" /> Completar Venta de Usado
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
