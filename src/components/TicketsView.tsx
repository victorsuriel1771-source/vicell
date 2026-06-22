import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../types';
import { 
  Search, 
  Plus, 
  Send, 
  Smartphone, 
  User, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  ExternalLink,
  MessageSquareCode,
  Check,
  Building,
  Menu,
  ChevronRight,
  Shield,
  Trash2,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TicketsViewProps {
  tickets: Ticket[];
  onNavigate: (view: 'dashboard' | 'tickets' | 'encargos' | 'gastos' | 'nuevo_ticket') => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onDeleteTicket: (ticketId: string) => void;
  onPayTicket: (ticketId: string) => void;
  onShowReceipt: (ticket: Ticket) => void;
}

export default function TicketsView({
  tickets,
  onNavigate,
  onUpdateTicketStatus,
  onDeleteTicket,
  onPayTicket,
  onShowReceipt
}: TicketsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | 'en_proceso' | 'listos'>('todos');
  const [selectedTicketForNotification, setSelectedTicketForNotification] = useState<Ticket | null>(null);
  const [notifiedMessageStatus, setNotifiedMessageStatus] = useState<string | null>(null);
  const [showOptionsId, setShowOptionsId] = useState<string | null>(null);

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    const matchesQuery = 
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.imei.includes(searchQuery);

    const matchesTab = 
      activeTab === 'todos' ||
      (activeTab === 'en_proceso' && (t.status === 'en_proceso' || t.status === 'esperando_pieza')) ||
      (activeTab === 'listos' && t.status === 'listo');

    return matchesQuery && matchesTab;
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'listo':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-sans text-[10px] font-bold flex items-center gap-1 bloom-success">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Listo
          </span>
        );
      case 'en_proceso':
        return (
          <span className="px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400 font-sans text-[10px] font-bold flex items-center gap-1 bloom-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> En Proceso
          </span>
        );
      case 'esperando_pieza':
        return (
          <span className="px-2 py-0.5 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container font-sans text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span> Esperando Pieza
          </span>
        );
    }
  };

  const getLeftAccentBorderColor = (status: TicketStatus) => {
    switch (status) {
      case 'listo':
        return 'bg-emerald-400';
      case 'en_proceso':
        return 'bg-orange-400';
      case 'esperando_pieza':
        return 'bg-primary-container';
    }
  };

  const handleNotifySelect = (ticket: Ticket) => {
    setSelectedTicketForNotification(ticket);
    setNotifiedMessageStatus(null);
  };

  const triggerMockNotifyMessage = (type: 'whatsapp' | 'sms') => {
    if (!selectedTicketForNotification) return;
    const cleanPhone = selectedTicketForNotification.clientPhone.replace(/\D/g, '');
    const message = `¡Hola, ${selectedTicketForNotification.clientName}! Te informamos que tu dispositivo ${selectedTicketForNotification.deviceBrand} ${selectedTicketForNotification.deviceModel} ya está LISTO en Taller de Reparaciones VICELL. El costo total es RD$ ${selectedTicketForNotification.totalPrice.toLocaleString('es-DO')}. ¡Puedes pasar a recogerlo!`;
    
    if (type === 'whatsapp') {
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      setNotifiedMessageStatus('Enviado vía WhatsApp');
    } else {
      setNotifiedMessageStatus('SMS Enviado en segundo plano');
    }

    setTimeout(() => {
      setSelectedTicketForNotification(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Search and context title header */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="font-headline text-2xl font-extrabold text-on-surface tracking-wide">Reparaciones</h2>
        
        {/* Search Bar */}
        <div className="relative glass-panel rounded-xl overflow-hidden flex items-center px-4 py-3 group">
          <Search className="text-on-surface-variant w-5 h-5 group-focus-within:text-primary transition-colors mr-3" />
          <input 
            className="w-full bg-transparent border-none p-0 text-sm font-sans text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none" 
            placeholder="Buscar por cliente, modelo o IMEI..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="ml-2 p-1 rounded-full bg-surface-container-high hover:bg-surface-bright transition-colors text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined text-sm font-medium">qr_code_scanner</span>
          </button>
        </div>

        {/* Segmented Filter control tabs */}
        <div className="glass-panel p-1 rounded-full flex items-center w-full max-w-md mt-2 relative">
          <button 
            onClick={() => setActiveTab('todos')}
            className={`flex-1 py-1.5 relative z-10 font-sans text-xs font-semibold text-center rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === 'todos' ? 'bg-primary/20 border border-primary/30 text-primary bloom-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todos
          </button>
          
          <button 
            onClick={() => setActiveTab('en_proceso')}
            className={`flex-1 py-1.5 relative z-10 font-sans text-xs font-semibold text-center rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === 'en_proceso' ? 'bg-primary/20 border border-primary/30 text-primary bloom-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            En Proceso
          </button>
          
          <button 
            onClick={() => setActiveTab('listos')}
            className={`flex-1 py-1.5 relative z-10 font-sans text-xs font-semibold text-center rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === 'listos' ? 'bg-primary/20 border border-primary/30 text-primary bloom-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Listos
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex flex-col gap-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl">
            <Smartphone className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-sm font-sans text-on-surface-variant">No se encontraron tickets con los filtros actuales.</p>
          </div>
        ) : (
          filteredTickets.map(t => (
            <motion.article 
              layout
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group border border-white/5"
            >
              {/* Left accent border indicating status */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${getLeftAccentBorderColor(t.status)} opacity-80`}></div>

              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-headline text-md font-bold text-on-surface">{t.deviceModel}</span>
                    {getStatusBadge(t.status)}
                  </div>
                  <span className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5">
                    <User className="text-[14px] w-3.5 h-3.5" /> {t.clientName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-headline text-md font-bold text-on-surface block">
                    RD$ {t.totalPrice.toLocaleString('es-DO')}
                  </span>
                  <span className="font-sans text-[8px] tracking-wider text-on-surface-variant uppercase font-bold block mt-0.5">
                    {t.remainingPrice > 0 ? `Pendiente: RD$ ${t.remainingPrice}` : 'Pagado'}
                  </span>
                </div>
              </div>

              {/* Card Body (Details) */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 text-xs font-sans">
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Fallo Reportado</span>
                  <span className="text-white font-medium line-clamp-1">{t.reportedFailure}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">IMEI</span>
                  <span className="text-white font-mono tracking-wider text-[11px] font-semibold">
                    {t.imei.replace(/(\d{4})/g, '$1 ').trim()}
                  </span>
                </div>
              </div>

              {/* Card Footer  */}
              <div className="flex justify-between items-center relative pt-1">
                <div className="flex items-center gap-1.5 text-xs font-sans text-on-surface-variant">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  <span>Ingresado: {t.createdAt}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onShowReceipt(t)}
                    className="px-2.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-sans text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:border-indigo-400/50"
                    title="Ver comprobante para imprimir o compartir"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Recibo</span>
                  </motion.button>

                  {t.remainingPrice > 0 && (
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onPayTicket(t.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-sans text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer transition-all bloom-success"
                      title="Registrar pago completo"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cobrar RD$ {t.remainingPrice.toLocaleString('es-DO')}</span>
                    </motion.button>
                  )}

                  {t.status === 'listo' ? (
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNotifySelect(t)}
                      className="px-4 py-1.5 rounded-lg border border-secondary/50 bg-secondary/10 hover:bg-secondary/25 text-secondary font-sans text-xs font-bold flex items-center gap-2 transition-all cursor-pointer bloom-secondary"
                    >
                      <Send className="w-3 h-3" /> Notificar
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                      <Wrench className="w-3 h-3 text-orange-400" />
                      <span>{t.statusDetail || 'Diagnóstico'}</span>
                    </div>
                  )}

                  <button 
                    onClick={() => onDeleteTicket(t.id)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 cursor-pointer flex items-center justify-center transition-colors border border-transparent"
                    title="Eliminar Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => setShowOptionsId(showOptionsId === t.id ? null : t.id)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-on-surface cursor-pointer flex items-center justify-center transition-colors border border-transparent hover:border-white/5"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Options overlay list context */}
                  <AnimatePresence>
                    {showOptionsId === t.id && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setShowOptionsId(null)}></div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 bottom-8 md:bottom-auto md:top-8 z-30 w-44 rounded-xl border border-white/10 bg-[#161e31] p-1.5 shadow-xl"
                        >
                          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-1 border-b border-white/5 mb-1">
                            Acciones Rápidas
                          </div>

                          {t.remainingPrice > 0 && (
                            <button 
                              onClick={() => {
                                onPayTicket(t.id);
                                setShowOptionsId(null);
                              }}
                              className="w-full text-left text-xs text-emerald-400 font-bold px-2 py-1.5 rounded-lg hover:bg-emerald-400/10 cursor-pointer flex items-center gap-1.5 mb-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cobrar RD$ {t.remainingPrice.toLocaleString('es-DO')}
                            </button>
                          )}
                          
                          <button 
                            onClick={() => {
                              onUpdateTicketStatus(t.id, 'listo');
                              setShowOptionsId(null);
                            }}
                            className="w-full text-left text-xs text-white px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cambiar a Listo
                          </button>
                          
                          <button 
                            onClick={() => {
                              onUpdateTicketStatus(t.id, 'en_proceso');
                              setShowOptionsId(null);
                            }}
                            className="w-full text-left text-xs text-white px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5 text-orange-400" /> En Proceso
                          </button>
                          
                          <button 
                            onClick={() => {
                              onUpdateTicketStatus(t.id, 'esperando_pieza');
                              setShowOptionsId(null);
                            }}
                            className="w-full text-left text-xs text-white px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-primary" /> Espera Pieza
                          </button>
                          
                          <button 
                            onClick={() => {
                              onDeleteTicket(t.id);
                              setShowOptionsId(null);
                            }}
                            className="w-full text-left text-xs text-red-400 font-semibold px-2 py-1.5 rounded-lg hover:bg-red-400/10 border-t border-white/5 mt-1 cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar Ticket
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <motion.button 
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('nuevo_ticket')}
        className="fixed right-6 bottom-[5.5rem] md:bottom-8 w-14 h-14 bg-gradient-to-br from-primary-container to-primary rounded-full flex items-center justify-center text-on-primary-container bloom-primary cursor-pointer active:scale-95 shadow-2xl border border-white/20 hover:shadow-[0_0_20px_rgba(142,127,255,0.4)] transition-all z-40"
      >
        <Plus className="w-7 h-7 text-white font-extrabold" />
      </motion.button>

      {/* Notify Modal popup overlay */}
      <AnimatePresence>
        {selectedTicketForNotification && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md relative font-sans"
            >
              <button 
                onClick={() => setSelectedTicketForNotification(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-on-surface-variant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquareCode className="text-secondary w-5 h-5" />
                  <h3 className="font-headline text-lg font-bold text-white">Notificar Cliente</h3>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Estás avisándole a <strong>{selectedTicketForNotification.clientName}</strong> que su <strong>{selectedTicketForNotification.deviceModel}</strong> ya está terminado:
                </p>

                <div className="bg-surface-container-lowest p-3 rounded-xl border border-white/5 text-xs leading-relaxed space-y-2">
                  <p className="text-white italic">
                    "Hola {selectedTicketForNotification.clientName}, tu {selectedTicketForNotification.deviceModel} está listo en Taller de Reparaciones VICELL. Costo: RD$ {selectedTicketForNotification.totalPrice.toLocaleString('es-DO')}. Puedes venir por él."
                  </p>
                </div>

                {notifiedMessageStatus ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-400/10 p-2.5 rounded-xl border border-emerald-400/20">
                    <Check className="w-4 h-4" />
                    <span>{notifiedMessageStatus}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => triggerMockNotifyMessage('whatsapp')}
                      className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      WhatsApp Link
                    </button>
                    <button 
                      onClick={() => triggerMockNotifyMessage('sms')}
                      className="bg-secondary text-on-secondary font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bloom-secondary"
                    >
                      Enviar SMS
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
