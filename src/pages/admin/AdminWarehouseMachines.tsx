import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/admin/warehouse/StatusBadge';
import { fetchMachines, formatMoney, formatDate, MACHINE_STATUS_LABELS, type Machine } from '@/api/warehouse';

const AdminWarehouseMachines = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchMachines(status !== 'all' ? status : undefined, search || undefined)
      .then((d) => setMachines(d.machines))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [status, search, toast]);

  useEffect(() => { const t = setTimeout(load, search ? 300 : 0); return () => clearTimeout(t); }, [load, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Компьютеры</h1>
          <p className="mt-1 text-muted-foreground">{machines.length} сборок</p>
        </div>
        <Button onClick={() => navigate('/admin/warehouse/build')}>
          <Icon name="Cpu" size={18} className="mr-1.5" /> Собрать компьютер
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Поиск по номеру, названию, серийному…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(MACHINE_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          : machines.length === 0 ? <EmptyState icon="Cpu" title="Компьютеров не найдено" description="Соберите компьютер из комплектующих" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">Номер</th>
                    <th className="px-3 py-2.5 text-left font-medium">Название</th>
                    <th className="px-3 py-2.5 text-left font-medium">Серийный</th>
                    <th className="px-3 py-2.5 text-left font-medium">Дата сборки</th>
                    <th className="px-3 py-2.5 text-center font-medium">Компл.</th>
                    <th className="px-3 py-2.5 text-left font-medium">Себестоимость</th>
                    <th className="px-3 py-2.5 text-left font-medium">Цена</th>
                    <th className="px-3 py-2.5 text-left font-medium">Прибыль</th>
                    <th className="px-3 py-2.5 text-left font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((m) => (
                    <tr key={m.id} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                      onClick={() => navigate(`/admin/warehouse/machines/${m.id}`)}>
                      <td className="px-3 py-2.5 font-mono text-xs">{m.machine_number}</td>
                      <td className="px-3 py-2.5 font-medium">{m.name}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{m.serial_number || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(m.build_date)}</td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">{m.parts_count}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(m.total_cost)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{formatMoney(m.sale_price)}</td>
                      <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${m.profit > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>{formatMoney(m.profit)}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={m.status} machine /></td>
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

export default AdminWarehouseMachines;
