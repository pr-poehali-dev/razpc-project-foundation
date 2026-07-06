import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCity } from '@/context/CityContext';
import { fetchCities, type City } from '@/api/shop';

const CityPickerDialog = () => {
  const { pickerOpen, closePicker, setCity, city } = useCity();
  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (pickerOpen && cities.length === 0) {
      fetchCities().then(setCities).catch(() => undefined);
    }
  }, [pickerOpen, cities.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, search]);

  const popular = cities.filter((c) => c.is_popular);

  return (
    <Dialog open={pickerOpen} onOpenChange={(v) => !v && closePicker()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="MapPin" size={20} className="text-primary" /> Выберите ваш город
          </DialogTitle>
          <DialogDescription>
            От города зависят стоимость доставки, сроки и пункты выдачи.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Начните вводить название…" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        </div>

        {!search && popular.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Популярные города</p>
            <div className="flex flex-wrap gap-2">
              {popular.map((c) => (
                <button key={c.id} onClick={() => setCity(c)}
                  className={cn('rounded-full border px-3 py-1.5 text-sm transition-colors',
                    city?.id === c.id ? 'border-primary bg-primary/15 text-primary' : 'border-border hover:border-primary/40')}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setCity(c)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary">
              <span>{c.name}</span>
              {c.region && <span className="text-xs text-muted-foreground">{c.region}</span>}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Город не найден</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityPickerDialog;
