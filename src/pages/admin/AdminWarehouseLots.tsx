import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { fetchLots, formatMoney, formatDate, type Lot } from '@/api/warehouse';

const AdminWarehouseLots = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchLots(source !== 'all' ? source : undefined, search || undefined)
      .then((d) => setLots(d.lots))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [source, search, toast]);

  useEffect(() => { const t = setTimeout(load, search ? 300 : 0); return () => clearTimeout(t); }, [load, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Партии</h1>
          <p className="mt-1 text-muted-foreground">{lots.length} партий · закупки и разборы ПК</p>
        </div>
        <Button onClick={() => navigate('/admin/warehouse/receive')}>
          <Icon name="PackagePlus" size={18} className="mr-1.5" fallback="Plus" /> Приёмка
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Поиск по номеру партии, поставщику…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Источник" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все источники</SelectItem>
            <SelectItem value="purchase">Закупка</SelectItem>
            <SelectItem value="disassembly">Разбор ПК</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          : lots.length === 0 ? <EmptyState icon="Container" title="Партий не найдено" description="Примите товар, чтобы создать партию" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">Партия</th>
                    <th className="px-3 py-2.5 text-left font-medium">Источник</th>
                    <th className="px-3 py-2.5 text-left font-medium">Дата</th>
                    <th className="px-3 py-2.5 text-left font-medium">Закупка</th>
                    <th className="px-3 py-2.5 text-left font-medium">Оценка</th>
                    <th className="px-3 py-2.5 text-left font-medium">Продано</th>
                    <th className="px-3 py-2.5 text-center font-medium">Осталось</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((l) => (
                    <tr key={l.id}
                      className={cn(
                        'cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40',
                        l.is_disassembly && 'bg-violet-500/5',
                      )}
                      onClick={() => navigate(`/admin/warehouse/lots/${l.id}`)}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {l.is_disassembly && <Icon name="Cpu" size={16} className="text-violet-400" />}
                          <span className="font-mono text-xs font-medium">{l.lot_number}</span>
                        </div>
                        {l.supplier_name && <p className="mt-0.5 text-xs text-muted-foreground">{l.supplier_name}</p>}
                      </td>
                      <td className="px-3 py-2.5">
                        {l.is_disassembly ? (
                          <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-400">Разбор ПК</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Закупка</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(l.purchase_date)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(l.purchase_cost)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{formatMoney(l.estimate_value)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-emerald-400">{formatMoney(l.sold_value)}</td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">{l.units_left} / {l.units_total}</td>
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

export default AdminWarehouseLots;
