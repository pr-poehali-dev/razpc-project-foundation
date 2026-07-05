import { useMemo, useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { type AnyPart, type SlotDef, partsByCategory } from '@/config/pcParts';
import { filterDefs } from '@/config/partFilters';
import { checkCompat, type BuildState } from '@/lib/pcCompat';
import PartCard from './PartCard';

interface Props {
  open: boolean;
  slot: SlotDef | null;
  build: BuildState;
  onClose: () => void;
  onPick: (part: AnyPart) => void;
}

type SortKey = 'price-asc' | 'price-desc';

const PartPickerDialog = ({ open, slot, build, onClose, onPick }: Props) => {
  const [onlyCompatible, setOnlyCompatible] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('price-asc');
  const [active, setActive] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setOnlyCompatible(true); setSearch(''); setSort('price-asc'); setActive({}); }
  }, [open, slot]);

  const defs = slot ? filterDefs[slot.category] : [];

  const rows = useMemo(() => {
    if (!slot) return [];
    const list = [...partsByCategory[slot.category]];
    const withCompat = list.map((part) => {
      const res = checkCompat(part, build);
      return { part, ...res };
    });

    let filtered = withCompat;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r) => `${r.part.brand} ${r.part.name}`.toLowerCase().includes(q));
    }
    // Фильтры-чипы
    for (const def of defs) {
      const val = active[def.key];
      if (val) filtered = filtered.filter((r) => def.get(r.part) === val);
    }
    if (onlyCompatible) filtered = filtered.filter((r) => r.ok);

    filtered.sort((a, b) => sort === 'price-asc' ? a.part.price - b.part.price : b.part.price - a.part.price);
    // Совместимые сначала (когда показываем все)
    filtered.sort((a, b) => Number(b.ok) - Number(a.ok));
    return filtered;
  }, [slot, build, search, defs, active, onlyCompatible, sort]);

  const optionsFor = (key: string) => {
    if (!slot) return [];
    const def = defs.find((d) => d.key === key);
    if (!def) return [];
    const set = new Set<string>();
    partsByCategory[slot.category].forEach((p) => {
      const v = def.get(p);
      if (v) set.add(v);
    });
    return Array.from(set);
  };

  if (!slot) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Icon name={slot.icon} size={20} className="text-primary" />
            {slot.title}
          </DialogTitle>
        </DialogHeader>

        {/* Панель управления */}
        <div className="space-y-3 border-b border-border px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-9 pl-9" placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button
              onClick={() => setSort((s) => (s === 'price-asc' ? 'price-desc' : 'price-asc'))}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <Icon name={sort === 'price-asc' ? 'ArrowUpNarrowWide' : 'ArrowDownWideNarrow'} size={15} />
              Цена
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5">
              <Switch checked={onlyCompatible} onCheckedChange={setOnlyCompatible} />
              <span className="text-sm font-medium">Только совместимые</span>
            </label>
          </div>

          {/* Фильтры-чипы */}
          {defs.map((def) => {
            const opts = optionsFor(def.key);
            if (opts.length <= 1) return null;
            return (
              <div key={def.key} className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-medium text-muted-foreground">{def.label}:</span>
                {opts.map((o) => {
                  const isActive = active[def.key] === o;
                  return (
                    <button
                      key={o}
                      onClick={() => setActive((prev) => ({ ...prev, [def.key]: isActive ? '' : o }))}
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                        isActive ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Список карточек */}
        <div className="grid flex-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {rows.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              <Icon name="SearchX" size={28} className="mx-auto mb-2 opacity-50" />
              Ничего не найдено по заданным условиям
            </div>
          ) : (
            rows.map((r) => (
              <PartCard
                key={r.part.id}
                part={r.part}
                icon={slot.icon}
                incompatible={!r.ok}
                reasons={r.reasons}
                onSelect={() => { onPick(r.part); onClose(); }}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartPickerDialog;
