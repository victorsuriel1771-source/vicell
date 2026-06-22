import React, { useState } from 'react';
import { Ticket, Expense, Encargo, VentaUsado, SparePart, SparePartType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Wrench, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShoppingBasket, 
  AlertTriangle, 
  Activity, 
  ChevronRight, 
  Bell, 
  CheckCircle2, 
  X,
  Smartphone,
  Phone,
  Clock,
  FileText,
  Package,
  Plus,
  Minus,
  AlertCircle,
  Trash2,
  Settings2,
  Battery
} from 'lucide-react';

interface DashboardViewProps {
  tickets: Ticket[];
  expenses: Expense[];
  encargos: Encargo[];
  ventasUsados: VentaUsado[];
  spareParts: SparePart[];
  onChangeSpareParts: React.Dispatch<React.SetStateAction<SparePart[]>>;
  onNavigate: (view: 'dashboard' | 'tickets' | 'encargos' | 'gastos' | 'nuevo_ticket' | 'ventas_usados' | 'reportes') => void;
  onAddQuickVenta: () => void;
  onAddQuickVentaUsado: () => void;
}

export default function DashboardView({
  tickets,
  expenses,
  encargos,
  ventasUsados,
  spareParts = [],
  onChangeSpareParts,
  onNavigate,
  onAddQuickVenta,
  onAddQuickVentaUsado
}: DashboardViewProps) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showIndicatorDetail, setShowIndicatorDetail] = useState<'ganancia' | 'ingresos' | 'gastos' | null>(null);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'usados' | 'repuestos'>('pedidos');
  const [chartPeriod, setChartPeriod] = useState<string>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Spare parts management states
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartType, setNewPartType] = useState<SparePartType>('pantalla');
  const [newPartStock, setNewPartStock] = useState<number>(5);
  const [newPartThreshold, setNewPartThreshold] = useState<number>(2);
  const [newPartCost, setNewPartCost] = useState<number>(1000);
  const [partSearch, setPartSearch] = useState('');
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [editingThresholdValue, setEditingThresholdValue] = useState<number>(2);

  // Dynamic calculations
  // Precompile some figures
  const totalTicketIncome = tickets.reduce((acc, t) => acc + t.totalPrice, 0);
  const totalPaidTickets = tickets.reduce((acc, t) => acc + t.advancePaid, 0);
  const totalRemainingTickets = tickets.reduce((acc, t) => acc + t.remainingPrice, 0);

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const deliveredEncargosPrice = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.price, 0);
  const deliveredEncargosGain = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.gain, 0);
  const deliveredEncargosCost = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.cost, 0);

  const totalVentasUsadosPrice = ventasUsados.reduce((acc, v) => acc + v.sellPrice, 0);
  const totalVentasUsadosGain = ventasUsados.reduce((acc, v) => acc + v.gain, 0);
  const totalVentasUsadosCost = ventasUsados.reduce((acc, v) => acc + v.purchaseCost, 0);

  // Comienza la ganancia histórica desde cero para reflejar únicamente las operaciones reales registradas
  const baseGain = 0; 
  const gananciaReal = baseGain + totalPaidTickets + deliveredEncargosGain + totalVentasUsadosGain - totalExpenseAmount;

  // Ingresos del mes
  // Las reparaciones se pagan, pedidos y equipos
  const ingresosDelMes = totalPaidTickets + deliveredEncargosPrice + totalVentasUsadosPrice;

  // Gastos del mes
  const gastosDelMes = totalExpenseAmount;

  // Helper to parse Spanish formatted dates or relative key phrases safely
  const parseDateToDateTime = (dateStr: string): Date => {
    const now = new Date();
    if (!dateStr) return now;

    const lowercase = dateStr.toLowerCase().trim();

    // 1. Check relative keywords
    if (lowercase.includes('hoy')) {
      return now;
    }
    if (lowercase.includes('ayer')) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }
    const matchRelative = lowercase.match(/hace\s+(\d+)\s+días/);
    const matchRelativeNoAcc = lowercase.match(/hace\s+(\d+)\s+dias/);
    const daysMatch = matchRelative || matchRelativeNoAcc;
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    }

    // 2. Check ISO representation YYYY-MM-DD
    const isoMatch = lowercase.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
    }

    // 3. Check patterns like "Día 15, Junio 2026"
    const diaMatch = lowercase.match(/día\s+(\d+),\s+(\w+)\s+(\d{4})/i);
    if (diaMatch) {
      const day = parseInt(diaMatch[1], 10);
      const monthName = diaMatch[2];
      const year = parseInt(diaMatch[3], 10);
      const monthIndex = getSpanishMonthIndex(monthName);
      return new Date(year, monthIndex, day);
    }

    // General format: e.g. "20 Jun, 2026" or "20 Jun", "15 de Junio 2026"
    const spanishMonths = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const spanishMonthsShort = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];

    let foundMonthIndex = -1;
    for (let m = 0; m < 12; m++) {
      if (lowercase.includes(spanishMonths[m]) || lowercase.includes(spanishMonthsShort[m])) {
        foundMonthIndex = m;
        break;
      }
    }

    if (foundMonthIndex !== -1) {
      const numbers = lowercase.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const day = parseInt(numbers[0], 10);
        let year = now.getFullYear();
        if (numbers.length > 1) {
          const potentialYear = parseInt(numbers[1], 10);
          if (potentialYear > 2000 && potentialYear < 2100) {
            year = potentialYear;
          }
        }
        return new Date(year, foundMonthIndex, day);
      }
    }

    const fallback = new Date(dateStr);
    if (!isNaN(fallback.getTime())) {
      return fallback;
    }

    return now;
  };

  const getSpanishMonthIndex = (monthName: string): number => {
    const spanishMonths = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const idx = spanishMonths.findIndex(m => monthName.toLowerCase().includes(m));
    return idx !== -1 ? idx : new Date().getMonth();
  };

  const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const chartData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Determine the list of target dates
    const targetDates: Date[] = [];
    
    if (chartPeriod === '7days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        targetDates.push(d);
      }
    } else if (chartPeriod === '15days') {
      for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        targetDates.push(d);
      }
    } else if (chartPeriod === '30days') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        targetDates.push(d);
      }
    } else if (chartPeriod === 'thisMonth') {
      const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const daysCount = today.getDate();
      for (let i = 0; i < daysCount; i++) {
        const d = new Date(startOfCurrentMonth);
        d.setDate(startOfCurrentMonth.getDate() + i);
        targetDates.push(d);
      }
    } else if (chartPeriod === 'lastMonth') {
      const temp = new Date();
      temp.setDate(1); 
      temp.setMonth(temp.getMonth() - 1);
      const lastMonthYear = temp.getFullYear();
      const lastMonthIndex = temp.getMonth();
      const daysInLastMonth = new Date(lastMonthYear, lastMonthIndex + 1, 0).getDate();
      
      for (let i = 1; i <= daysInLastMonth; i++) {
        targetDates.push(new Date(lastMonthYear, lastMonthIndex, i));
      }
    } else if (chartPeriod === 'custom') {
      const start = new Date(customStartDate + 'T00:00:00');
      const end = new Date(customEndDate + 'T00:00:00');
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        // Clamp to maximum 60 days
        const diffMs = end.getTime() - start.getTime();
        let daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (daysDiff > 60) {
          daysDiff = 60;
        }
        for (let i = 0; i <= daysDiff; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          targetDates.push(d);
        }
      } else {
        // Fallback to last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          targetDates.push(d);
        }
      }
    }

    // Now compute actual stats for each target date
    targetDates.forEach(targetDate => {
      targetDate.setHours(0, 0, 0, 0);
      const dayName = dayNames[targetDate.getDay()];
      const dayNum = targetDate.getDate();
      const monthNum = targetDate.getMonth() + 1;
      const formattedLabel = `${dayName} ${dayNum}/${monthNum}`;
      
      let dailyTicketIncome = 0;
      let dailyEncargoIncome = 0;
      let dailyEncargoGain = 0;
      let dailyUsadoIncome = 0;
      let dailyUsadoGain = 0;
      let dailyExpenses = 0;

      // 1. Match Tickets (using createdAt)
      tickets.forEach(t => {
        const tDate = parseDateToDateTime(t.createdAt);
        if (isSameDay(tDate, targetDate)) {
          dailyTicketIncome += t.advancePaid;
        }
      });

      // 2. Match Expenses (using date)
      expenses.forEach(e => {
        const eDate = parseDateToDateTime(e.date);
        if (isSameDay(eDate, targetDate)) {
          dailyExpenses += e.amount;
        }
      });

      // 3. Match Encargos (using date)
      encargos.forEach(o => {
        if (o.status === 'entregado') {
          const oDate = parseDateToDateTime(o.date);
          if (isSameDay(oDate, targetDate)) {
            dailyEncargoIncome += o.price;
            dailyEncargoGain += o.gain;
          }
        }
      });

      // 4. Match VentasUsados (using saleDate)
      ventasUsados.forEach(v => {
        const vDate = parseDateToDateTime(v.saleDate);
        if (isSameDay(vDate, targetDate)) {
          dailyUsadoIncome += v.sellPrice;
          dailyUsadoGain += v.gain;
        }
      });

      const totalDayIncome = dailyTicketIncome + dailyEncargoIncome + dailyUsadoIncome;
      const totalDayProfit = dailyTicketIncome + dailyEncargoGain + dailyUsadoGain - dailyExpenses;
      
      data.push({
        name: formattedLabel,
        Ingresos: totalDayIncome,
        Ganancia: totalDayProfit,
        Gastos: dailyExpenses
      });
    });

    return data;
  }, [tickets, expenses, encargos, ventasUsados, chartPeriod, customStartDate, customEndDate]);

  // Por cobrar (deudas)
  const porCobrar = totalRemainingTickets;

  // Late indicators (Alertas de mora)
  // Let's extract those who have remaining amounts and have been here "Ayer" or "Hace 2 días"
  const lateDebtors = tickets.filter(t => t.remainingPrice > 0);

  // Low stock calculation & handlers
  const lowStockParts = (spareParts || []).filter(p => p.stock < p.threshold);

  const handleUpdateStock = (partId: string, increment: boolean) => {
    onChangeSpareParts(prev => 
      prev.map(p => {
        if (p.id === partId) {
          const newStock = increment ? p.stock + 1 : Math.max(0, p.stock - 1);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const handleUpdateThreshold = (partId: string, value: number) => {
    onChangeSpareParts(prev => 
      prev.map(p => {
        if (p.id === partId) {
          return { ...p, threshold: Math.max(0, value) };
        }
        return p;
      })
    );
    setEditingThresholdId(null);
  };

  const handleDeletePart = (partId: string) => {
    onChangeSpareParts(prev => prev.filter(p => p.id !== partId));
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    const newPart: SparePart = {
      id: `sp_${Date.now()}`,
      name: newPartName,
      type: newPartType,
      stock: Number(newPartStock),
      threshold: Number(newPartThreshold),
      cost: Number(newPartCost)
    };

    onChangeSpareParts(prev => [...prev, newPart]);
    
    // Reset Form
    setNewPartName('');
    setNewPartStock(5);
    setNewPartThreshold(2);
    setNewPartCost(1000);
    setShowAddPartModal(false);
  };

  return (
    <div className="space-y-5 pb-12 px-1">
      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center flex flex-col gap-0.5 items-center mt-1"
        id="dashboard-header"
      >
        <h2 className="font-headline text-xl sm:text-2xl font-bold text-white tracking-wide">Resumen de Finanzas</h2>
        <p className="font-sans text-xs text-on-surface-variant font-medium">Taller de Reparaciones VICELL</p>
        
        {/* Monthly Report Quick Button */}
        <motion.button
          onClick={() => onNavigate('reportes')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] sm:text-xs font-bold cursor-pointer shadow-md transition-all duration-200 tracking-wide border border-indigo-500/20"
          id="btn-goto-reportes"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Ver Reporte Mensual</span>
        </motion.button>
      </motion.div>

      {/* Alertas de stock crítico */}
      {lowStockParts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden shadow-sm"
          id="stock-alert-banner"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1 relative z-10">
            <h4 className="text-xs font-bold text-amber-400 font-headline uppercase tracking-wider">
              ⚡ Alerta de Stock Crítico ({lowStockParts.length})
            </h4>
            <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Los siguientes repuestos están por debajo del umbral mínimo de unidades:
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 font-sans font-semibold font-mono">
                {lowStockParts.map(p => (
                  <span 
                    key={p.id} 
                    onClick={() => setActiveTab('repuestos')}
                    className="inline-flex items-center gap-1 text-[10px] text-amber-200 hover:underline cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                  >
                    {p.name}: {p.stock} u. <span className="opacity-60 text-[9px]">(mín. {p.threshold})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions - Hand-optimized 3-column tactile grid for one-hand thumb reach on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4" id="quick-actions-grid">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate('nuevo_ticket')}
          className="relative overflow-hidden glass-panel rounded-xl py-3 px-1 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.04] transition-all group border border-primary/20 cursor-pointer"
          id="btn-quick-reparacion"
        >
          <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all z-0"></div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
            <Wrench className="text-primary w-4 h-4" />
          </div>
          <span className="font-sans text-[9px] sm:text-[10px] font-bold text-white relative z-10 tracking-wide text-center truncate max-w-full leading-tight">
            + Reparación
          </span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={onAddQuickVenta}
          className="relative overflow-hidden glass-panel rounded-xl py-3 px-1 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.04] transition-all group border border-secondary/20 cursor-pointer"
          id="btn-quick-encargo"
        >
          <div className="absolute inset-0 bg-secondary/5 blur-xl group-hover:bg-secondary/10 transition-all z-0"></div>
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center relative z-10">
            <ShoppingBag className="text-secondary w-4 h-4" />
          </div>
          <span className="font-sans text-[9px] sm:text-[10px] font-bold text-white relative z-10 tracking-wide text-center truncate max-w-full leading-tight">
            + Por Encargo
          </span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={onAddQuickVentaUsado}
          className="relative overflow-hidden glass-panel rounded-xl py-3 px-1 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.04] transition-all group border border-emerald-500/20 cursor-pointer"
          id="btn-quick-usado"
        >
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all z-0"></div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center relative z-10">
            <Smartphone className="text-emerald-400 w-4 h-4" />
          </div>
          <span className="font-sans text-[9px] sm:text-[10px] font-bold text-white relative z-10 tracking-wide text-center truncate max-w-full leading-tight">
            + Teléfono Usado
          </span>
        </motion.button>
      </div>

      {/* Top Section: Hero Profit Card - Compact & Clean */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        onClick={() => setShowIndicatorDetail('ganancia')}
        className="cursor-pointer"
        id="profit-hero-section"
      >
        <div className="relative glass-panel rounded-2xl p-4 overflow-hidden glow-border-primary border-l-4 border-l-primary hover:bg-white/[0.04] transition-all duration-300 shadow-lg">
          {/* Atmospheric Bloom */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-[30px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Wallet className="text-primary w-3.5 h-3.5" />
                </div>
                <h3 className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ganancia Neta (Real)</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-indigo-500/20">
                Ver Desglose 📊
              </span>
            </div>
            
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-headline text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(199,191,255,0.25)]">
                RD$ {gananciaReal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md tracking-wider">
                Utilidad Neta
              </span>
            </div>

            {/* Micro-breakdown pill indicators */}
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-3 text-[10px] sm:text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                <span className="text-[#8f9bb3]">Ingresos:</span>
                <span className="font-bold text-white">RD$ {(totalPaidTickets + deliveredEncargosGain + totalVentasUsadosGain).toLocaleString('es-DO')}</span>
              </div>
              <div className="text-white/10">|</div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                <span className="text-[#8f9bb3]">Gastos:</span>
                <span className="font-bold text-white">RD$ {totalExpenseAmount.toLocaleString('es-DO')}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Income & Expenses Grid */}
      <section className="grid grid-cols-2 gap-4" id="stats-grid-section">
        {/* Income Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowIndicatorDetail('ingresos')}
          className="relative glass-panel rounded-2xl p-4 overflow-hidden border-t border-t-white/10 flex flex-col gap-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
          id="income-card"
        >
          <div className="flex justify-between items-start">
            <h3 className="font-sans text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider w-2/3 leading-normal">Ingresos Del Mes</h3>
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <TrendingUp className="text-secondary w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-headline text-lg font-bold text-white">
              RD$ {ingresosDelMes.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
            <p className="font-sans text-[10px] text-on-surface-variant mt-1">Hoy: RD$ {totalPaidTickets.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
          </div>
        </motion.div>

        {/* Expenses Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowIndicatorDetail('gastos')}
          className="relative glass-panel rounded-2xl p-4 overflow-hidden border-t border-t-white/10 flex flex-col gap-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
          id="expenses-card"
        >
          <div className="flex justify-between items-start">
            <h3 className="font-sans text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider w-2/3 leading-normal">Gastos Del Mes</h3>
            <div className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center border border-error/20">
              <TrendingDown className="text-error w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-headline text-lg font-bold text-white">
              RD$ {gastosDelMes.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex justify-between items-center mt-1">
              <p className="font-sans text-[10px] text-on-surface-variant">Gastos Fijos:</p>
              <p className="font-sans text-[10px] text-on-surface-variant font-medium">
                RD$ {expenses.filter(e => e.category === 'fijo').reduce((a, b) => a + b.amount, 0).toLocaleString('es-DO')}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CHARTS SECTIONS USING RECHARTS (DYNAMIC FINANCE PERFORMANCE) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/50 dark:border-white/10 relative overflow-hidden"
        id="weekly-performance-chart-card"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <div>
            <h3 className="font-headline text-sm font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Rendimiento Financiero</span>
            </h3>
            <p className="font-sans text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Operaciones reales filtradas por período</p>
          </div>
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end text-[9px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Ingresos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ganancia Neta
            </span>
          </div>
        </div>

        {/* Filtros de Fecha para el Gráfico */}
        <div className="flex flex-col gap-3 mb-4 mt-2 border-t border-b border-slate-200/10 dark:border-white/5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Período:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
              {[
                { id: '7days', label: '7 Días' },
                { id: '15days', label: '15 Días' },
                { id: '30days', label: '30 Días' },
                { id: 'thisMonth', label: 'Este Mes' },
                { id: 'lastMonth', label: 'Mes Pasado' },
                { id: 'custom', label: 'Personalizado' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setChartPeriod(p.id)}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                    chartPeriod === p.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/80 dark:bg-white/5 dark:text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Rango Personalizado de Fechas */}
          {chartPeriod === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Fecha Inicio</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-750 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Fecha Fin</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-750 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Chart wrapper */}
        <div className="h-56 sm:h-60 mt-1 w-full relative z-10" id="recharts-dynamic-area">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 600 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 600 }}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const ing = payload[0]?.value || 0;
                    const gan = payload[1]?.value || 0;
                    const gast = payload[0]?.payload?.Gastos || 0;
                    return (
                      <div className="bg-[#0f172a]/95 border border-slate-800 p-2.5 rounded-xl shadow-xl backdrop-blur-md text-[10px] space-y-1 font-sans">
                        <p className="font-bold text-slate-400 uppercase tracking-wide text-[8px] mb-1.5 border-b border-white/5 pb-1">
                          {payload[0]?.payload?.name}
                        </p>
                        <div className="flex justify-between gap-6">
                          <span className="text-slate-400 font-medium">Ingresos:</span>
                          <span className="font-mono text-indigo-400 font-bold">RD$ {Number(ing).toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-slate-400 font-medium">Gastos:</span>
                          <span className="font-mono text-rose-400 font-bold">RD$ {Number(gast).toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between gap-6 pt-1 border-t border-white/5">
                          <span className="text-emerald-400 font-bold">Ganancia:</span>
                          <span className="font-mono text-emerald-400 font-extrabold">RD$ {Number(gan).toLocaleString('es-DO')}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="Ingresos" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorIngresos)" 
              />
              <Area 
                type="monotone" 
                dataKey="Ganancia" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorGanancias)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* TABS SEPARATOR FOR ADICIONAL MODULES */}
      <div className="space-y-3" id="sales-modules-container">
        <div className="flex bg-slate-900/10 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/50 dark:border-white/5" id="dashboard-tab-selector">
          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pedidos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <ShoppingBasket className="w-3.5 h-3.5" />
            <span>Pedidos ({encargos.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('usados')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'usados'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Usados ({ventasUsados.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('repuestos')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
              activeTab === 'repuestos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Repuestos ({spareParts.length})</span>
            {lowStockParts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border border-slate-950 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'pedidos' ? (
            <motion.div
              key="pedidos-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={() => onNavigate('encargos')}
              className="cursor-pointer"
            >
              <div className="relative glass-panel rounded-2xl p-4 overflow-hidden border-t border-t-white/10 glow-border-secondary hover:bg-white/[0.04] transition-all">
                {/* Atmospheric Bloom */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-secondary/5 rounded-full blur-[30px] pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <ShoppingBasket className="text-secondary w-5 h-5" />
                  <h3 className="font-headline text-sm font-bold text-white">Ventas por Encargo</h3>
                  <div className="ml-auto px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
                    <span className="font-sans text-[9px] font-semibold text-secondary">Mes Actual</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 relative z-10 bg-surface-container-lowest/50 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-col gap-0.5 text-center border-r border-white/10">
                    <span className="font-sans text-[9px] font-semibold text-on-surface-variant uppercase tracking-wider">Ventas</span>
                    <span className="font-sans text-sm font-bold text-white">{encargos.length}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-center border-r border-white/10">
                    <span className="font-sans text-[9px] font-semibold text-on-surface-variant uppercase tracking-wider">Costo</span>
                    <span className="font-sans text-xs font-bold text-white">
                      RD$ {deliveredEncargosCost.toLocaleString('es-DO')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-center">
                    <span className="font-sans text-[9px] font-bold text-secondary uppercase tracking-wider">Ganancia</span>
                    <span className="font-sans text-xs font-bold text-secondary">
                      RD$ {deliveredEncargosGain.toLocaleString('es-DO')}
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-center text-slate-400 mt-2.5 hover:text-indigo-400 font-bold transition-all flex items-center justify-center gap-1">
                  <span>Gestionar lista de encargos</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'usados' ? (
            <motion.div
              key="usados-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={() => onNavigate('ventas_usados')}
              className="cursor-pointer"
            >
              <div className="relative glass-panel rounded-2xl p-4 overflow-hidden border-t border-t-white/10 glow-border-emerald hover:bg-white/[0.04] transition-all">
                {/* Atmospheric Bloom */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[30px] pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <Smartphone className="text-emerald-400 w-5 h-5" />
                  <h3 className="font-headline text-sm font-bold text-white">Ventas de Equipos Usados</h3>
                  <div className="ml-auto px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-sans text-[9px] font-semibold text-emerald-400">Mes Actual</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 relative z-10 bg-surface-container-lowest/50 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-col gap-0.5 text-center border-r border-white/10">
                    <span className="font-sans text-[9px] font-semibold text-on-surface-variant uppercase tracking-wider">Equipos</span>
                    <span className="font-sans text-sm font-bold text-white">{ventasUsados.length}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-center border-r border-white/10">
                    <span className="font-sans text-[9px] font-semibold text-on-surface-variant uppercase tracking-wider">Inversión</span>
                    <span className="font-sans text-xs font-bold text-white">
                      RD$ {totalVentasUsadosCost.toLocaleString('es-DO')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-center">
                    <span className="font-sans text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Ganancia</span>
                    <span className="font-sans text-xs font-bold text-emerald-400">
                      RD$ {totalVentasUsadosGain.toLocaleString('es-DO')}
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-center text-slate-400 mt-2.5 hover:text-indigo-400 font-bold transition-all flex items-center justify-center gap-1">
                  <span>Gestionar ventas de usados</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="repuestos-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="relative glass-panel rounded-2xl p-4 overflow-hidden border-t border-t-white/10 glow-border-indigo hover:bg-white/[0.01] transition-all">
                {/* Atmospheric Bloom */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[30px] pointer-events-none"></div>
                
                <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Package className="text-indigo-400 w-5 h-5" />
                    <h3 className="font-headline text-sm font-bold text-white">Inventario de Repuestos</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddPartModal(true)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 transition-colors border border-indigo-500/20"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nuevo Repuesto</span>
                  </button>
                </div>

                {/* Search */}
                <div className="mb-3 relative z-10">
                  <input 
                    type="text"
                    placeholder="🔍 Buscar repuestos..."
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-xs text-white"
                  />
                </div>

                <div className="space-y-2 relative z-10 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10" id="spareparts-list-container">
                  {spareParts.filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase())).length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-sans italic">
                      No se encontraron repuestos.
                    </div>
                  ) : (
                    spareParts
                      .filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase()))
                      .map(p => {
                        const isLow = p.stock < p.threshold;
                        return (
                          <div 
                            key={p.id}
                            className={`flex justify-between items-center gap-2 p-2.5 rounded-xl border transition-all ${
                              isLow 
                                ? 'bg-rose-500/5 border-rose-500/20' 
                                : 'bg-white/[0.02] border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isLow ? 'bg-rose-500/10' : 'bg-slate-800'
                              }`}>
                                {p.type === 'pantalla' ? (
                                  <Smartphone className={`w-3.5 h-3.5 ${isLow ? 'text-rose-400' : 'text-slate-300'}`} />
                                ) : p.type === 'bateria' ? (
                                  <Battery className={`w-3.5 h-3.5 ${isLow ? 'text-rose-400' : 'text-slate-300'}`} />
                                ) : (
                                  <Package className={`w-3.5 h-3.5 ${isLow ? 'text-rose-400' : 'text-slate-300'}`} />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate leading-none mb-1">{p.name}</p>
                                <p className="text-[9px] font-mono font-medium text-slate-400 leading-none">
                                  {p.type === 'pantalla' ? 'Pantalla' : p.type === 'bateria' ? 'Batería' : p.type === 'pin_carga' ? 'Carga' : 'Otro'} • RD$ {p.cost.toLocaleString('es-DO')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Adjust threshold */}
                              <div className="flex items-center gap-1">
                                {editingThresholdId === p.id ? (
                                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-indigo-500/30">
                                    <input 
                                      type="number"
                                      min="0"
                                      className="w-10 bg-transparent text-center font-bold text-xs text-white focus:outline-none"
                                      value={editingThresholdValue}
                                      onChange={(e) => setEditingThresholdValue(Number(e.target.value))}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateThreshold(p.id, editingThresholdValue)}
                                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-1.5 py-0.5 text-[9px] font-bold cursor-pointer"
                                    >
                                      Ok
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => {
                                      setEditingThresholdId(p.id);
                                      setEditingThresholdValue(p.threshold);
                                    }}
                                    className="text-[9px] text-slate-400 hover:text-white transition-colors cursor-pointer bg-white/5 px-1.5 py-1 rounded-lg border border-white/5 font-mono"
                                    title="Click para ajustar umbral"
                                  >
                                    Mín: <span className={`font-bold ${isLow ? 'text-rose-400 animate-pulse' : 'text-white'}`}>{p.threshold}</span>
                                  </div>
                                )}
                              </div>

                              {/* Stock Controls */}
                              <div className="flex items-center gap-1.5 bg-slate-900/60 p-0.5 rounded-lg border border-white/5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStock(p.id, false)}
                                  className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer active:scale-95"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className={`font-mono text-xs font-bold min-w-4 text-center ${isLow ? 'text-rose-400' : 'text-white'}`}>
                                  {p.stock}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStock(p.id, true)}
                                  className="p-1 rounded hover:bg-white/5 text-indigo-400 hover:text-indigo-300 cursor-pointer active:scale-95"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeletePart(p.id)}
                                className="p-1 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Balance */}
      <section className="flex flex-col gap-4" id="accounts-status-section">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-md font-semibold text-white">Estado de Cuentas</h3>
          <span className="font-sans text-xs text-on-surface-variant/60 font-medium">Revisión en tiempo real</span>
        </div>

        {/* Por Cobrar Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative glass-panel rounded-2xl p-4 overflow-hidden border-l-4 border-l-[#f59e0b]"
          id="por-cobrar-card"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <h3 className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Por Cobrar (Deudas)</h3>
              <span className="font-headline text-lg font-bold text-white mt-1">
                RD$ {porCobrar.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center border border-[#f59e0b]/20">
              <AlertTriangle className="text-[#f59e0b] w-4 h-4" />
            </div>
          </div>

          {/* Progress bar mimicking reference */}
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-[#f59e0b] h-1.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(10, (porCobrar / (ingresosDelMes || 1)) * 100))}%` }}
            ></div>
          </div>
        </motion.div>
      </section>

      {/* Dynamic Detail Overlay Modals for Premium experience */}
      <AnimatePresence>
        {showIndicatorDetail && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowIndicatorDetail(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-on-surface-variant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {showIndicatorDetail === 'ganancia' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="text-indigo-400 w-4 h-4" />
                      <h3 className="font-headline text-sm font-black text-white">Desglose de Caja</h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 py-0.5 px-2 rounded-full border border-indigo-400/20">
                      Ganancia Neta Real
                    </span>
                  </div>

                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    A continuación se presenta un desglose de ingresos brutos versus gastos operativos del taller:
                  </p>

                  <div className="space-y-3">
                    {/* ENTRADAS / INGRESOS BOX */}
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 space-y-2">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> (+) Ingresos Registrados
                      </span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Cobro Reparaciones:</span>
                          <span className="font-bold text-white">RD$ {totalPaidTickets.toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Márgenes Pedidos:</span>
                          <span className="font-bold text-white">RD$ {deliveredEncargosGain.toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Venta Equipos Usados:</span>
                          <span className="font-bold text-white">RD$ {totalVentasUsadosGain.toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-emerald-500/10 font-bold text-emerald-400 text-[11px]">
                          <span>Ganancia Bruta:</span>
                          <span>RD$ {(totalPaidTickets + deliveredEncargosGain + totalVentasUsadosGain).toLocaleString('es-DO')}</span>
                        </div>
                      </div>
                    </div>

                    {/* SALIDAS / GASTOS BOX */}
                    <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3 space-y-2">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> (-) Egresos &amp; Compras
                      </span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Gastos Fijos:</span>
                          <span className="font-bold text-white">RD$ {expenses.filter(e => e.category === 'fijo').reduce((acc, e) => acc + e.amount, 0).toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Compra de Piezas:</span>
                          <span className="font-bold text-white">RD$ {expenses.filter(e => e.category === 'piezas').reduce((acc, e) => acc + e.amount, 0).toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Inv. Accesorios:</span>
                          <span className="font-bold text-white">RD$ {expenses.filter(e => e.category === 'inventario').reduce((acc, e) => acc + e.amount, 0).toLocaleString('es-DO')}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-rose-500/10 font-bold text-rose-400 text-[11px]">
                          <span>Egresos Totales:</span>
                          <span>RD$ {totalExpenseAmount.toLocaleString('es-DO')}</span>
                        </div>
                      </div>
                    </div>

                    {/* NET TOTAL BOX */}
                    <div className="bg-slate-950/45 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ganancia Neta Real</span>
                      <span className="font-headline text-xl font-black text-indigo-400 mt-1 drop-shadow-[0_0_8px_rgba(129,140,248,0.2)]">
                        RD$ {gananciaReal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowIndicatorDetail(null)}
                    className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-[11px] sm:text-xs rounded-xl cursor-pointer transition-colors shadow-md border border-indigo-400/20"
                  >
                    Entendido, Cerrar Detalle
                  </button>
                </div>
              )}

              {showIndicatorDetail === 'ingresos' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-secondary w-5 h-5" />
                    <h3 className="font-headline text-lg font-bold text-white">Desglose de Ingresos</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Ingresos recolectados en el mes actual que incluyen avances y saldos de entrega:
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tickets.map(t => (
                      <div key={t.id} className="flex justify-between text-xs p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{t.deviceModel}</span>
                          <span className="text-on-surface-variant text-[10px]">{t.clientName}</span>
                        </div>
                        <span className="text-[#a7f3d0] font-medium">+RD$ {t.advancePaid.toLocaleString('es-DO')}</span>
                      </div>
                    ))}
                    {encargos.filter(o => o.status === 'entregado').map(o => (
                      <div key={o.id} className="flex justify-between text-xs p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{o.itemName} (Bajo Pedido)</span>
                          <span className="text-on-surface-variant text-[10px]">{o.clientName}</span>
                        </div>
                        <span className="text-secondary font-medium">+RD$ {o.price.toLocaleString('es-DO')}</span>
                      </div>
                    ))}
                    {ventasUsados.map(v => (
                      <div key={v.id} className="flex justify-between text-xs p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{v.phoneModel} (Equipo Usado)</span>
                          <span className="text-on-surface-variant text-[10px]">{v.clientName}</span>
                        </div>
                        <span className="text-emerald-400 font-medium">+RD$ {v.sellPrice.toLocaleString('es-DO')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showIndicatorDetail === 'gastos' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="text-error w-5 h-5" />
                    <h3 className="font-headline text-lg font-bold text-white">Desglose de Gastos</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Todos los costos de adquisición de repuestos y fijos operacionales:
                  </p>
                  <div className="space-y-2">
                    {expenses.map(e => (
                      <div key={e.id} className="flex justify-between text-xs p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{e.title}</span>
                          <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">{e.category}</span>
                        </div>
                        <span className="text-error font-medium">-RD$ {e.amount.toLocaleString('es-DO')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Modal de Agregar Repuesto */}
        {showAddPartModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 55 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 55 }}
              className="bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md relative"
            >
              <button 
                type="button"
                onClick={() => setShowAddPartModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-on-surface-variant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleAddPart} className="space-y-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 font-headline">
                  <Package className="text-indigo-400 w-4 h-4" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Agregar Nuevo Repuesto</h3>
                </div>

                <div className="space-y-3 font-sans">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-1">Nombre del repuesto</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. Pantalla iPhone 11"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Type Input */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-1">Tipo de repuesto</label>
                    <select
                      value={newPartType}
                      onChange={(e) => setNewPartType(e.target.value as SparePartType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="pantalla">Pantalla</option>
                      <option value="bateria">Batería</option>
                      <option value="pin_carga">Pin de Carga</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  {/* Cost Input */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-1">Costo de compra (RD$)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      placeholder="Ej. 1500"
                      value={newPartCost}
                      onChange={(e) => setNewPartCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Stock Input */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-1">Stock inicial</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        placeholder="Ej. 5"
                        value={newPartStock}
                        onChange={(e) => setNewPartStock(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Threshold Input */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-1">Umbral de alerta</label>
                      <input 
                        type="number"
                        required
                        min="1"
                        placeholder="Ej. 2"
                        value={newPartThreshold}
                        onChange={(e) => setNewPartThreshold(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddPartModal(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors border border-indigo-500/20 shadow-md"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
