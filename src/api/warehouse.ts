import { getToken } from './auth';

const WH_URL = 'https://functions.poehali.dev/0c51d7a2-1c81-4fed-a0b3-dcb5f9996284';

// ===== Статусы экземпляра =====
export type UnitStatus =
  | 'in_stock' | 'reserved' | 'in_build' | 'sold' | 'written_off'
  | 'returned' | 'diagnostics' | 'repair';

export const STATUS_LABELS: Record<string, string> = {
  in_stock: 'На складе',
  reserved: 'Зарезервирован',
  in_build: 'В сборке',
  sold: 'Продан',
  written_off: 'Списан',
  returned: 'Возвращён',
  diagnostics: 'На диагностике',
  repair: 'В ремонте',
};

export const STATUS_COLORS: Record<string, string> = {
  in_stock: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reserved: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  in_build: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  sold: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  written_off: 'bg-red-500/15 text-red-400 border-red-500/30',
  returned: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  diagnostics: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  repair: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  assembling: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  disassembled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export type Condition = 'new' | 'used' | 'refurbished' | 'defective';
export const CONDITION_LABELS: Record<string, string> = {
  new: 'Новый', used: 'Б/У', refurbished: 'Восстановленный', defective: 'Дефектный',
};

export const MACHINE_STATUS_LABELS: Record<string, string> = {
  assembling: 'Сборка', in_stock: 'На складе', reserved: 'Зарезервирован',
  sold: 'Продан', disassembled: 'Разобран',
};

export const EVENT_LABELS: Record<string, string> = {
  created: 'Создан', received: 'Принят', reserved: 'Зарезервирован',
  unreserve: 'Резерв снят', in_build: 'Установлен в ПК', removed_from_build: 'Снят со сборки',
  sold: 'Продан', write_off: 'Списан', written_off: 'Списан', return: 'Возврат',
  returned: 'Возврат', transferred: 'Перемещён', price_change: 'Цена изменена',
  status_change: 'Статус изменён', built: 'Сборка', service: 'Обслуживание',
  upgrade: 'Модернизация', owner_change: 'Смена владельца',
  to_diagnostics: 'На диагностику', to_repair: 'В ремонт', to_stock: 'Возврат на склад',
};

export const ACCOUNT_KINDS: Record<string, string> = {
  cash: 'Наличные', card: 'Карта', bank: 'Расчётный счёт',
  investor: 'Инвестор', personal: 'Личные', other: 'Другое',
};

export const CP_KINDS: Record<string, string> = {
  supplier: 'Поставщик', investor: 'Инвестор', client: 'Клиент', other: 'Другое',
};

// ===== Общие типы =====
export interface Category { id: number; code: string; title: string; icon: string | null; component_type: string | null; }
export interface Location { id: number; code: string; title: string; }
export interface Supplier { id: number; name: string; }
export interface AccountRef { id: number; name: string; kind: string; balance: number; }
export interface CounterpartyRef { id: number; name: string; kind: string; }

export interface Refs {
  categories: Category[];
  locations: Location[];
  suppliers: Supplier[];
  accounts: AccountRef[];
  counterparties: CounterpartyRef[];
  statuses: UnitStatus[];
}

// ===== Модели =====
export interface ProductModel {
  id: number; sku: string; name: string; manufacturer: string | null;
  model: string | null; category_id: number | null; category_title: string | null;
  category_icon: string | null; default_sale_price: number; low_stock_threshold: number;
  photo_url: string | null;
  in_stock: number; reserved: number; in_build: number; sold: number;
  total_units: number; avg_cost: number;
}

// ===== Экземпляры =====
export interface Unit {
  id: number; unit_number: string; serial_number: string | null;
  status: UnitStatus; condition: Condition; purchase_cost: number;
  sale_price: number; sold_price: number | null; received_at: string;
  model_id: number; model_name: string; sku: string; photo_url: string | null;
  category_title: string | null; category_icon: string | null;
  lot_id: number | null; lot_number: string | null;
  machine_id: number | null; machine_number: string | null;
  location_title: string | null; unit_profit: number;
}

export interface UnitEvent {
  id: number; event_type: string; comment: string | null; created_at: string;
  user_name: string | null; machine_number?: string | null; lot_number?: string | null;
  meta?: Record<string, unknown>;
}

export interface UnitDetail extends Unit {
  notes: string | null; manufacturer: string | null; model_model: string | null;
  lot_source: string | null; is_disassembly: boolean; machine_title: string | null;
  machine_name: string | null; supplier_name: string | null; sold_to_name: string | null;
  sold_at: string | null; order_id: number | null;
  events?: UnitEvent[];
}

// ===== Партии =====
export interface Lot {
  id: number; lot_number: string; source: string; purchase_cost: number;
  purchase_date: string; comment: string | null; is_disassembly: boolean;
  machine_title: string | null; status: string; created_at: string;
  supplier_name: string | null; units_total: number; units_left: number;
  units_sold: number; estimate_value: number; sold_value: number;
}

export interface LotAnalytics {
  purchase_cost: number; estimate_value: number; sold_value: number;
  left_estimate: number; potential_profit: number; realized_profit: number;
  units_total: number; units_sold: number; units_left: number;
}

export interface LotDetail {
  lot: Lot & { supplier_name: string | null; counterparty_name: string | null; account_name: string | null; created_by_name: string | null; purchase_method: string | null; };
  units: {
    id: number; unit_number: string; serial_number: string | null; status: UnitStatus;
    condition: Condition; purchase_cost: number; sale_price: number; sold_price: number | null;
    sold_at: string | null; order_id: number | null; machine_id: number | null;
    model_name: string; sku: string; category_title: string | null;
    machine_number: string | null; sold_to_name: string | null;
  }[];
  analytics: LotAnalytics;
}

// ===== Компьютеры =====
export interface Machine {
  id: number; machine_number: string; name: string; serial_number: string | null;
  build_date: string; labor_cost: number; parts_cost: number; total_cost: number;
  sale_price: number; status: string; created_at: string; builder_name: string | null;
  parts_count: number; profit: number;
}

export interface MachineDetail {
  machine: Machine & { comment: string | null; margin_pct: number; owner_name: string | null; sold_at: string | null; };
  parts: {
    id: number; unit_number: string; serial_number: string | null; status: UnitStatus;
    condition: Condition; purchase_cost: number; sale_price: number;
    model_name: string; sku: string; category_title: string | null; category_icon: string | null;
    lot_id: number | null; lot_number: string | null; is_disassembly: boolean; origin_machine: string | null;
  }[];
  events: { id: number; event_type: string; comment: string | null; created_at: string; user_name: string | null; }[];
}

// ===== Финансы =====
export interface Account { id: number; name: string; kind: string; balance: number; is_active: boolean; }
export interface Transaction {
  id: number; op_type: string; amount: number; direction: number; comment: string | null;
  created_at: string; account_name: string; to_account_name: string | null;
  lot_number: string | null; machine_number: string | null; unit_number: string | null;
  counterparty_name: string | null; user_name: string | null;
}
export interface Counterparty {
  id: number; name: string; kind: string; phone: string | null; notes: string | null;
  is_active: boolean; payable: number; receivable: number;
}
export interface Debt {
  id: number; kind: 'payable' | 'receivable'; amount: number; comment: string | null;
  due_date: string | null; is_settled: boolean; created_at: string; lot_id: number | null;
}
export interface CounterpartyDetail {
  counterparty: Counterparty; debts: Debt[]; transactions: Transaction[];
  payable: number; receivable: number; balance: number;
}

export interface FinanceSummary {
  total_balance: number; income_month: number; expense_month: number;
  total_payable: number; total_receivable: number;
}

// ===== Дашборд =====
export interface DashboardSummary {
  purchase_value: number; sale_value: number; potential_profit: number; avg_margin: number;
  units_available: number; in_stock: number; sold: number; new_arrivals: number;
  models_count: number; machines_count: number; lots_count: number;
}
export interface DashboardData {
  summary: DashboardSummary;
  low_stock: { id: number; name: string; low_stock_threshold: number; qty: number }[];
  events: (UnitEvent & { unit_id: number; unit_number: string; model_name: string })[];
}

// ===== HTTP =====
function headers(): HeadersInit {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() || '' };
}
async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: headers(), ...init });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data as T;
}
function qs(base: string, params: Record<string, string | undefined>): string {
  const q = new URLSearchParams({ resource: base });
  Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
  return `${WH_URL}?${q}`;
}

// ===== API: dashboard / refs =====
export const fetchDashboard = () => req<DashboardData>(qs('dashboard', {}));
export const fetchRefs = () => req<Refs>(qs('refs', {}));
export const fetchFinanceSummary = () => req<FinanceSummary>(qs('finance_summary', {}));

// ===== Модели =====
export const fetchModels = (search?: string, category_id?: string) =>
  req<{ models: ProductModel[] }>(qs('models', { search, category_id }));
export const fetchModel = (id: number) =>
  req<{ model: ProductModel; units: Unit[] }>(qs('models', { id: String(id) }));
export const saveModel = (data: Record<string, unknown>) =>
  req<{ ok: boolean; id: number; sku?: string }>(qs('models', {}), { method: data.id ? 'PUT' : 'POST', body: JSON.stringify(data) });

// ===== Экземпляры =====
export interface UnitFilters {
  search?: string; status?: string; condition?: string; location_id?: string;
  lot_id?: string; machine_id?: string; model_id?: string; category_id?: string;
}
export const fetchUnits = (f: UnitFilters = {}) =>
  req<{ units: Unit[] }>(qs('units', f as Record<string, string | undefined>));
export const fetchUnit = (id: number) =>
  req<UnitDetail & { unit: UnitDetail; events: UnitEvent[] }>(qs('units', { id: String(id) }));
export const updateUnit = (data: Record<string, unknown>) =>
  req<{ ok: boolean }>(qs('units', {}), { method: 'PUT', body: JSON.stringify(data) });
export const unitOperation = (data: Record<string, unknown>) =>
  req<{ ok: boolean }>(qs('units', { action: 'operation' }), { method: 'POST', body: JSON.stringify(data) });

// ===== Партии =====
export const fetchLots = (source?: string, search?: string) =>
  req<{ lots: Lot[] }>(qs('lots', { source, search }));
export const fetchLot = (id: number) => req<LotDetail>(qs('lots', { id: String(id) }));
export const receiveLot = (data: Record<string, unknown>) =>
  req<{ ok: boolean; lot_id: number; lot_number: string; units: number }>(qs('lots', { action: 'receive' }), { method: 'POST', body: JSON.stringify(data) });
export const createDisassembly = (data: Record<string, unknown>) =>
  req<{ ok: boolean; lot_id: number; lot_number: string; parts: number }>(qs('lots', { action: 'disassembly' }), { method: 'POST', body: JSON.stringify(data) });

// ===== Компьютеры =====
export const fetchMachines = (status?: string, search?: string) =>
  req<{ machines: Machine[] }>(qs('machines', { status, search }));
export const fetchMachine = (id: number) => req<MachineDetail>(qs('machines', { id: String(id) }));
export const buildMachine = (data: Record<string, unknown>) =>
  req<{ ok: boolean; machine_id: number; machine_number: string }>(qs('machines', { action: 'build' }), { method: 'POST', body: JSON.stringify(data) });
export const updateMachine = (data: Record<string, unknown>) =>
  req<{ ok: boolean }>(qs('machines', {}), { method: 'PUT', body: JSON.stringify(data) });

// ===== Продажа =====
export const sell = (data: Record<string, unknown>) =>
  req<{ ok: boolean }>(qs('sell', {}), { method: 'POST', body: JSON.stringify(data) });

// ===== Финансы =====
export const fetchAccounts = () => req<{ accounts: Account[]; total_balance: number }>(qs('accounts', {}));
export const saveAccount = (data: Record<string, unknown>) =>
  req<{ ok: boolean; id: number }>(qs('accounts', {}), { method: data.id ? 'PUT' : 'POST', body: JSON.stringify(data) });
export const fetchTransactions = (account_id?: string, op_type?: string) =>
  req<{ transactions: Transaction[] }>(qs('transactions', { account_id, op_type }));
export const createTransaction = (data: Record<string, unknown>) =>
  req<{ ok: boolean }>(qs('transactions', {}), { method: 'POST', body: JSON.stringify(data) });

// ===== Контрагенты / долги =====
export const fetchCounterparties = () => req<{ counterparties: Counterparty[] }>(qs('counterparties', {}));
export const fetchCounterparty = (id: number) => req<CounterpartyDetail>(qs('counterparties', { id: String(id) }));
export const saveCounterparty = (data: Record<string, unknown>) =>
  req<{ ok: boolean; id: number }>(qs('counterparties', {}), { method: data.id ? 'PUT' : 'POST', body: JSON.stringify(data) });
export const saveDebt = (data: Record<string, unknown>) =>
  req<{ ok: boolean }>(qs('debts', {}), { method: 'POST', body: JSON.stringify(data) });

// ===== Хелперы =====
export function formatMoney(v: number): string {
  return Math.round(v || 0).toLocaleString('ru-RU') + ' ₽';
}
export function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function formatDateTime(v: string | null): string {
  if (!v) return '—';
  return new Date(v).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}
