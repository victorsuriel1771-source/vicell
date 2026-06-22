import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../types';
import { ArrowLeft, User, Phone, Smartphone, ClipboardCheck, DollarSign, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface NuevoTicketViewProps {
  onBack: () => void;
  onAddTicket: (ticket: Omit<Ticket, 'id' | 'remainingPrice' | 'createdAt'>) => void;
}

export default function NuevoTicketView({
  onBack,
  onAddTicket
}: NuevoTicketViewProps) {
  // Form fields state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [imei, setImei] = useState('');
  const [reportedFailure, setReportedFailure] = useState('');
  
  const [price, setPrice] = useState('');
  const [advance, setAdvance] = useState('');
  const [remaining, setRemaining] = useState(0);

  // Auto calculate the remaining balance
  useEffect(() => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(advance) || 0;
    setRemaining(Math.max(0, p - a));
  }, [price, advance]);

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only digits, maximum 15 characters
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 15);
    setImei(numericValue);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !deviceBrand || !deviceModel) {
      alert('Por favor complete todos los datos requeridos (Cliente, Teléfono, Marca y Modelo).');
      return;
    }
    if (imei && imei.length !== 15) {
      alert('Si ingresa un IMEI, debe poseer exactamente 15 dígitos.');
      return;
    }

    onAddTicket({
      clientName,
      clientPhone: clientPhone || '809-555-0100',
      deviceBrand,
      deviceModel,
      imei: imei || 'N/A',
      reportedFailure: reportedFailure || 'Diagnóstico preliminar',
      status: 'en_proceso',
      statusDetail: 'En mesa de trabajo #2',
      totalPrice: parseFloat(price) || 0,
      advancePaid: parseFloat(advance) || 0,
      assignedTechnician: 'Roberto'
    });
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between h-12 mt-4" id="nuevo-ticket-header">
        <button 
          onClick={onBack}
          className="flex items-center justify-center p-2.5 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant hover:text-primary cursor-pointer border border-transparent hover:border-white/5"
          id="btn-back-nuevo-ticket"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-headline text-xl font-bold text-white tracking-wider">Nuevo Ticket</h1>
        <div className="w-10"></div> {/* Placeholder for visual symmetry balance */}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Cliente Info Section */}
        <section className="glass-panel rounded-2xl p-5 space-y-4" id="section-cliente-info">
          <div className="flex items-center gap-2 mb-1">
            <User className="text-secondary w-5 h-5" />
            <h2 className="font-headline text-md font-bold text-secondary">Información del Cliente</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant">Nombre Completo</label>
              <input 
                type="text" 
                required
                className="w-full h-12 px-4 rounded-xl glass-input text-xs"
                placeholder="Ej. Juan Pérez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant">Teléfono de Contacto</label>
              <input 
                type="tel" 
                required
                className="w-full h-12 px-4 rounded-xl glass-input text-xs font-semibold tracking-wide"
                placeholder="809-000-0000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Dispositivo Info Section */}
        <section className="glass-panel rounded-2xl p-5 space-y-4" id="section-dispositivo-info">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="text-primary w-5 h-5" />
            <h2 className="font-headline text-md font-bold text-primary">Detalles del Dispositivo</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant">Marca</label>
                <select 
                  required
                  className="w-full h-12 px-4 rounded-xl glass-input text-xs font-medium cursor-pointer"
                  value={deviceBrand}
                  onChange={(e) => setDeviceBrand(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Motorola">Motorola</option>
                  <option value="Tecno">Tecno</option>
                  <option value="Infinix">Infinix</option>
                  <option value="ZTE">ZTE</option>
                  <option value="Vortex">Vortex</option>
                  <option value="Alcatel">Alcatel</option>
                  <option value="Huawei">Huawei</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant">Modelo</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-12 px-4 rounded-xl glass-input text-xs"
                  placeholder="Ej. iPhone 13 Pro Max"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-on-surface-variant">IMEI o Número de Serie</label>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Opcional</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full h-12 pl-4 pr-14 rounded-xl glass-input text-xs font-mono font-bold tracking-widest"
                  placeholder="15 dígitos numéricos"
                  value={imei}
                  onChange={handleImeiChange}
                  maxLength={15}
                />
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono transition-all duration-300 ${
                  imei.length === 15 ? 'text-primary' : 'text-on-surface-variant/50'
                }`}>
                  {imei.length}/15
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant">Falla Reportada</label>
              <textarea 
                className="w-full p-4 rounded-xl glass-input text-xs resize-none leading-relaxed" 
                placeholder="Describe el problema del dispositivo..." 
                rows={3}
                value={reportedFailure}
                onChange={(e) => setReportedFailure(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Finanzas Section */}
        <section className="glass-panel rounded-2xl p-5 space-y-4" id="section-finanzas-info">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="text-secondary w-5 h-5" />
            <h2 className="font-headline text-md font-bold text-secondary">Finanzas</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Precio Total</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[10px] font-bold">RD$</span>
                <input 
                  type="number" 
                  required
                  className="w-full h-12 pl-10 pr-3 rounded-xl glass-input text-right text-xs font-bold text-white focus:text-emerald-300"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Avance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[10px] font-bold">RD$</span>
                <input 
                  type="number" 
                  className="w-full h-12 pl-10 pr-3 rounded-xl glass-input text-right text-xs font-bold text-white focus:text-emerald-300"
                  placeholder="0.00"
                  value={advance}
                  onChange={(e) => setAdvance(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Restante</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[10px] font-bold opacity-60">RD$</span>
                <input 
                  type="number" 
                  readOnly
                  className={`w-full h-12 pl-10 pr-3 rounded-xl glass-input text-right text-xs font-bold opacity-80 pointer-events-none ${
                    remaining > 0 ? 'text-error' : 'text-emerald-400'
                  }`}
                  placeholder="0.00"
                  value={remaining > 0 ? remaining : ''}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-2 pb-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-inverse-primary to-primary-container p-1 shadow-lg text-white font-headline text-[15px] font-bold relative group flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(142,127,255,0.4)]"
            id="btn-submit-nuevo-ticket"
          >
            <PlusCircle className="w-5 h-5" /> Crear Ticket de Reparación
          </motion.button>
        </div>
      </form>
    </div>
  );
}
