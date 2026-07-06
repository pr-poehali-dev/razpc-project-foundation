const SHOP_URL = 'https://functions.poehali.dev/7d0e15ae-020e-40c3-9f29-3d3141e7a6d2';

export interface Category {
  id: number;
  code: string;
  title: string;
  icon: string;
  config_slot: string | null;
  sort_order: number;
  product_count: number;
}

export interface Product {
  id: number;
  slug: string;
  category_code: string;
  category_title: string;
  category_icon: string;
  config_slot: string | null;
  brand: string;
  name: string;
  condition: 'new' | 'used';
  price: number;
  old_price: number | null;
  in_stock: boolean;
  warranty_months: number;
  lead_days: number;
  supplier_name: string | null;
  weight_g: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  short_desc: string | null;
  image_url: string | null;
  images: string[];
  short_specs: string[];
  specs: Record<string, Record<string, string>>;
  compat: Record<string, unknown>;
  perf_score: number | null;
  is_featured: boolean;
}

export interface City {
  id: number;
  name: string;
  region: string | null;
  zone: number;
  is_popular?: boolean;
}

export interface PickupPoint {
  id: number;
  provider: string;
  address: string;
  work_hours: string | null;
  lat: number | null;
  lon: number | null;
  is_available: boolean;
}

export interface DeliveryOption {
  code: string;
  provider: string;
  name: string;
  icon: string;
  price: number;
  days: { min: number; max: number };
}

export interface DeliveryItem {
  weight_g: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  qty: number;
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data as T;
}

export const fetchCategories = () =>
  req<{ categories: Category[] }>(`${SHOP_URL}?resource=categories`).then((d) => d.categories);

export interface ProductFilters {
  category?: string;
  slot?: string;
  search?: string;
  condition?: string;
  in_stock?: string;
  sort?: string;
  [key: string]: string | undefined;
}

export const fetchProducts = (filters: ProductFilters = {}) => {
  const q = new URLSearchParams({ resource: 'products' });
  Object.entries(filters).forEach(([k, v]) => { if (v) q.set(k, v); });
  return req<{ products: Product[] }>(`${SHOP_URL}?${q}`).then((d) => d.products);
};

export const fetchProduct = (slug: string) =>
  req<{ product: Product; similar: Product[] }>(`${SHOP_URL}?resource=products&slug=${encodeURIComponent(slug)}`);

export const fetchCities = (search?: string) => {
  const q = new URLSearchParams({ resource: 'cities' });
  if (search) q.set('search', search);
  return req<{ cities: City[] }>(`${SHOP_URL}?${q}`).then((d) => d.cities);
};

export const fetchPvz = (cityId: number) =>
  req<{ points: PickupPoint[] }>(`${SHOP_URL}?resource=pvz&city_id=${cityId}`).then((d) => d.points);

export const calcDelivery = (cityId: number, items: DeliveryItem[]) =>
  req<{ city: string; options: DeliveryOption[] }>(`${SHOP_URL}?resource=delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city_id: cityId, items }),
  });

export function formatPrice(v: number): string {
  return Math.round(v || 0).toLocaleString('ru-RU') + ' ₽';
}

export function formatWarranty(months: number): string {
  if (!months) return '—';
  if (months % 12 === 0) return `${months / 12} ${plural(months / 12, 'год', 'года', 'лет')}`;
  return `${months} мес.`;
}

export function formatLead(days: number): string {
  if (days === 0) return 'В наличии';
  return `${days} ${plural(days, 'день', 'дня', 'дней')}`;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
