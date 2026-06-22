import { Ticket, Expense, Encargo, VentaUsado, SparePart } from './types';

export const INITIAL_TICKETS: Ticket[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_ENCARGOS: Encargo[] = [];

export const INITIAL_VENTAS_USADOS: VentaUsado[] = [];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  { id: 'sp_1', name: 'Pantalla iPhone 11 (Premium)', type: 'pantalla', stock: 2, threshold: 3, cost: 2500 },
  { id: 'sp_2', name: 'Batería iPhone 12 (Original)', type: 'bateria', stock: 5, threshold: 2, cost: 1200 },
  { id: 'sp_3', name: 'Pantalla Samsung S21 Ultra', type: 'pantalla', stock: 1, threshold: 2, cost: 8500 },
  { id: 'sp_4', name: 'Batería Xiaomi Redmi Note 11', type: 'bateria', stock: 1, threshold: 3, cost: 800 },
  { id: 'sp_5', name: 'Pin de Carga Type-C Universal', type: 'pin_carga', stock: 15, threshold: 5, cost: 150 },
  { id: 'sp_6', name: 'Batería iPhone 11 (Alta Capacidad)', type: 'bateria', stock: 4, threshold: 2, cost: 1100 }
];


