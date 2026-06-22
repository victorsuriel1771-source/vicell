import React, { useState } from 'react';
import { Ticket, Expense, Encargo, VentaUsado } from '../types';
import { motion } from 'motion/react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  PieChart, 
  DollarSign, 
  ChevronRight,
  Info,
  Layers,
  Wrench,
  ShoppingBag,
  Smartphone,
  Share2
} from 'lucide-react';

interface ReporteMensualViewProps {
  tickets: Ticket[];
  expenses: Expense[];
  encargos: Encargo[];
  ventasUsados: VentaUsado[];
  onBack: () => void;
  businessName: string;
}

export default function ReporteMensualView({
  tickets,
  expenses,
  encargos,
  ventasUsados,
  onBack,
  businessName
}: ReporteMensualViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06'); // Default June 2026

  // Computations
  // 1. Incomes
  const repairIncome = tickets.reduce((acc, t) => acc + t.advancePaid, 0);
  const encargosIncome = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.price, 0);
  const encargosCost = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.cost, 0);
  const encargosGain = encargos.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.gain, 0);

  const usadosIncome = ventasUsados.reduce((acc, v) => acc + v.sellPrice, 0);
  const usadosCost = ventasUsados.reduce((acc, v) => acc + v.purchaseCost, 0);
  const usadosGain = ventasUsados.reduce((acc, v) => acc + v.gain, 0);

  const totalIncome = repairIncome + encargosIncome + usadosIncome;

  // 2. Expenses
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const fixedExpenses = expenses.filter(e => e.category === 'fijo').reduce((acc, e) => acc + e.amount, 0);
  const partsExpenses = expenses.filter(e => e.category === 'piezas').reduce((acc, e) => acc + e.amount, 0);
  const inventoryExpenses = expenses.filter(e => e.category === 'inventario').reduce((acc, e) => acc + e.amount, 0);

  // 3. Profit / Net Gain
  // Profit formula: Total revenue (repair income + delivered commission profit + phone sales profit) minus operating expenses
  // Dashboard uses: baseGain + totalPaidTickets + deliveredEncargosGain + totalVentasUsadosGain - totalExpenseAmount
  const netProfit = repairIncome + encargosGain + usadosGain - totalExpenses;

  // Percentage calculations
  const fixedPercent = totalExpenses > 0 ? (fixedExpenses / totalExpenses) * 100 : 0;
  const partsPercent = totalExpenses > 0 ? (partsExpenses / totalExpenses) * 100 : 0;
  const invPercent = totalExpenses > 0 ? (inventoryExpenses / totalExpenses) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const monthName = getMonthName(selectedMonth);
    const message = `📊 *REPORTE MENSUAL DE OPERACIONES - ${businessName.toUpperCase()}* 📊\n\n` +
      `📅 *Período:* ${monthName}\n` +
      `------------------------------------------\n\n` +
      `💵 *INGRESOS TOTALES:* RD$ ${totalIncome.toLocaleString('es-DO', { minimumFractionDigits: 2 })}\n` +
      `▫️ _Reparaciones Celulares:_ RD$ ${repairIncome.toLocaleString('es-DO')}\n` +
      `▫️ _Ventas por Encargo:_ RD$ ${encargosIncome.toLocaleString('es-DO')} (Margen: RD$ ${encargosGain.toLocaleString('es-DO')})\n` +
      `▫️ _Equipos Usados:_ RD$ ${usadosIncome.toLocaleString('es-DO')} (Margen: RD$ ${usadosGain.toLocaleString('es-DO')})\n\n` +
      `💸 *GASTOS MENSUALES:* RD$ ${totalExpenses.toLocaleString('es-DO', { minimumFractionDigits: 2 })}\n` +
      `▫️ _Gastos Fijos:_ RD$ ${fixedExpenses.toLocaleString('es-DO')} (${fixedPercent.toFixed(0)}%)\n` +
      `▫️ _Adquisición Piezas:_ RD$ ${partsExpenses.toLocaleString('es-DO')} (${partsPercent.toFixed(0)}%)\n` +
      `▫️ _Inventario Accesorios:_ RD$ ${inventoryExpenses.toLocaleString('es-DO')} (${invPercent.toFixed(0)}%)\n\n` +
      `📈 *UTILIDAD / GANANCIA NETA:* RD$ ${netProfit.toLocaleString('es-DO', { minimumFractionDigits: 2 })}\n` +
      `------------------------------------------\n` +
      `🙌🏻 ¡Gracias por confiar en ${businessName.toUpperCase()}!`;
    
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-24 font-sans no-print">
      {/* Header Bar */}
      <div className="flex items-center justify-between h-12 mt-4" id="reporte-mensual-header">
        <button 
          onClick={onBack}
          className="flex items-center justify-center p-2.5 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant hover:text-primary cursor-pointer border border-transparent hover:border-white/5"
          id="btn-back-reporte"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex flex-col">
          <h1 className="font-headline text-lg font-bold text-white tracking-wider flex items-center gap-1.5 justify-center">
            <FileText className="w-4.5 h-4.5 text-blue-400" /> Reporte Mensual
          </h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-widest">{getMonthName(selectedMonth)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant hover:text-indigo-400 cursor-pointer border border-transparent hover:border-white/5"
            title="Imprimir Reporte"
            id="btn-print-report"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant hover:text-emerald-400 cursor-pointer border border-transparent hover:border-white/5"
            title="Compartir Reporte por WhatsApp"
            id="btn-share-report"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Month Selector Tool */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-400 w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Período Fiscal</span>
        </div>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-9 px-3 rounded-lg glass-input text-xs font-bold text-white cursor-pointer bg-slate-800 border border-white/10 w-full sm:w-auto"
        >
          <option value="2026-06">Junio de 2026</option>
          <option value="2026-05">Mayo de 2026</option>
          <option value="2026-04">Abril de 2026</option>
        </select>
      </div>

      {/* Instant Action buttons row */}
      <div className="grid grid-cols-2 gap-3" id="report-share-print-actions">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg border border-indigo-400/20"
          id="btn-action-print"
        >
          <Printer className="w-4 h-4 shrink-0 text-indigo-200" />
          <span>Imprimir Reporte</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleShareWhatsApp}
          className="bg-[#25D366] hover:bg-[#20ba56] active:bg-[#1b9e4a] text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg border border-white/5"
          id="btn-action-share-wa"
        >
          <Share2 className="w-4 h-4 shrink-0 text-emerald-100" />
          <span>Compartir WhatsApp</span>
        </motion.button>
      </div>

      {/* Report Big Numbers Row */}
      <div className="grid grid-cols-2 gap-4" id="report-financial-overview">
        {/* Total Ingreso */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-slate-900/60">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-[9px] font-bold uppercase tracking-wider">Total Ingresos</span>
            <TrendingUp className="text-emerald-400 w-4 h-4 shrink-0" />
          </div>
          <span className="text-lg font-headline font-bold text-white drop-shadow-md">
            RD$ {totalIncome.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[9px] text-emerald-400/80 mt-1 font-medium">Reparaciones, pedidos y equipos</p>
        </div>

        {/* Total Gasto */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-slate-900/60">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-[9px] font-bold uppercase tracking-wider">Total Gastos</span>
            <TrendingDown className="text-rose-400 w-4 h-4 shrink-0" />
          </div>
          <span className="text-lg font-headline font-bold text-white drop-shadow-md">
            RD$ {totalExpenses.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[9px] text-rose-400/80 mt-1 font-medium">
            Fijos: RD$ {fixedExpenses.toLocaleString('es-DO')}
          </p>
        </div>

        {/* Ganancia Neta */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-slate-900/60 col-span-2 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-baseline">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Ganancia Neta Calculada</span>
              <span className="text-2xl font-headline font-extrabold text-white tracking-tight drop-shadow-md">
                RD$ {netProfit.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Wallet className="text-blue-400 w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-400 mt-2 flex items-center gap-1.5 bg-slate-950/20 p-2 rounded-lg">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Fórmula: Ganancias brutas de cada módulo menos egresos operacionales totales del período.</span>
          </div>
        </div>
      </div>

      {/* Visual Report Comparison Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-white/10 space-y-4">
        <h3 className="font-headline text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-indigo-400" /> Distribución de Gastos
        </h3>

        {totalExpenses === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-on-surface-variant">No hay gastos ingresados en este mes para generar distribución gráfica.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Horizontal Stacked Bar representing percentages */}
            <div className="w-full h-4 bg-slate-950/40 rounded-full flex overflow-hidden">
              {fixedExpenses > 0 && (
                <div 
                  className="bg-rose-500 h-full transition-all" 
                  style={{ width: `${fixedPercent}%` }}
                  title={`Fijos: ${fixedPercent.toFixed(1)}%`}
                ></div>
              )}
              {partsExpenses > 0 && (
                <div 
                  className="bg-amber-500 h-full transition-all" 
                  style={{ width: `${partsPercent}%` }}
                  title={`Piezas: ${partsPercent.toFixed(1)}%`}
                ></div>
              )}
              {inventoryExpenses > 0 && (
                <div 
                  className="bg-blue-600 h-full transition-all" 
                  style={{ width: `${invPercent}%` }}
                  title={`Inventario: ${invPercent.toFixed(1)}%`}
                ></div>
              )}
            </div>

            {/* Categorized Legends & Values */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col gap-0.5 bg-slate-500/5 p-2 rounded-xl border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Fijos</span>
                </div>
                <span className="text-xs font-bold text-white">RD$ {fixedExpenses.toLocaleString('es-DO')}</span>
                <span className="text-[9px] text-slate-500">{fixedPercent.toFixed(0)}% del total</span>
              </div>

              <div className="flex flex-col gap-0.5 bg-slate-500/5 p-2 rounded-xl border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Piezas</span>
                </div>
                <span className="text-xs font-bold text-white">RD$ {partsExpenses.toLocaleString('es-DO')}</span>
                <span className="text-[9px] text-slate-500">{partsPercent.toFixed(0)}% del total</span>
              </div>

              <div className="flex flex-col gap-0.5 bg-slate-500/5 p-2 rounded-xl border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Inventario</span>
                </div>
                <span className="text-xs font-bold text-white">RD$ {inventoryExpenses.toLocaleString('es-DO')}</span>
                <span className="text-[9px] text-slate-500">{invPercent.toFixed(0)}% del total</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Operations Log Sections */}
      <div className="space-y-4">
        <h3 className="font-headline text-md font-bold text-white px-1">Resumen de Operaciones</h3>

        {/* Ingresos Detailed Breakdown */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <TrendingUp className="text-emerald-400 w-4.5 h-4.5" />
            <h4 className="font-headline text-xs font-extrabold text-white uppercase tracking-wider">Desglose de Ingresos Reales</h4>
          </div>

          <div className="space-y-2.5 divide-y divide-white/5">
            {/* Reparaciones */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white">Reparaciones de Celulares</span>
                  <span className="text-[9px] text-slate-400">Avances y saldos cobrados</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">+RD$ {repairIncome.toLocaleString('es-DO')}</span>
            </div>

            {/* Pedidos */}
            <div className="flex justify-between items-center pt-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white">Ventas por Encargo</span>
                  <span className="text-[9px] text-slate-400">Costo: RD$ {encargosCost.toLocaleString('es-DO')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-emerald-400">+RD$ {encargosIncome.toLocaleString('es-DO')}</span>
                <span className="text-[8px] text-indigo-400 font-bold">Margen: +RD$ {encargosGain.toLocaleString('es-DO')}</span>
              </div>
            </div>

            {/* Ventas Usados */}
            <div className="flex justify-between items-center pt-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white">Equipos Usados</span>
                  <span className="text-[9px] text-slate-400">Costo: RD$ {usadosCost.toLocaleString('es-DO')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-emerald-400">+RD$ {usadosIncome.toLocaleString('es-DO')}</span>
                <span className="text-[8px] text-indigo-400 font-bold">Margen: +RD$ {usadosGain.toLocaleString('es-DO')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Egresos/Gastos Detailed Breakdown */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <TrendingDown className="text-rose-400 w-4.5 h-4.5" />
            <h4 className="font-headline text-xs font-extrabold text-white uppercase tracking-wider">Desglose de Gastos Operacionales</h4>
          </div>

          <div className="space-y-2.5 divide-y divide-white/5">
            {/* Gasto Fijo */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white">Gastos Fijos</span>
                  <span className="text-[9px] text-slate-400">Renta, luz, internet, etc.</span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400">-RD$ {fixedExpenses.toLocaleString('es-DO')}</span>
            </div>

            {/* Piezas */}
            <div className="flex justify-between items-center pt-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white">Adquisición de Piezas</span>
                  <span className="text-[9px] text-slate-400">Pantallas, Flex, pines, baterías</span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400">-RD$ {partsExpenses.toLocaleString('es-DO')}</span>
            </div>

            {/* Inventario */}
            <div className="flex justify-between items-center pt-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white">Compra de Inventario</span>
                  <span className="text-[9px] text-slate-400">Accesorios, cargadores, fundas</span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400">-RD$ {inventoryExpenses.toLocaleString('es-DO')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet View - Only visible when printing! */}
      <div className="hidden print:block print:p-8 bg-white text-black font-sans leading-normal" style={{ color: 'black', background: 'white' }}>
        <div className="flex justify-between items-start border-b-2 border-slate-300 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase" style={{ color: '#1e3a8a' }}>
              Reporte Mensual de Operaciones
            </h1>
            <p className="text-sm font-bold mt-1 text-slate-600">Empresa: {businessName}</p>
            <p className="text-xs text-slate-500 mt-0.5">Período: {getMonthName(selectedMonth)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-indigo-100 text-indigo-800 font-extrabold py-1 px-3 rounded-full uppercase tracking-wider">
              Oficial
            </span>
            <p className="text-[10px] text-slate-400 mt-2">Emitido el: {new Date().toLocaleDateString('es-DO', { dateStyle: 'long' })}</p>
          </div>
        </div>

        {/* Big numbers Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8 text-center">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ingresos Totales</span>
            <span className="text-xl font-bold text-slate-900">
              RD$ {totalIncome.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gastos Totales</span>
            <span className="text-xl font-bold text-slate-900">
              RD$ {totalExpenses.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Ganancia Neta</span>
            <span className="text-2xl font-extrabold text-blue-900">
              RD$ {netProfit.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Breakdown tables */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide border-b border-slate-300 pb-1.5 mb-3" style={{ color: '#1e3a8a' }}>
              Detalle de Ingresos (Operaciones Comerciales)
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-left">
                  <th className="p-2 border">Módulo / Fuente de Ingresos</th>
                  <th className="p-2 border text-right">Inversión / Costo</th>
                  <th className="p-2 border text-right">Ingreso Bruto</th>
                  <th className="p-2 border text-right">Margen Real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium">Reparaciones (Saldos &amp; Avances)</td>
                  <td className="p-2 border text-right text-slate-500">N/A</td>
                  <td className="p-2 border text-right">RD$ {repairIncome.toLocaleString('es-DO')}</td>
                  <td className="p-2 border text-right text-emerald-750 font-bold">RD$ {repairIncome.toLocaleString('es-DO')}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Ventas por Encargo (Entregados)</td>
                  <td className="p-2 border text-right text-slate-500">RD$ {encargosCost.toLocaleString('es-DO')}</td>
                  <td className="p-2 border text-right">RD$ {encargosIncome.toLocaleString('es-DO')}</td>
                  <td className="p-2 border text-right text-emerald-750 font-bold">RD$ {encargosGain.toLocaleString('es-DO')}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Venta de Dispositivos Usados</td>
                  <td className="p-2 border text-right text-slate-500">RD$ {usadosCost.toLocaleString('es-DO')}</td>
                  <td className="p-2 border text-right">RD$ {usadosIncome.toLocaleString('es-DO')}</td>
                  <td className="p-2 border text-right text-emerald-750 font-bold">RD$ {usadosGain.toLocaleString('es-DO')}</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="p-2 border">Total Consolidado</td>
                  <td className="p-2 border text-right text-slate-600">RD$ {(encargosCost + usadosCost).toLocaleString('es-DO')}</td>
                  <td className="p-2 border text-right">RD$ {totalIncome.toLocaleString('es-DO')}</td>
                  <td className="p-2 border text-right" style={{ color: '#1e3a8a' }}>
                    RD$ {(repairIncome + encargosGain + usadosGain).toLocaleString('es-DO')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide border-b border-slate-300 pb-1.5 mb-3" style={{ color: '#1e3a8a' }}>
              Detalle de Egresos (Gastos Operativos)
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-left">
                  <th className="p-2 border">Categoría del Gasto</th>
                  <th className="p-2 border">Efecto / Clasificación</th>
                  <th className="p-2 border text-right">Cantidad de Movimientos</th>
                  <th className="p-2 border text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium">Gasto Fijo (Alquiler, Luz, Internet)</td>
                  <td className="p-2 border text-rose-800 font-semibold uppercase text-[10px]">Costo Operativo Fijo</td>
                  <td className="p-2 border text-right">{expenses.filter(e => e.category === 'fijo').length}</td>
                  <td className="p-2 border text-right text-rose-800 font-bold">RD$ {fixedExpenses.toLocaleString('es-DO')}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Piezas y Repuestos (Pantallas, Pines)</td>
                  <td className="p-2 border text-slate-600 uppercase text-[10px]">Costo Directo Variable</td>
                  <td className="p-2 border text-right">{expenses.filter(e => e.category === 'piezas').length}</td>
                  <td className="p-2 border text-right text-rose-800 font-bold">RD$ {partsExpenses.toLocaleString('es-DO')}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Inventario de Accesorios (Fundas, etc)</td>
                  <td className="p-2 border text-slate-600 uppercase text-[10px]">Inversión en Stock</td>
                  <td className="p-2 border text-right">{expenses.filter(e => e.category === 'inventario').length}</td>
                  <td className="p-2 border text-right text-rose-800 font-bold">RD$ {inventoryExpenses.toLocaleString('es-DO')}</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="p-2 border" colSpan={3}>Total Consolidado Egresos</td>
                  <td className="p-2 border text-right text-red-900">RD$ {totalExpenses.toLocaleString('es-DO')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-dashed border-slate-300 flex justify-between text-xs text-slate-500">
          <div>
            <p>Firma de Recepción / Administración</p>
            <div className="w-56 h-0.5 bg-slate-300 mt-12 mb-1"></div>
            <p className="font-bold">{businessName} Financiero</p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="font-mono text-[9px]">ID Certificado: VIC-REP-{Math.floor(Math.random() * 900000 + 100000)}</p>
            <p className="mt-1 font-semibold text-slate-600">Documento Informativo Generado para Contabilidad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
