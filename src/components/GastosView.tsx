import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Bolt, 
  Cpu, 
  Package, 
  Plus, 
  X, 
  Calendar, 
  Check, 
  AlertTriangle, 
  PlusCircle, 
  ArrowLeft,
  Filter,
  Trash2,
  RotateCcw,
  AlertOctagon,
  Sun,
  Moon
} from 'lucide-react';

interface GastosViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
  onPayExpense?: (expenseId: string) => void;
  onNavigate: (view: 'dashboard' | 'tickets' | 'encargos' | 'gastos' | 'nuevo_ticket' | 'ventas_usados') => void;
  onClearAllData?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function GastosView({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onPayExpense,
  onNavigate,
  onClearAllData,
  darkMode = false,
  onToggleDarkMode
}: GastosViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  // Form Inputs
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newStatus, setNewStatus] = useState<'completado' | 'pendiente'>('completado');

  // Compute stats
  const totalGastos = expenses.reduce((acc, e) => acc + e.amount, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'piezas':
        return <Cpu className="text-primary w-5 h-5" />;
      case 'fijo':
        return <Bolt className="text-[#f59e0b] w-5 h-5" />;
      default:
        return <Package className="text-secondary w-5 h-5" />;
    }
  };

  const handleOpenAddForm = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setShowAddForm(true);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount || !selectedCategory) return;

    onAddExpense({
      title: newTitle,
      amount: parseFloat(newAmount),
      category: selectedCategory,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
      status: newStatus
    });

    // Reset Form
    setNewTitle('');
    setNewAmount('');
    setNewStatus('completado');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Context title */}
      <div className="text-center space-y-2 mb-4">
        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Control de Gastos</h2>
        <p className="font-sans text-xs text-on-surface-variant">Taller de Reparaciones VICELL</p>
      </div>

      {/* Hero Expenses Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl p-5 border-l-4 border-l-error bloom-error relative overflow-hidden group"
        id="expenses-hero-card"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total Gastos del Mes</h3>
            <div className="font-headline text-2xl font-extrabold text-error mt-2">
              RD$ {totalGastos.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center border border-error/20">
            <TrendingUp className="text-error w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-on-surface-variant mt-6 pt-4 border-t border-white/5 font-sans">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error bloom-error"></span>
            vs. Mes Pasado (Proyección)
          </span>
          <span className="text-error font-semibold">+15.2%</span>
        </div>
      </motion.div>

      {/* Action triggers Buttons (Categorized Expenses) */}
      <div className="grid grid-cols-2 gap-4 mt-4" id="expense-action-buttons">
        <motion.button 
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleOpenAddForm('piezas')}
          className="bg-gradient-to-br from-primary-container to-primary flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl bloom-primary text-on-primary-container hover:opacity-95 cursor-pointer border border-white/10"
          id="btn-add-gasto-piezas"
        >
          <Cpu className="w-6 h-6 text-white" />
          <span className="font-sans text-[11px] font-bold text-white">+ Gasto Piezas</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleOpenAddForm('fijo')}
          className="bg-surface-container/50 border border-secondary/30 flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl text-secondary hover:bg-secondary/10 hover:border-secondary transition-all bloom-secondary cursor-pointer"
          id="btn-add-gasto-fijo"
        >
          <Bolt className="w-6 h-6 text-secondary" />
          <span className="font-sans text-[11px] font-bold text-secondary">+ Gasto Fijo</span>
        </motion.button>
      </div>

      {/* Expense History List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-md font-bold text-on-surface">Historial de Gastos</h3>
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Auto-ordenado
          </span>
        </div>

        <div className="space-y-3">
          {expenses.map(e => (
            <motion.div 
              layout
              key={e.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-xl p-4 flex items-center justify-between border border-white/5"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/5">
                  {getCategoryIcon(e.category)}
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-on-surface leading-snug">{e.title}</h4>
                  <p className="font-sans text-[10px] text-on-surface-variant mt-1 font-medium italic">
                    {e.date} • {e.category === 'piezas' ? 'Compra de Repuestos' : e.category === 'fijo' ? 'Costos Fijos' : 'Inventario de Accesorios'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-sans text-xs text-error font-bold">-RD$ {e.amount.toLocaleString('es-DO')}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full font-sans text-[9px] font-bold border ${
                    e.status === 'completado' 
                      ? 'bg-emerald-400/5 text-emerald-400 border-emerald-400/10' 
                      : 'bg-[#f59e0b]/5 text-[#f59e0b] border-[#f59e0b]/10'
                  }`}>
                    {e.status === 'completado' ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
                {e.status === 'pendiente' && onPayExpense && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPayExpense(e.id)}
                    className="py-1 px-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all font-sans text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                    title="Registrar Pago de Factura"
                  >
                    <Check className="w-3 h-3 text-emerald-400" /> Pagar
                  </motion.button>
                )}
                <button 
                  onClick={() => onDeleteExpense(e.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                  title="Eliminar Gasto"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Theme Control Section */}
      {onToggleDarkMode && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex flex-col gap-3 relative overflow-hidden mb-4"
          id="theme-control-section"
        >
          <div className="flex items-center gap-2.5">
            {darkMode ? (
              <Moon className="text-indigo-400 w-5 h-5 flex-shrink-0" />
            ) : (
              <Sun className="text-amber-500 w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <h4 className="font-headline text-xs font-bold text-slate-800 dark:text-white">Modo del Sistema</h4>
              <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Personaliza la apariencia de la aplicación para trabajar cómodamente.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => { if (darkMode) onToggleDarkMode(); }}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-sm font-bold cursor-pointer ${
                !darkMode 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Claro
            </button>
            <button
              type="button"
              onClick={() => { if (!darkMode) onToggleDarkMode(); }}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-sm font-bold cursor-pointer ${
                darkMode 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Oscuro
            </button>
          </div>
        </motion.div>
      )}

      {/* Reset System Data Section */}
      {onClearAllData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-4 border border-rose-500/20 bg-rose-950/10 flex flex-col gap-3 relative overflow-hidden"
          id="clear-all-data-section"
        >
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="text-rose-400 w-5 h-5 flex-shrink-0" />
            <div>
              <h4 className="font-headline text-xs font-bold text-white">Configuración del Sistema</h4>
              <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">Vaciar la base de datos almacenada para comenzar a registrar tu propio negocio desde cero.</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2.5 rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all text-rose-300 font-sans text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Limpiar Todos los Datos
          </motion.button>
        </motion.div>
      )}

      {/* Add Gasto Form Overlays */}
      <AnimatePresence>
        {showAddForm && selectedCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md relative font-sans"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-on-surface-variant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleSubmitExpense} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <PlusCircle className="text-primary w-5 h-5" />
                  <h3 className="font-headline text-md font-bold text-white">
                    Registrar Gasto ({selectedCategory === 'piezas' ? 'Repuestos' : 'Fijos/Operación'})
                  </h3>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Detalle / Concepto</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Pantalla iPhone 12 Pro o Copia Llaves"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Monto (RD$)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="0.00"
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">Estado del Gasto</label>
                  <select 
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs focus:ring-0 focus:outline-none"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'completado' | 'pendiente')}
                  >
                    <option value="completado">Pagado Completado</option>
                    <option value="pendiente">Pendiente por Liquidar</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-br from-primary-container to-primary hover:opacity-90 font-bold text-xs text-white tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Check className="w-4 h-4" /> Registrar en Base de Datos
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm relative font-sans text-center space-y-4"
            >
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="font-headline text-md font-extrabold text-white">¿Estás seguro de continuar?</h3>
                <p className="font-sans text-[11px] text-on-surface-variant mt-2 leading-relaxed">
                  Esta acción borrará de forma permanente todos los **trabajos de reparación**, **gastos**, **pedidos bajo pedido**, y **ventas de teléfonos usados** guardados localmente. No podrás recuperarlos.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-11 rounded-xl bg-white/5 border border-white/5 font-bold text-xs text-white hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onClearAllData) {
                      onClearAllData();
                    }
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-90 font-bold text-xs text-white tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/10 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Sí, Borrar Todo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
