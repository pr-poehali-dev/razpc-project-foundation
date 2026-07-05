import { getToken } from './auth';

const WH_URL = 'https://functions.poehali.dev/0c51d7a2-1c81-4fed-a0b3-dcb5f9996284';

export type ItemStatus =
  | 'in_stock' | 'reserved' | 'in_build' | 'sold' | 'written_off'
  | 'returned' | 'diagnostics' | 'repair' | 'awaiting_supply';

export type Condition = 'new' | 'used' | 'refurbished' | 'defective';

export type Operation =
  | 'income' | 'sale' | 'reserve' | 'build' | 'return'
  | 'write_off' | 'transfer' | 'correction' | 'inventory';

export const STATUS_LABELS: Record<ItemStatus, string> = {
  in_stock: 'На складе',
  reserved: 'Зарезервирован',
  in_build: 'В сборке',
  sold: 'Продан',
  written_off: 'Списан',
  returned: 'Возвращён',
  diagnostics: 'На диагностике',
  repair: 'В ремонте',
  awaiting_supply: 'Ожидает поставку',
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  in_stock: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reserved: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  in_build: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  sold: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  written_off: 'bg-red-500/15 text-red-400 border-red-500/30',
  returned: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  diagnostics: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  repair: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  awaiting_supply: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  new: 'Новый',
  used: 'Б/У',
  refurbished: 'Восстановленный',
  defective: 'Дефектный',
};

export const OPERATION_LABELS: Record<Operation, string> = {
  income: 'Приход',
  sale: 'Продажа',
  reserve: 'Резервирование',
  build: 'В сборку',
  return: 'Возврат',
  write_off: 'Списание',
  transfer: 'Перемещение',
  correction: 'Корректировка',
  inventory: 'Инвентаризация',
};

export const OPERATION_ICONS: Record<Operation, string> = {
  income: 'ArrowDownToLine',
  sale: 'ShoppingCart',
  reserve: 'BookmarkCheck',
  build: 'Wrench',
  return: 'Undo2',
  write_off: 'Trash2',
  transfer: 'ArrowLeftRight',
  correction: 'PenLine',
  inventory: 'ClipboardCheck',
};

export interface Category {
  id: number;
  code: string;
  title: string;
  icon: string | null;
  component_type: string | null;
}

export interface Location {
  id: number;
  code: string;
  title: string;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface Refs {
  categories: Category[];
  locations: Location[];
  suppliers: Supplier[];
  statuses: ItemStatus[];
}

export interface Item {
  id: number;
  sku: string;
  name: string;
  category_id: number | null;
  category_title: string | null;
  category_icon: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  quantity: number;
  reserved_qty: number;
  low_stock_threshold: number;
  purchase_price: number;
  avg_purchase_price: number;
  last_purchase_price: number;
  sale_price: number;
  unit_profit: number;
  margin_pct: number;
  condition: Condition;
  status: ItemStatus;
  supplier_id: number | null;
  supplier_name: string | null;
  location_id: number | null;
  location_title: string | null;
  photo_url: string | null;
  received_at: string | null;
  created_at: string;
  notes?: string | null;
  created_by_name?: string | null;
}

export interface Movement {
  id: number;
  operation: Operation;
  qty_change: number;
  qty_after: number;
  unit_price: number | null;
  comment: string | null;
  created_at: string;
  user_name: string | null;
  from_location?: string | null;
  to_location?: string | null;
  item_name?: string;
  item_id?: number;
  sku?: string;
}

export interface PriceHistory {
  id: number;
  price_type: 'purchase' | 'sale';
  old_price: number | null;
  new_price: number | null;
  created_at: string;
  user_name: string | null;
}

export interface AuditLineShort {
  id: number;
  expected_qty: number;
  actual_qty: number | null;
  discrepancy: number | null;
  comment: string | null;
  checked_at: string | null;
  audit_title: string;
  checked_by_name: string | null;
}

export interface ItemDetail {
  item: Item;
  movements: Movement[];
  price_history: PriceHistory[];
  audits: AuditLineShort[];
  builds: number[];
}

export interface DashboardSummary {
  purchase_value: number;
  sale_value: number;
  potential_profit: number;
  avg_margin: number;
  total_units: number;
  total_positions: number;
  new_arrivals: number;
  low_stock: number;
  out_of_stock: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  movements: Movement[];
  low_stock_items: { id: number; sku: string; name: string; quantity: number; low_stock_threshold: number }[];
  by_category: { title: string; positions: number; units: number }[];
}

export interface AuditSummary {
  id: number;
  title: string;
  status: 'open' | 'completed';
  started_at: string;
  completed_at: string | null;
  started_by_name: string | null;
  total_lines: number;
  checked_lines: number;
  discrepancies: number;
}

export interface AuditLine {
  id: number;
  item_id: number;
  item_name: string;
  sku: string;
  expected_qty: number;
  actual_qty: number | null;
  discrepancy: number | null;
  comment: string | null;
  checked_at: string | null;
  checked_by_name: string | null;
}

export interface AuditDetail {
  audit: AuditSummary;
  lines: AuditLine[];
}

function headers(): HeadersInit {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() || '' };
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: headers(), ...init });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data as T;
}

// ===== Dashboard =====
export function fetchDashboard() {
  return req<DashboardData>(`${WH_URL}?resource=dashboard`);
}

// ===== Refs =====
export function fetchRefs() {
  return req<Refs>(`${WH_URL}?resource=refs`);
}

// ===== Items =====
export interface ItemFilters {
  search?: string;
  category_id?: string;
  status?: string;
  supplier_id?: string;
  location_id?: string;
  condition?: string;
  manufacturer?: string;
  stock?: 'in' | 'low' | 'out';
  price_min?: string;
  price_max?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
}

export function fetchItems(filters: ItemFilters = {}) {
  const q = new URLSearchParams({ resource: 'items' });
  Object.entries(filters).forEach(([k, v]) => {
    if (v) q.set(k, String(v));
  });
  return req<{ items: Item[] }>(`${WH_URL}?${q}`);
}

export function fetchItem(id: number) {
  return req<ItemDetail>(`${WH_URL}?resource=items&id=${id}`);
}

export function createItem(data: Record<string, unknown>) {
  return req<{ ok: boolean; id: number; sku: string }>(`${WH_URL}?resource=items`, {
    method: 'POST', body: JSON.stringify(data),
  });
}

export function updateItem(data: Record<string, unknown>) {
  return req<{ ok: boolean }>(`${WH_URL}?resource=items`, {
    method: 'PUT', body: JSON.stringify(data),
  });
}

// ===== Operations =====
export function doOperation(data: Record<string, unknown>) {
  return req<{ ok: boolean }>(`${WH_URL}?resource=operation`, {
    method: 'POST', body: JSON.stringify(data),
  });
}

// ===== Audits =====
export function fetchAudits() {
  return req<{ audits: AuditSummary[] }>(`${WH_URL}?resource=audits`);
}

export function fetchAudit(id: number) {
  return req<AuditDetail>(`${WH_URL}?resource=audits&id=${id}`);
}

export function startAudit(data: { title?: string; category_id?: number }) {
  return req<{ ok: boolean; id: number }>(`${WH_URL}?resource=audits&action=start`, {
    method: 'POST', body: JSON.stringify(data),
  });
}

export function saveAuditLine(data: { line_id: number; actual_qty: number; comment?: string }) {
  return req<{ ok: boolean; discrepancy: number }>(`${WH_URL}?resource=audits&action=line`, {
    method: 'POST', body: JSON.stringify(data),
  });
}

export function completeAudit(id: number, apply = true) {
  return req<{ ok: boolean }>(`${WH_URL}?resource=audits&action=complete`, {
    method: 'POST', body: JSON.stringify({ id, apply }),
  });
}

// ===== Helpers =====
export function formatMoney(v: number): string {
  return Math.round(v || 0).toLocaleString('ru-RU') + ' ₽';
}

export function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(v: string | null): string {
  if (!v) return '—';
  return new Date(v).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}
