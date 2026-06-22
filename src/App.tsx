import React, { useState, useEffect } from 'react';
import { Ticket, Expense, Encargo, TicketStatus, VentaUsado, SparePart } from './types';
import { 
  INITIAL_TICKETS, 
  INITIAL_EXPENSES, 
  INITIAL_ENCARGOS,
  INITIAL_VENTAS_USADOS,
  INITIAL_SPARE_PARTS
} from './data';

import DashboardView from './components/DashboardView';
import TicketsView from './components/TicketsView';
import GastosView from './components/GastosView';
import EncargosView from './components/EncargosView';
import VentasUsadosView from './components/VentasUsadosView';
import NuevoTicketView from './components/NuevoTicketView';
import ReporteMensualView from './components/ReporteMensualView';

import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Wrench, 
  ShoppingBag, 
  Settings, 
  User, 
  Check, 
  Smartphone, 
  BellRing,
  HelpCircle,
  X,
  Camera,
  Upload,
  Sun,
  Moon,
  FileText,
  Printer,
  Share2
} from 'lucide-react';

export default function App() {
  // State loaded from LocalStorage or seeded defaults
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('vicell_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('vicell_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [encargos, setEncargos] = useState<Encargo[]>(() => {
    const saved = localStorage.getItem('vicell_encargos');
    return saved ? JSON.parse(saved) : INITIAL_ENCARGOS;
  });

  const [ventasUsados, setVentasUsados] = useState<VentaUsado[]>(() => {
    const saved = localStorage.getItem('vicell_ventas_usados');
    return saved ? JSON.parse(saved) : INITIAL_VENTAS_USADOS;
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    const saved = localStorage.getItem('vicell_spare_parts');
    return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'tickets' | 'encargos' | 'gastos' | 'nuevo_ticket' | 'ventas_usados' | 'reportes'>('dashboard');

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('vicell_user_avatar') || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbriOdG87-t3TsrWCmQVFFUasGRU45KGqSrN-xP0uxG5zC58nyjMHsSPhDLS1h4ESjlgY9yvCG4vinzocQeeBfhFwfgdb2EM46p4ExEnewBNBM_WVTM-YLp0zRe-e4-NLqdmPAPtMRRceK1tO2bcGn0yAo1S-RWWZZvmOsv7TvfsqEoy6vGSH_oHIDdc5Kdee7ok7VkjgcR4lRRoWO_7rOCFpx9CmEAOEgEIOOEEJcK1ogyDGXftiMbhTaSWkIBw6TmYO9d7OklRm';
  });

  const [businessName, setBusinessName] = useState<string>(() => {
    return localStorage.getItem('vicell_business_name') || 'VICELL';
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempBusinessName, setTempBusinessName] = useState('VICELL');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('vicell_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('vicell_dark_mode', String(darkMode));
  }, [darkMode]);

  // Simple quick notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Custom quick modal overlay for receipt print and WhatsApp share
  const [showReceiptModal, setShowReceiptModal] = useState<any | null>(null);
  
  // Custom quick modal overlay for "+ Venta Encargo" from dashboard
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [quickOrderClient, setQuickOrderClient] = useState('');
  const [quickOrderItem, setQuickOrderItem] = useState('');
  const [quickOrderPrice, setQuickOrderPrice] = useState('');
  const [quickOrderCost, setQuickOrderCost] = useState('');

  // Persist settings in storage on any state mutations
  useEffect(() => {
    localStorage.setItem('vicell_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('vicell_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('vicell_encargos', JSON.stringify(encargos));
  }, [encargos]);

  useEffect(() => {
    localStorage.setItem('vicell_ventas_usados', JSON.stringify(ventasUsados));
  }, [ventasUsados]);

  useEffect(() => {
    localStorage.setItem('vicell_spare_parts', JSON.stringify(spareParts));
  }, [spareParts]);

  // Automated Fixed Expense Generation: checks if we have reached or passed the 15th of the current month
  // and yields a pending invoice of RD$ 1,450.00 for the Internet Service if it hasn't been generated yet.
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    if (currentDay >= 15) {
      const monthsSpanish = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthName = monthsSpanish[today.getMonth()];
      const expenseTitle = `Pago de Internet (Gasto Fijo) - 15 de ${monthName} ${currentYear}`;
      
      setExpenses(prev => {
        const alreadyExists = prev.some(e => e.title === expenseTitle);
        if (!alreadyExists) {
          const newExpense: Expense = {
            id: `e_fixed15_internet_${currentMonth}_${currentYear}`,
            title: expenseTitle,
            amount: 1450,
            category: 'fijo',
            date: `Día 15, ${monthName} ${currentYear}`,
            status: 'pendiente'
          };
          setTimeout(() => {
            triggerToast(`📅 Generada Automáticamente: Factura de Internet (${monthName}) por RD$ 1,450.00`);
          }, 1200);
          return [newExpense, ...prev];
        }
        return prev;
      });
    }
  }, []);

  // Helper trigger Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add standard Ticket handler
  const handleAddTicket = (newTicketData: Omit<Ticket, 'id' | 'remainingPrice' | 'createdAt'>) => {
    const newId = 't_' + Math.random().toString(36).substr(2, 9);
    const newRem = Math.max(0, newTicketData.totalPrice - newTicketData.advancePaid);
    
    // Format current local time nicely matching the prompt layout style
    const nowTimeStr = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = `Hoy, ${nowTimeStr}`;

    const newTicket: Ticket = {
      ...newTicketData,
      id: newId,
      remainingPrice: newRem,
      createdAt: formattedDate
    };

    setTickets([newTicket, ...tickets]);
    setCurrentView('tickets');
    triggerToast(`Ticket de reparación registrado para ${newTicketData.clientName}`);
  };

  // Update Status handler
  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        let statusDetail = 'Estado actualizado';
        let advancePaid = t.advancePaid;
        let remainingPrice = t.remainingPrice;

        if (status === 'listo') {
          statusDetail = 'Listo para entrega';
          // When a phone is ready for pick up we can assume it can be settled,
          // or keep the balance until they hand over.
        } else if (status === 'en_proceso') {
          statusDetail = 'En mesa de trabajo #2';
        } else if (status === 'esperando_pieza') {
          statusDetail = 'Llega mañana';
        }

        return { ...t, status, statusDetail, advancePaid, remainingPrice };
      }
      return t;
    }));
    triggerToast(`Estado del ticket modificado con éxito`);
  };

  // Pay complete ticket amount handler
  const handlePayTicket = (ticketId: string) => {
    let paidTicketRef: any = null;
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        const u = {
          ...t,
          advancePaid: t.totalPrice,
          remainingPrice: 0,
          status: 'listo' as const,
          statusDetail: 'Listo para entrega (Pagado)'
        };
        paidTicketRef = u;
        return u;
      }
      return t;
    });
    setTickets(updatedTickets);
    triggerToast('¡Pago de reparación registrado de manera exitosa!');
    if (paidTicketRef) {
      setShowReceiptModal(paidTicketRef);
    }
  };

  // Print Receipt thermal template opener
  const handlePrintReceipt = (ticket: any) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      triggerToast('Error: Habilite los permisos de ventana emergente para imprimir.');
      return;
    }
    
    // Build real-time readable timestamp
    const nowStr = new Date().toLocaleString('es-DO', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Comprobante VICELL - ${ticket.id}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm; 
              margin: 0 auto; 
              padding: 12px 6px; 
              font-size: 11px; 
              line-height: 1.3; 
              color: #000;
              background-color: #fff;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .header-title { font-size: 15px; font-weight: bold; margin-bottom: 2px; }
            .flex-row { display: flex; justify-content: space-between; }
            .total-row { font-size: 12px; margin-top: 4px; }
            .footer-notes { font-size: 9px; margin-top: 18px; text-align: center; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="center header-title">${businessName.toUpperCase()}</div>
          <div class="center">Taller de Reparaciones y Accesorios</div>
          <div class="center">República Dominicana</div>
          <div class="center" style="font-size: 9px; margin-top: 2px;">Impreso: ${nowStr}</div>
          <div class="divider"></div>
          
          <div><span class="bold">COMPROBANTE #:</span> ${ticket.id}</div>
          <div><span class="bold">CLIENTE:</span> ${ticket.clientName}</div>
          <div><span class="bold">TEL&Eacute;FONO:</span> ${ticket.clientPhone}</div>
          <div class="divider"></div>
          
          <div class="bold center" style="font-size: 12px; margin-bottom: 4px;">DETALLES DEL TRABAJO</div>
          <div><span class="bold">EQUIPO:</span> ${ticket.deviceBrand} ${ticket.deviceModel}</div>
          ${ticket.deviceSerialNumber ? `<div><span class="bold">SERIAL/IMEI:</span> ${ticket.deviceSerialNumber}</div>` : ''}
          <div><span class="bold">FALLA/REP:</span> ${ticket.problemDescription}</div>
          <div class="divider"></div>
          
          <div class="bold center" style="margin-bottom: 4px;">DETALLE DE CUENTA</div>
          <div class="flex-row"><span>Costo de Reparaci&oacute;n:</span> <span>RD$ ${ticket.totalPrice.toLocaleString('es-DO')}</span></div>
          <div class="flex-row"><span>Monto Abonado:</span> <span>RD$ ${ticket.advancePaid.toLocaleString('es-DO')}</span></div>
          <div class="flex-row"><span>Balance Pendiente:</span> <span>RD$ ${ticket.remainingPrice.toLocaleString('es-DO')}</span></div>
          <div class="divider"></div>
          
          <div class="center bold" style="font-size: 12px; border: 1px solid #000; padding: 4px; margin: 6px 0;">
            ${ticket.remainingPrice === 0 ? 'PAGADO COMPLETAMENTE' : 'SALDO PENDIENTE'}
          </div>
          
          <div class="footer-notes">
            &iexcl;Gracias por preferir VICELL!<br>
            Cualquier garant&iacute;a requiere presentar este comprobante f&iacute;sico.<br>
            Tel: ${ticket.clientPhone ? ticket.clientPhone : 'Contacto Local'}<br>
            &iexcl;Dios le bendiga!
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    triggerToast('¡Comprobante enviado a la cola de impresión!');
  };

  // Share Receipt text via WhatsApp API direct link
  const handleShareReceiptWhatsApp = (ticket: any) => {
    let cleanPhone = ticket.clientPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      // DR Country code is 1 (shares North American formatting)
      cleanPhone = '1' + cleanPhone;
    }

    const business = businessName.toUpperCase();
    const textMessage = `🧾 *TICKET DE REPARACIÓN - ${business}* 🧾\n\n` +
      `📌 *Ticket Nro:* ${ticket.id}\n` +
      `👤 *Cliente:* ${ticket.clientName}\n` +
      `📞 *Contacto:* ${ticket.clientPhone}\n\n` +
      `📱 *Detalle del Dispositivo:*\n` +
      `▫️ *Equipo:* ${ticket.deviceBrand} ${ticket.deviceModel}\n` +
      (ticket.deviceSerialNumber ? `▫️ *Serial/IMEI:* ${ticket.deviceSerialNumber}\n` : '') +
      `▫️ *Trabajo a Realizar:* ${ticket.problemDescription}\n\n` +
      `💵 *Información de Pago:*\n` +
      `▫️ *Costo Total:* RD$ ${ticket.totalPrice.toLocaleString('es-DO')}\n` +
      `▫️ *Monto Pagado:* RD$ ${ticket.advancePaid.toLocaleString('es-DO')}\n` +
      `▫️ *Monto Restante:* RD$ ${ticket.remainingPrice.toLocaleString('es-DO')}\n\n` +
      `🔔 *Estado General:* ${ticket.remainingPrice === 0 ? '✅ *¡PAGADO TOTALMENTE Y ENTREGADO!*' : '⚠️ *SALDO PENDIENTE POR RECOGER*'}\n\n` +
      `🙌🏻 ¡Gracias por confiar en nosotros! Estamos a tus órdenes para lo que necesites.`;

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, '_blank');
    triggerToast('Abriendo enlace de WhatsApp...');
  };

  // Delete Ticket handler
  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter(t => t.id !== ticketId));
    triggerToast(`Ticket eliminado correctamente`);
  };

  // Add Gasto Expense handler
  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newId = 'e_' + Math.random().toString(36).substr(2, 9);
    const newExpense: Expense = {
      ...newExpenseData,
      id: newId
    };
    setExpenses([newExpense, ...expenses]);
    triggerToast(`Gasto "${newExpenseData.title}" anotado correctamente`);
  };

  // Delete Gasto Expense handler
  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
    triggerToast(`Gasto eliminado correctamente`);
  };

  // Pay Gasto Expense handler
  const handlePayExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        return { ...e, status: 'completado' };
      }
      return e;
    }));
    triggerToast('¡Pago de factura registrado de manera exitosa!');
  };

  // Add Special Order/Sale handler
  const handleAddEncargo = (newEncargoData: Omit<Encargo, 'id' | 'gain'>) => {
    const newId = 'o_' + Math.random().toString(36).substr(2, 9);
    const gain = Math.max(0, newEncargoData.price - newEncargoData.cost);
    
    const newEncargo: Encargo = {
      ...newEncargoData,
      id: newId,
      gain
    };
    setEncargos([newEncargo, ...encargos]);
    triggerToast(`Pedido de teléfono "${newEncargoData.itemName}" registrado`);
  };

  // Deliver Special Order
  const handleDeliverEncargo = (id: string) => {
    setEncargos(encargos.map(o => {
      if (o.id === id) {
        return { ...o, status: 'entregado' };
      }
      return o;
    }));
    triggerToast(`Teléfono marcado como entregado y cobrado`);
  };

  // Delete Special Order
  const handleDeleteEncargo = (id: string) => {
    setEncargos(encargos.filter(o => o.id !== id));
    triggerToast(`Pedido de teléfono eliminado`);
  };

  // Add used phone sale handler
  const handleAddVentaUsado = (newVentaData: Omit<VentaUsado, 'id' | 'gain'>) => {
    const newId = 'vu_' + Math.random().toString(36).substr(2, 9);
    const gain = Math.max(0, newVentaData.sellPrice - newVentaData.purchaseCost);
    
    const newVenta: VentaUsado = {
      ...newVentaData,
      id: newId,
      gain
    };
    setVentasUsados([newVenta, ...ventasUsados]);
    triggerToast(`Venta de teléfono usado "${newVentaData.phoneModel}" registrada`);
  };

  // Delete used phone sale handler
  const handleDeleteVentaUsado = (id: string) => {
    setVentasUsados(ventasUsados.filter(v => v.id !== id));
    triggerToast(`Registro de teléfono usado eliminado`);
  };

  // Reset and clear all data to start fresh
  const handleClearAllData = () => {
    setTickets([]);
    setExpenses([]);
    setEncargos([]);
    setVentasUsados([]);
    localStorage.removeItem('vicell_tickets');
    localStorage.removeItem('vicell_expenses');
    localStorage.removeItem('vicell_encargos');
    localStorage.removeItem('vicell_ventas_usados');
    triggerToast('Todos los datos han sido borrados. ¡Listo para comenzar desde cero!');
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast('La imagen es muy grande. Elige una menor a 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserAvatar(base64String);
        localStorage.setItem('vicell_user_avatar', base64String);
        triggerToast('¡Foto de perfil actualizada!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempBusinessName.trim()) {
      setBusinessName(tempBusinessName);
      localStorage.setItem('vicell_business_name', tempBusinessName);
      triggerToast('Información de perfil guardada con éxito');
      setShowProfileModal(false);
    }
  };

  const handleResetProfile = () => {
    const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbriOdG87-t3TsrWCmQVFFUasGRU45KGqSrN-xP0uxG5zC58nyjMHsSPhDLS1h4ESjlgY9yvCG4vinzocQeeBfhFwfgdb2EM46p4ExEnewBNBM_WVTM-YLp0zRe-e4-NLqdmPAPtMRRceK1tO2bcGn0yAo1S-RWWZZvmOsv7TvfsqEoy6vGSH_oHIDdc5Kdee7ok7VkjgcR4lRRoWO_7rOCFpx9CmEAOEgEIOOEEJcK1ogyDGXftiMbhTaSWkIBw6TmYO9d7OklRm';
    setUserAvatar(defaultAvatar);
    localStorage.removeItem('vicell_user_avatar');
    setBusinessName('VICELL');
    setTempBusinessName('VICELL');
    localStorage.removeItem('vicell_business_name');
    triggerToast('Se restableció el perfil predeterminado');
    setShowProfileModal(false);
  };

  // Quick order handler from dashboard
  const handleQuickOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOrderClient || !quickOrderItem || !quickOrderPrice || !quickOrderCost) return;

    handleAddEncargo({
      clientName: quickOrderClient,
      clientPhone: '809-555-0100',
      itemName: quickOrderItem,
      quantity: 1,
      price: parseFloat(quickOrderPrice),
      cost: parseFloat(quickOrderCost),
      status: 'entregado',
      date: new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
    });

    setQuickOrderClient('');
    setQuickOrderItem('');
    setQuickOrderPrice('');
    setQuickOrderCost('');
    setShowQuickOrderModal(false);
  };

  return (
    <div className="min-h-screen relative font-sans text-on-surface">
      {/* Top Application Bar */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 shadow-none">
        {/* Leading Brand/Logo like Stratos */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="font-headline text-lg font-extrabold tracking-tight text-slate-900">{businessName}</span>
        </div>

        {/* Trailing Controls */}
        <div className="flex gap-3 items-center">
          <div className="hidden sm:flex px-3 py-1 bg-[#eff6ff] border border-blue-200 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            v2.4.0 Active
          </div>
          {/* Settings / Gastos Toggle */}
          <button 
            onClick={() => setCurrentView('gastos')}
            className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent flex items-center justify-center ${
              currentView === 'gastos' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Gastos / Ajustes"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => {
              setTempBusinessName(businessName);
              setShowProfileModal(true);
            }}
            className="w-10 h-10 bg-slate-300 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 cursor-pointer active:scale-95 transition-transform relative group flex items-center justify-center p-0"
            title="Editar Perfil / Foto"
          >
            <img 
              alt="User avatar Vicell" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
              src={userAvatar}
            />
            <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        </div>
      </header>

      {/* Main Canvas Content */}
      <main className="px-6 pt-20 pb-28 max-w-2xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'dashboard' && (
              <DashboardView 
                tickets={tickets}
                expenses={expenses}
                encargos={encargos}
                ventasUsados={ventasUsados}
                spareParts={spareParts}
                onChangeSpareParts={setSpareParts}
                onNavigate={setCurrentView}
                onAddQuickVenta={() => setShowQuickOrderModal(true)}
                onAddQuickVentaUsado={() => setCurrentView('ventas_usados')}
              />
            )}

            {currentView === 'tickets' && (
              <TicketsView 
                tickets={tickets}
                onNavigate={setCurrentView}
                onUpdateTicketStatus={handleUpdateTicketStatus}
                onDeleteTicket={handleDeleteTicket}
                onPayTicket={handlePayTicket}
                onShowReceipt={setShowReceiptModal}
              />
            )}

            {currentView === 'encargos' && (
              <EncargosView 
                encargos={encargos}
                onAddEncargo={handleAddEncargo}
                onDeliverEncargo={handleDeliverEncargo}
                onDeleteEncargo={handleDeleteEncargo}
              />
            )}

            {currentView === 'gastos' && (
              <GastosView 
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onPayExpense={handlePayExpense}
                onNavigate={setCurrentView}
                onClearAllData={handleClearAllData}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
              />
            )}

            {currentView === 'nuevo_ticket' && (
              <NuevoTicketView 
                onBack={() => setCurrentView('dashboard')}
                onAddTicket={handleAddTicket}
              />
            )}

            {currentView === 'ventas_usados' && (
              <VentasUsadosView 
                ventas={ventasUsados}
                onAddVenta={handleAddVentaUsado}
                onDeleteVenta={handleDeleteVentaUsado}
              />
            )}

            {currentView === 'reportes' && (
              <ReporteMensualView 
                tickets={tickets}
                expenses={expenses}
                encargos={encargos}
                ventasUsados={ventasUsados}
                onBack={() => setCurrentView('dashboard')}
                businessName={businessName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Bar for mobile devices */}
      <nav id="bottom-navbar" className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 pb-safe bg-white/85 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(15,23,42,0.05)] rounded-t-2xl md:hidden">
        {/* Dashboard */}
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            currentView === 'dashboard' 
              ? 'text-indigo-600 scale-110 font-bold' 
              : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Dashboard</span>
        </button>

        {/* Tickets */}
        <button 
          onClick={() => setCurrentView('tickets')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            currentView === 'tickets' 
              ? 'text-indigo-600 scale-110 font-bold' 
              : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Tickets</span>
        </button>

        {/* Encargos */}
        <button 
          onClick={() => setCurrentView('encargos')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            currentView === 'encargos' 
              ? 'text-indigo-600 scale-110 font-bold' 
              : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Encargos</span>
        </button>

        {/* Ventas Usados */}
        <button 
          onClick={() => setCurrentView('ventas_usados')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            currentView === 'ventas_usados' 
              ? 'text-indigo-600 scale-110 font-bold' 
              : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Usados</span>
        </button>

        {/* Settings/Gastos */}
        <button 
          onClick={() => setCurrentView('gastos')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            currentView === 'gastos' 
              ? 'text-indigo-600 scale-110 font-bold' 
              : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Settings</span>
        </button>
      </nav>

      {/* Desktop Side Navigation drawer (visible on larger displays md+) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-20 bg-white/70 backdrop-blur-md border-r border-slate-200/80 z-30 items-center py-8 gap-8">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            currentView === 'dashboard' 
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-150 bloom-secondary shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Dashboard"
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setCurrentView('tickets')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            currentView === 'tickets' 
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-150 bloom-secondary shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Reparaciones / Tickets"
        >
          <Wrench className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setCurrentView('encargos')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            currentView === 'encargos' 
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-150 bloom-secondary shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Venta de Teléfonos por Encargo"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setCurrentView('ventas_usados')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            currentView === 'ventas_usados' 
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-150 bloom-secondary shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Venta de Teléfonos Usados"
        >
          <Smartphone className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setCurrentView('gastos')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            currentView === 'gastos' 
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-150 bloom-secondary shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Control de Gastos"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setCurrentView('reportes')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            currentView === 'reportes' 
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-150 bloom-secondary shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Reporte Mensual"
        >
          <FileText className="w-5 h-5" />
        </button>
      </aside>

      {/* Interactive Quick Add Order Overlay Modal */}
      {/* Hidden file input for Profile Avatar */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/*" 
        className="hidden" 
      />

      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative light */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <User className="text-blue-400 w-5 h-5" />
                  <h3 className="font-headline text-md font-bold text-white">Editar Perfil del Negocio</h3>
                </div>

                {/* Avatar uploader container */}
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="relative w-20 h-20 bg-slate-800 rounded-full border-2 border-white/20 shadow-lg overflow-hidden group">
                    <img 
                      src={userAvatar} 
                      alt="User Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-white mb-0.5" />
                      <span className="text-[8px] text-white font-medium uppercase">Subir</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-blue-400 font-bold hover:underline"
                  >
                    Cambiar Foto de Perfil
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Nombre del Negocio / Personal</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. VICELL"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={tempBusinessName}
                    onChange={(e) => setTempBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Modo de Apariencia</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDarkMode(false)}
                      className={`h-10 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                        !darkMode 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" /> Claro
                    </button>
                    <button
                      type="button"
                      onClick={() => setDarkMode(true)}
                      className={`h-10 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                        darkMode 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" /> Oscuro
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:opacity-90 font-bold text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Check className="w-4 h-4" /> Guardar Cambios
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleResetProfile}
                    className="w-full h-10 rounded-xl border border-white/5 hover:bg-white/5 font-medium text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Restablecer Valores Predeterminados
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showQuickOrderModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm relative font-sans"
            >
              <button 
                onClick={() => setShowQuickOrderModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-on-surface-variant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleQuickOrderSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="text-secondary w-5 h-5" />
                  <h3 className="font-headline text-md font-bold text-white">Vender Teléfono por Encargo</h3>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Cliente</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nombre del comprador"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={quickOrderClient}
                    onChange={(e) => setQuickOrderClient(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Teléfono / Modelo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. iPhone 15 Pro o Galaxy S24"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={quickOrderItem}
                    onChange={(e) => setQuickOrderItem(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Costo (RD$)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Taller"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs text-red-300 font-bold"
                      value={quickOrderCost}
                      onChange={(e) => setQuickOrderCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface-variant">Precio (RD$)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Venta"
                      className="w-full h-11 px-4 rounded-xl glass-input text-xs text-emerald-300 font-bold"
                      value={quickOrderPrice}
                      onChange={(e) => setQuickOrderPrice(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-br from-secondary-container to-secondary hover:opacity-90 font-bold text-xs text-on-secondary-container flex items-center justify-center gap-1 cursor-pointer mt-2 bloom-secondary"
                >
                  <Check className="w-4 h-4 text-on-secondary-container" /> Registrar Venta Directa
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recibo / Print & Share Ticket Modal */}
      <AnimatePresence>
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm relative font-sans shadow-2xl"
            >
              {/* Close Button top-right */}
              <button 
                onClick={() => setShowReceiptModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-slate-400 hover:text-white"
                title="Cerrar recibo"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                {/* Visual indicator of success / completed */}
                <div className="flex flex-col items-center text-center pb-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-2 bloom-success border border-emerald-500/30">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="font-headline text-lg font-black text-white">Comprobante de Caja</h3>
                  <p className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-400/20">
                    {showReceiptModal.remainingPrice === 0 ? 'Reparación Entregada / Pagada' : 'Reparación Registrada'}
                  </p>
                </div>

                {/* Tactile Thermal paper receipt replica */}
                <div className="bg-stone-50 text-stone-900 p-5 rounded-lg font-mono text-xs shadow-inner relative border-y-4 border-dashed border-stone-300 overflow-hidden leading-snug">
                  {/* Decorative receipt watermarks or header */}
                  <div className="text-center font-bold text-sm tracking-wider uppercase border-b border-stone-300 pb-2 mb-2">
                    📱 {businessName} 📱
                  </div>
                  <div className="text-center text-[10px] text-stone-500 mb-3 -mt-1">
                    República Dominicana
                  </div>

                  {/* Receipt Core Fields */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="font-bold">TICKET #:</span>
                      <span className="text-stone-700">{showReceiptModal.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">CLIENTE:</span>
                      <span className="truncate max-w-[150px] text-stone-700">{showReceiptModal.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">CONTACTO:</span>
                      <span className="text-stone-700">{showReceiptModal.clientPhone}</span>
                    </div>
                    
                    <div className="border-t border-stone-300 border-dashed my-2"></div>
                    
                    <div>
                      <span className="font-bold text-stone-500">TRABAJO/EQUIPO:</span>
                      <p className="font-medium text-stone-800 mt-0.5">{showReceiptModal.deviceBrand} {showReceiptModal.deviceModel}</p>
                    </div>
                    {showReceiptModal.deviceSerialNumber && (
                      <div className="flex justify-between text-[10px] text-stone-600">
                        <span>SER/IMEI:</span>
                        <span className="truncate max-w-[170px]">{showReceiptModal.deviceSerialNumber}</span>
                      </div>
                    )}
                    <div className="mt-1">
                      <span className="font-bold text-stone-500">FALLA EXPLICADA:</span>
                      <p className="italic text-stone-700 mt-0.5">{showReceiptModal.problemDescription}</p>
                    </div>

                    <div className="border-t border-stone-300 border-dashed my-2"></div>

                    {/* Financial Summary */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-stone-600">
                        <span>Costo Total:</span>
                        <span>RD$ {showReceiptModal.totalPrice.toLocaleString('es-DO')}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Monto Abonado:</span>
                        <span>RD$ {showReceiptModal.advancePaid.toLocaleString('es-DO')}</span>
                      </div>
                      <div className="flex justify-between text-stone-800 font-bold border-t border-stone-200 pt-1 text-[13px]">
                        <span>Pendiente:</span>
                        <span className={showReceiptModal.remainingPrice === 0 ? 'text-emerald-600 font-extrabold' : 'text-red-600 font-extrabold'}>
                          RD$ {showReceiptModal.remainingPrice.toLocaleString('es-DO')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Ticket gratitude message */}
                  <div className="text-center text-[9px] text-stone-500 mt-4 pt-2 border-t border-stone-300 border-dashed italic">
                    ¡Gracias por preferir VICELL!<br/>
                    Garantía válida con comprobante físico.
                  </div>
                </div>

                {/* Print and Share Instant Action Buttons */}
                <div className="space-y-2 pt-1.5">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Print receipt */}
                    <button 
                      onClick={() => handlePrintReceipt(showReceiptModal)}
                      className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg border border-indigo-400/20"
                    >
                      <Printer className="w-4 h-4 shrink-0 text-indigo-200" />
                      <span>Imprimir Ticket</span>
                    </button>

                    {/* WhatsApp share receipt */}
                    <button 
                      onClick={() => handleShareReceiptWhatsApp(showReceiptModal)}
                      className="bg-[#25D366] hover:bg-[#20ba56] active:bg-[#1b9e4a] text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg border border-white/5"
                    >
                      <Share2 className="w-4 h-4 shrink-0 text-emerald-100" />
                      <span>Compartir WA</span>
                    </button>
                  </div>

                  {/* Simple Close Neutral Button */}
                  <button 
                    onClick={() => setShowReceiptModal(null)}
                    className="w-full py-3 border border-white/10 hover:bg-white/5 active:bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Cerrar Comprobante
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick alert Toast notification bar */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[92px] md:bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#161e31] border border-secondary/30 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2"
          >
            <BellRing className="text-secondary w-4 h-4 animate-bounce shrink-0" />
            <span className="text-xs text-white font-medium whitespace-nowrap">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
