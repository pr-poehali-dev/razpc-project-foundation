import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { EmptyState, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchItems, fetchRefs, formatMoney, formatDate,
  CONDITION_LABELS,
  type Item, type Refs, type ItemFilters, type Operation,
} from '@/api/warehouse';
import StatusBadge from '@/components/admin/warehouse/StatusBadge';
import ItemActionsMenu from '@/components/admin/warehouse/ItemActionsMenu';
import ItemFormDialog from '@/components/admin/warehouse/ItemFormDialog';
import OperationDialog from '@/components/admin/warehouse/OperationDialog';

type SortKey = 'name' | 'quantity' | 'sale_price' | 'purchase_price' | 'margin' | 'received_at' | 'created_at';

const AdminWarehouseItems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [refs, setRefs] = useState<Refs | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ItemFilters>({});
  const [sort, setSort] = useState<SortKey>('created_at');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  // Диалоги
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [opItem, setOpItem] = useState<Item | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);

  useEffect(() => {
    fetchRefs().then(setRefs).catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }));
  }, [toast]);

  const load = useCallback(() => {
    setLoading(true);
    fetchItems({ ...filters, search: search || undefined, sort, dir })
      .then((d) => setItems(d.items))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [filters, search, sort, dir, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const manufacturers = useMemo(
    () => Array.from(new Set(items.map((i) => i.manufacturer).filter(Boolean))) as string[],
    [items],
  );

  const setFilter = (k: keyof ItemFilters, v: string) =>
    setFilters((f) => ({ ...f, [k]: v === 'all' ? undefined : v }));

  const toggleSort = (key: SortKey) => {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSort(key); setDir('desc'); }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const openOperation = (op: Operation, item: Item) => { setOperation(op); setOpItem(item); };
  const openEdit = (item: Item) => { setEditItem(item); setFormOpen(true); };

  const SortHeader = ({ label, k, className }: { label: string; k: SortKey; className?: string }) => (
    <th
      className={cn('cursor-pointer select-none px-3 py-2.5 text-left font-medium whitespace-nowrap hover:text-foreground', className)}
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sort === k && <Icon name={dir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={13} />}
      </span>
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Товары на складе</h1>
          <p className="mt-1 text-muted-foreground">{items.length} позиций</p>
        </div>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }}>
          <Icon name="Plus" size={18} className="mr-1.5" /> Добавить товар
        </Button>
      </div>

      {/* Поиск + переключатель фильтров */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск по названию, SKU, модели, серийному номеру…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
          <Icon name="SlidersHorizontal" size={16} className="mr-1.5" />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Панель фильтров */}
      {showFilters && refs && (
        <div className="mt-4 grid gap-3 rounded-xl border border-border/80 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Категория" value={filters.category_id} onChange={(v) => setFilter('category_id', v)}
            options={refs.categories.map((c) => ({ value: String(c.id), label: c.title }))} />
          <FilterSelect label="Статус" value={filters.status} onChange={(v) => setFilter('status', v)}
            options={refs.statuses.map((s) => ({ value: s, label: STATUS_LABEL(s) }))} />
          <FilterSelect label="Поставщик" value={filters.supplier_id} onChange={(v) => setFilter('supplier_id', v)}
            options={refs.suppliers.map((s) => ({ value: String(s.id), label: s.name }))} />
          <FilterSelect label="Место хранения" value={filters.location_id} onChange={(v) => setFilter('location_id', v)}
            options={refs.locations.map((l) => ({ value: String(l.id), label: l.title }))} />
          <FilterSelect label="Производитель" value={filters.manufacturer} onChange={(v) => setFilter('manufacturer', v)}
            options={manufacturers.map((m) => ({ value: m, label: m }))} />
          <FilterSelect label="Наличие" value={filters.stock} onChange={(v) => setFilter('stock', v)}
            options={[{ value: 'in', label: 'В наличии' }, { value: 'low', label: 'Низкий остаток' }, { value: 'out', label: 'Нет в наличии' }]} />
          <FilterSelect label="Состояние" value={filters.condition} onChange={(v) => setFilter('condition', v)}
            options={Object.entries(CONDITION_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-muted-foreground">Цена от</label>
              <Input type="number" value={filters.price_min || ''} onChange={(e) => setFilter('price_min', e.target.value)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-muted-foreground">до</label>
              <Input type="number" value={filters.price_max || ''} onChange={(e) => setFilter('price_max', e.target.value)} />
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-end lg:col-span-4">
              <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
                <Icon name="X" size={14} className="mr-1" /> Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Таблица */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="PackageSearch"
            title="Товаров не найдено"
            description="Измените фильтры или добавьте первый товар на склад"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Фото</th>
                  <SortHeader label="Наименование" k="name" />
                  <th className="px-3 py-2.5 text-left font-medium">Категория</th>
                  <th className="px-3 py-2.5 text-left font-medium">SKU</th>
                  <SortHeader label="Кол-во" k="quantity" />
                  <SortHeader label="Закупка" k="purchase_price" />
                  <SortHeader label="Продажа" k="sale_price" />
                  <SortHeader label="Маржа" k="margin" />
                  <th className="px-3 py-2.5 text-left font-medium">Статус</th>
                  <SortHeader label="Поступл." k="received_at" />
                  <th className="px-3 py-2.5 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.id}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                    onClick={() => navigate(`/admin/warehouse/items/${it.id}`)}
                  >
                    <td className="px-3 py-2.5">
                      {it.photo_url ? (
                        <img src={it.photo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <Icon name={it.category_icon || 'Package'} size={16} fallback="Package" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{it.name}</p>
                      {(it.manufacturer || it.model) && (
                        <p className="text-xs text-muted-foreground">
                          {[it.manufacturer, it.model].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{it.category_title || '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{it.sku}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('font-medium',
                        it.quantity === 0 ? 'text-red-400'
                          : it.quantity <= it.low_stock_threshold ? 'text-amber-400' : '')}>
                        {it.quantity}
                      </span>
                      {it.reserved_qty > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">(рез. {it.reserved_qty})</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(it.avg_purchase_price)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{formatMoney(it.sale_price)}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('font-medium', it.margin_pct >= 20 ? 'text-emerald-400' : it.margin_pct > 0 ? 'text-amber-400' : 'text-muted-foreground')}>
                        {it.margin_pct}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={it.status} /></td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(it.received_at)}</td>
                    <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <ItemActionsMenu
                        item={it}
                        onOperation={openOperation}
                        onEdit={openEdit}
                        onOpen={(i) => navigate(`/admin/warehouse/items/${i.id}`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {refs && (
        <>
          <ItemFormDialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={load}
            refs={refs}
            item={editItem}
          />
          <OperationDialog
            open={!!operation}
            onClose={() => { setOperation(null); setOpItem(null); }}
            onDone={load}
            operation={operation}
            item={opItem}
            refs={refs}
          />
        </>
      )}
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

const FilterSelect = ({ label, value, onChange, options }: FilterSelectProps) => (
  <div className="space-y-1.5">
    <label className="text-xs text-muted-foreground">{label}</label>
    <Select value={value || 'all'} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

function STATUS_LABEL(s: string): string {
  const map: Record<string, string> = {
    in_stock: 'На складе', reserved: 'Зарезервирован', in_build: 'В сборке',
    sold: 'Продан', written_off: 'Списан', returned: 'Возвращён',
    diagnostics: 'На диагностике', repair: 'В ремонте', awaiting_supply: 'Ожидает поставку',
  };
  return map[s] || s;
}

export default AdminWarehouseItems;
