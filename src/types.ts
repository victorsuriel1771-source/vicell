export type TicketStatus = 'listo' | 'en_proceso' | 'esperando_pieza';

export interface Ticket {
  id: string;
  clientName: string;
  clientPhone: string;
  deviceBrand: string;
  deviceModel: string;
  imei: string;
  reportedFailure: string;
  status: TicketStatus;
  statusDetail?: string; // e.g., 'En mesa de trabajo #2', 'Llega mañana'
  assignedTechnician?: string;
  totalPrice: number;
  advancePaid: number;
  remainingPrice: number;
  createdAt: string;
  completedAt?: string;
}

export type ExpenseCategory = 'piezas' | 'fijo' | 'inventario';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  status: 'completado' | 'pendiente';
}

export interface Encargo {
  id: string;
  clientName: string;
  clientPhone: string;
  itemName: string;
  quantity: number;
  price: number;
  cost: number;
  gain: number;
  status: 'pendiente' | 'entregado';
  date: string;
}

export interface SystemStats {
  realGain: number;       // RD$ 82,000.00 (Ingresos - Gastos)
  monthlyIncome: number;  // RD$ 175.00
  monthlyExpenses: number; // RD$ 170.00
  totalOutstanding: number; // Por cobrar (Deudas) - RD$ 165.00
}

export interface VentaUsado {
  id: string;
  clientName: string;
  clientPhone: string;
  phoneModel: string;
  imei: string;
  purchaseCost: number;
  sellPrice: number;
  gain: number;
  status: 'completado' | 'pendiente';
  saleDate: string; // e.g. "2026-06-19"
}

export type SparePartType = 'pantalla' | 'bateria' | 'pin_carga' | 'otro';

export interface SparePart {
  id: string;
  name: string;
  type: SparePartType;
  stock: number;
  threshold: number;
  cost: number;
}


