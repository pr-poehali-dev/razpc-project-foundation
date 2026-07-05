import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/admin/warehouse/StatusBadge';
import {
  fetchUnits, fetchRefs, formatMoney, STATUS_LABELS, CONDITION_LABELS,
  type Unit, type Refs,
} from '@/api/warehouse';

const AdminWarehouseUnits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [units, setUnits] = useState<Unit[]>([]);
  const [refs, setRefs] = useState<Refs | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => { fetchRefs().then(setRefs).catch(() => undefined); }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchUnits({
      search: search || undefined,
      status: status !== 'all' ? status : undefined,
      category_id: category !== 'all' ? category : undefined,
    })
      .then((d) => setUnits(d.units))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [search, status, category, toast]);

  useEffect(() => { const t = setTimeout(load, search ? 300 : 0); return () => clearTimeout(t); }, [load, search]);

  return (
    <div>
      <div>
        <h1 className="font-heading text-3xl font-bold">Экземпляры товаров</h1>
        <p className="mt-1 text-muted-foreground">{units.length} экземпляров · прослеживаемость каждой единицы</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Поиск по номеру, серийному, модели…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Категория" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {refs?.categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          : units.length === 0 ? <EmptyState icon="Box" title="Экземпляров не найдено" description="Измените фильтры или примите товар" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">Номер</th>
                    <th className="px-3 py-2.5 text-left font-medium">Модель</th>
                    <th className="px-3 py-2.5 text-left font-medium">Серийный</th>
                    <th className="px-3 py-2.5 text-left font-medium">Статус</th>
                    <th className="px-3 py-2.5 text-left font-medium">Состояние</th>
                    <th className="px-3 py-2.5 text-left font-medium">Закупка</th>
                    <th className="px-3 py-2.5 text-left font-medium">Цена</th>
                    <th className="px-3 py-2.5 text-left font-medium">Прибыль</th>
                    <th className="px-3 py-2.5 text-left font-medium">Партия</th>
                    <th className="px-3 py-2.5 text-left font-medium">Компьютер</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                      onClick={() => navigate(`/admin/warehouse/units/${u.id}`)}>
                      <td className="px-3 py-2.5 font-mono text-xs">{u.unit_number}</td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{u.model_name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{u.sku}</p>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{u.serial_number || '—'}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={u.status} /></td>
                      <td className="px-3 py-2.5 text-muted-foreground">{CONDITION_LABELS[u.condition] || u.condition}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(u.purchase_cost)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{formatMoney(u.sale_price)}</td>
                      <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${u.unit_profit > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>{formatMoney(u.unit_profit)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{u.lot_number || '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{u.machine_number || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminWarehouseUnits;
