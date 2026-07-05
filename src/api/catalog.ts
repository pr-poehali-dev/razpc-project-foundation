import { getToken } from './auth';

const CATALOG_URL = 'https://functions.poehali.dev/6fd337cc-cc59-42b9-971e-776b0a6b4159';

export type ComponentType =
  | 'CPU' | 'GPU' | 'RAM' | 'SSD' | 'MOTHERBOARD' | 'PSU' | 'CASE';

export interface BuildComponent {
  type: ComponentType;
  brand: string;
  name: string;
  spec: string;
  role?: string | null;
  key_specs?: string[];
  image_url?: string | null;
}

export interface BuildListItem {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  tier: string | null;
  performance_badge: string | null;
  status: 'in_stock' | 'on_order';
  warranty: string;
  is_featured: boolean;
  highlights: BuildComponent[];
}

export interface BuildDetail extends Omit<BuildListItem, 'highlights' | 'is_featured'> {
  key_tasks?: string[];
  components: BuildComponent[];
}

export async function fetchBuilds(): Promise<BuildListItem[]> {
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error('Не удалось загрузить каталог');
  const data = await res.json();
  return data.builds as BuildListItem[];
}

export async function fetchBuild(slug: string): Promise<BuildDetail> {
  const res = await fetch(`${CATALOG_URL}?slug=${encodeURIComponent(slug)}`);
  if (res.status === 404) throw new Error('not_found');
  if (!res.ok) throw new Error('Не удалось загрузить сборку');
  return (await res.json()) as BuildDetail;
}

export interface BuildUpdate {
  id: number;
  name?: string;
  tagline?: string | null;
  price?: number;
  old_price?: number | null;
  image_url?: string | null;
  tier?: string | null;
  performance_badge?: string | null;
  status?: 'in_stock' | 'on_order';
  warranty?: string;
  is_featured?: boolean;
}

export async function updateBuild(update: BuildUpdate): Promise<void> {
  const res = await fetch(CATALOG_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() || '' },
    body: JSON.stringify(update),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось сохранить товар');
}

export async function deleteBuild(id: number): Promise<void> {
  const res = await fetch(`${CATALOG_URL}?id=${id}`, {
    method: 'DELETE',
    headers: { 'X-Auth-Token': getToken() || '' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось удалить товар');
}

export async function createBuild(name?: string): Promise<{ id: number; slug: string }> {
  const res = await fetch(CATALOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() || '' },
    body: JSON.stringify({ action: 'create', name: name || 'Новая конфигурация' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось создать товар');
  return { id: data.id, slug: data.slug };
}

export function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU') + ' ₽';
}