const CATALOG_URL = 'https://functions.poehali.dev/6fd337cc-cc59-42b9-971e-776b0a6b4159';

export type ComponentType =
  | 'CPU' | 'GPU' | 'RAM' | 'SSD' | 'MOTHERBOARD' | 'PSU' | 'CASE';

export interface BuildComponent {
  type: ComponentType;
  brand: string;
  name: string;
  spec: string;
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

export function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU') + ' ₽';
}
