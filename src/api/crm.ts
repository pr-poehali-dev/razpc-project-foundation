import { getToken } from './auth';

const CRM_URL = 'https://functions.poehali.dev/fa84617e-fb02-47c1-9a8d-866c0f8e8cf5';

export type OrderStatus =
  | 'new' | 'approval' | 'paid' | 'assembly' | 'ready' | 'delivered' | 'canceled';

export type LeadStatus = 'new' | 'in_work' | 'converted' | 'rejected';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  approval: 'Согласование',
  paid: 'Оплачен',
  assembly: 'Сборка',
  ready: 'Готов',
  delivered: 'Выдан',
  canceled: 'Отмена',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  approval: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  assembly: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  ready: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  delivered: 'bg-primary/15 text-primary border-primary/30',
  canceled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Новая',
  in_work: 'В работе',
  converted: 'Конверсия',
  rejected: 'Отклонена',
};

export interface OrderItem {
  id?: number;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

export interface OrderListItem {
  id: number;
  order_number: string;
  status: OrderStatus;
  source: string;
  title: string | null;
  total_amount: number;
  paid_amount: number;
  cost_amount: number;
  warranty_until: string | null;
  purchase_date: string | null;
  created_at: string;
  updated_at: string;
  customer_id: number | null;
  customer_name: string | null;
  customer_phone: string | null;
}

export interface StatusHistory {
  id: number;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  comment: string | null;
  created_at: string;
}

export interface OrderDetail extends OrderListItem {
  comment: string | null;
  warranty_months: number;
  build_id: number | null;
  customer_email: string | null;
  customer_city: string | null;
  items: OrderItem[];
  history: StatusHistory[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  telegram: string | null;
  city: string | null;
  notes: string | null;
  total_spent: number;
  orders_count: number;
  created_at: string;
}

export interface CustomerDetail extends Customer {
  orders: OrderListItem[];
}

export interface Lead {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  build_id: number | null;
  build_name: string | null;
  source: string;
  status: LeadStatus;
  order_id: number | null;
  created_at: string;
  processed_at: string | null;
}

export interface CrmStats {
  orders_by_status: Record<string, number>;
  finance: {
    revenue: number; paid: number; cost: number;
    profit: number; debt: number; orders_total: number;
  };
  leads: Record<string, number>;
  conversion: number;
  customers_total: number;
  revenue_by_month: { month: string; paid: number; orders: number }[];
  lead_sources: { source: string; count: number }[];
}

function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() || '' };
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data as T;
}

// ===== Orders =====
export function fetchOrders(status?: OrderStatus, search?: string) {
  const q = new URLSearchParams({ resource: 'orders' });
  if (status) q.set('status', status);
  if (search) q.set('search', search);
  return req<{ orders: OrderListItem[]; statuses: OrderStatus[] }>(`${CRM_URL}?${q}`, {
    headers: authHeaders(),
  });
}

export function fetchOrder(id: number) {
  return req<OrderDetail>(`${CRM_URL}?resource=orders&id=${id}`, { headers: authHeaders() });
}

export function createOrder(data: Record<string, unknown>) {
  return req<{ ok: boolean; id: number; order_number: string }>(`${CRM_URL}?resource=orders`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
}

export function updateOrder(data: Record<string, unknown>) {
  return req<{ ok: boolean }>(`${CRM_URL}?resource=orders`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  });
}

// ===== Customers =====
export function fetchCustomers(search?: string) {
  const q = new URLSearchParams({ resource: 'customers' });
  if (search) q.set('search', search);
  return req<{ customers: Customer[] }>(`${CRM_URL}?${q}`, { headers: authHeaders() });
}

export function fetchCustomer(id: number) {
  return req<CustomerDetail>(`${CRM_URL}?resource=customers&id=${id}`, { headers: authHeaders() });
}

export function saveCustomer(data: Record<string, unknown>) {
  return req<{ ok: boolean; id: number }>(`${CRM_URL}?resource=customers`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
}

// ===== Leads =====
export function fetchLeads(status?: LeadStatus) {
  const q = new URLSearchParams({ resource: 'leads' });
  if (status) q.set('status', status);
  return req<{ leads: Lead[]; statuses: LeadStatus[] }>(`${CRM_URL}?${q}`, {
    headers: authHeaders(),
  });
}

export function updateLead(id: number, status: LeadStatus) {
  return req<{ ok: boolean }>(`${CRM_URL}?resource=leads`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify({ id, status }),
  });
}

/** Публичное создание заявки с сайта (без авторизации) */
export function submitLead(data: {
  name?: string; phone?: string; email?: string; message?: string;
  build_id?: number; build_name?: string; source?: string;
}) {
  return req<{ ok: boolean; id: number }>(`${CRM_URL}?resource=lead`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
}

// ===== Stats =====
export function fetchCrmStats() {
  return req<CrmStats>(`${CRM_URL}?resource=stats`, { headers: authHeaders() });
}

export function formatMoney(v: number): string {
  return (v || 0).toLocaleString('ru-RU') + ' ₽';
}
