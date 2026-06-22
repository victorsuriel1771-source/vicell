import React, { useState } from 'react';
import { Encargo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Tag, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Users, 
  Check, 
  Phone, 
  MessageSquare, 
  Archive,
  X
} from 'lucide-react';

interface EncargosViewProps {
  encargos: Encargo[];
  onAddEncargo: (encargo: Omit<Encargo, 'id' | 'gain'>) => void;
  onDeliverEncargo: (id: string) => void;
  onDeleteEncargo: (id: string) => void;
}

export default function EncargosView({
  encargos,
  onAddEncargo,
  onDeliverEncargo,
  onDeleteEncargo
}: EncargosViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');

  const totalSales = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.price, 0);
  const pendingCount = encargos.filter(o => o.status === 'pendiente').length;
  const totalMargin = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.gain, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !itemName || !price || !cost) return;

    onAddEncargo({
      clientName,
      clientPhone: clientPhone || 'Sin teléfono',
      itemName,
      quantity: parseInt(quantity) || 1,
      price: parseFloat(price),
      cost: parseFloat(cost),
      status: 'pendiente',
      date: new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
    });

    // Reset fields
    setClientName('');
    setClientPhone('');
    setItemName('');
    setQuantity('1');
    setPrice('');
    setCost('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Context Title */}
      <div className="text-center space-y-2 mb-4">
        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Venta de Teléfonos por Encargo</h2>
        <p className="font-sans text-xs text-on-surface-variant">Ventas de Equipos y Dispositivos bajo Pedido</p>
      </div>

      {/* Overview stats layout */}
      <div className="grid grid-cols-3 gap-3" id="encargos-stats-grid">
        <div className="glass-panel rounded-2xl p-3 flex flex-col justify-between border-t border-t-white/10">
          <span className="font-sans text-[9px] uppercase tracking-wider text-on-surface-variant font-bold leading-none">Ventas</span>
          <span className="font-headline text-sm font-bold text-white mt-1.5">RD$ {totalSales.toLocaleString('es-DO')}</span>
        </div>
        <div className="glass-panel rounded-2xl p-3 flex flex-col justify-between border-t border-t-white/10">
          <span className="font-sans text-[9px] uppercase tracking-wider text-secondary font-bold leading-none">Ganancias</span>
          <span className="font-headline text-sm font-bold text-secondary mt-1.5">RD$ {totalMargin.toLocaleString('es-DO')}</span>
        </div>
        <div className="glass-panel rounded-2xl p-3 flex flex-col justify-between border-t border-t-white/10 border-l-4 border-l-[#f59e0b]">
          <span className="font-sans text-[9px] uppercase tracking-wider text-[#f59e0b] font-bold leading-none">Pendientes</span>
          <span className="font-headline text-sm font-bold text-white mt-1.5">{pendingCount} órdenes</span>
        </div>
      </div>

      {/* Button to Register a new sale and order */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => setShowAddModal(true)}
        className="w-full relative overflow-hidden glass-panel rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 hover:bg-white/5 transition-all group border border-secondary/30 cursor-pointer"
        id="btn-trigger-register-encargo"
      >
        <div className="absolute inset-0 bg-secondary/5 blur-xl group-hover:bg-secondary/10 transition-all z-0"></div>
        <ShoppingBag className="text-secondary w-5 h-5 relative z-10" />
        <span className="font-sans text-xs font-bold text-white relative z-10 tracking-wide">+ Registrar Teléfono por Encargo</span>
      </motion.button>

      {/* Orders List / Encargos */}
      <div className="space-y-4">
        <h3 className="font-headline text-md font-bold text-on-surface">Historial de Teléfonos por Encargo</h3>
        
        <div className="space-y-3">
          {encargos.map(o => (
            <motion.div 
              layout
              key={o.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden border border-white/5"
            >
              {/* Status Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline text-sm font-bold text-white flex items-center gap-1">
                    {o.itemName}
                    <span className="text-on-surface-variant font-sans text-[10px] font-normal">x{o.quantity}</span>
                  </h4>
                  <span className="font-sans text-[10px] text-on-surface-variant flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-secondary" /> {o.clientName}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-headline text-xs font-bold text-white block">Price: RD$ {o.price.toLocaleString('es-DO')}</span>
                  <span className="font-sans text-[8px] font-bold text-emerald-400 mt-1 block">Margen: RD$ {o.gain.toLocaleString('es-DO')}</span>
                </div>
              </div>

              {/* Status and Action bar */}
              <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs font-sans">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Registrado: {o.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  {o.status === 'pendiente' ? (
                    <button 
                      onClick={() => onDeliverEncargo(o.id)}
                      className="px-3 py-1.5 rounded-lg bg-secondary/15 hover:bg-secondary/30 text-secondary border border-secondary/20 hover:border-secondary font-sans text-[10px] font-bold flex items-center gap-1 cursor-pointer bloom-secondary transition-all"
                    >
                      <Check className="w-3 h-3" /> Entregar
                    </button>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-emerald-400/5 text-emerald-400 border border-emerald-400/10 font-sans text-[9px] font-bold flex items-center gap-1">
                      <Archive className="w-3 h-3" /> Entregado
                    </span>
                  )}

                  <button 
                    onClick={() => onDeleteEncargo(o.id)}
                    className="p-1.5 rounded-lg hover:bg-red-400/10 text-on-surface-variant hover:text-red-400 transition-colors cursor-pointer border border-transparent hover:border-red-400/15"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Order Overlay Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md relative font-sans"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-on-surface-variant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="text-secondary w-5 h-5" />
                  <h3 className="font-headline text-md font-bold text-white">Nuevo Teléfono por Encargo</h3>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Nombre de Cliente</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Patricia Sosa"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Teléfono</label>
                    <input 
                      type="tel" 
                      placeholder="809-000-0000"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Cantidad</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="1"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Teléfono / Modelo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. iPhone 15 Pro Max 256GB o Galaxy S24 Ultra"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Costo (RD$)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Costo para el taller"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs font-bold text-red-300"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Precio Venta (RD$)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Cobro al cliente"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs font-bold text-emerald-300"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                {price && cost && (
                  <div className="bg-surface-container-lowest p-2.5 rounded-xl text-center border border-white/5 font-sans">
                    <span className="text-[10px] text-on-surface-variant block">Ganancia Proyectada:</span>
                    <span className="text-secondary font-bold text-sm">
                      RD$ {(parseFloat(price) - parseFloat(cost)).toLocaleString('es-DO')}
                    </span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-br from-secondary-container to-secondary hover:opacity-90 font-bold text-xs text-on-secondary-container tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-2 bloom-secondary"
                >
                  <Check className="w-4 h-4 text-on-secondary-container" /> Registrar Teléfono por Encargo
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
