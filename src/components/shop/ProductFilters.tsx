import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { type Product } from '@/api/shop';

// Kakie compat-polya pokazyvat kak filtry dlya kazhdoy kategorii
const FILTER_FIELDS: Record<string, { key: string; label: string }[]> = {
  cpu: [{ key: 'socket', label: 'Сокет' }, { key: 'memoryType', label: 'Память' }, { key: 'cores', label: 'Ядра' }],
  motherboard: [{ key: 'socket', label: 'Сокет' }, { key: 'chipset', label: 'Чипсет' }, { key: 'formFactor', label: 'Форм-фактор' }, { key: 'memoryType', label: 'Память' }],
  gpu: [{ key: 'vramGb', label: 'Видеопамять' }, { key: 'memoryType', label: 'Тип памяти' }, { key: 'rayTracing', label: 'Ray Tracing' }],
  ram: [{ key: 'memoryType', label: 'Тип' }, { key: 'capacityGb', label: 'Объём' }, { key: 'clock', label: 'Частота' }],
  ssd: [{ key: 'capacityGb', label: 'Объём' }],
  ssd_m2: [{ key: 'capacityGb', label: 'Объём' }],
  hdd: [{ key: 'capacityGb', label: 'Объём' }],
  psu: [{ key: 'watts', label: 'Мощность' }, { key: 'certification', label: 'Сертификат' }],
  case: [{ key: 'fanSlots', label: 'Слоты вент.' }],
  air_cooler: [{ key: 'tdpRating', label: 'TDP' }],
  liquid_cooler: [{ key: 'radiatorMm', label: 'Радиатор' }],
  fan: [{ key: 'sizeMm', label: 'Размер' }],
};

interface Props {
  products: Product[];
  category: string;
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}

const ProductFilters = ({ products, category, value, onChange }: Props) => {
  const fields = FILTER_FIELDS[category] || [];

  const optionsByField = useMemo(() => {
    const map: Record<string, string[]> = {};
    fields.forEach((f) => {
      const set = new Set<string>();
      products.forEach((p) => {
        const raw = (p.compat as Record<string, unknown>)[f.key];
        if (raw === undefined || raw === null) return;
        const str = typeof raw === 'boolean' ? (raw ? 'Есть' : 'Нет') : String(raw);
        set.add(str);
      });
      if (set.size > 1) map[f.key] = Array.from(set);
    });
    return map;
  }, [products, fields]);

  const toggle = (key: string, opt: string) => {
    const next = { ...value };
    if (next[key] === opt) delete next[key];
    else next[key] = opt;
    onChange(next);
  };

  const hasFilters = Object.keys(optionsByField).length > 0;
  if (!hasFilters) return null;

  return (
    <div className="mb-4 space-y-2 rounded-xl border border-border/80 bg-card p-3">
      {fields.map((f) => {
        const opts = optionsByField[f.key];
        if (!opts) return null;
        return (
          <div key={f.key} className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">{f.label}:</span>
            {opts.map((o) => (
              <button
                key={o}
                onClick={() => toggle(f.key, o)}
                className={cn('rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                  value[f.key] === o ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}
              >
                {o}
              </button>
            ))}
          </div>
        );
      })}
      {Object.keys(value).length > 0 && (
        <button onClick={() => onChange({})} className="text-xs text-primary hover:underline">Сбросить фильтры</button>
      )}
    </div>
  );
};

export default ProductFilters;
