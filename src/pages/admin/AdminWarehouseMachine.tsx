import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/admin/warehouse/StatusBadge';
import {
  fetchMachine, fetchRefs, sell, formatMoney, formatDateTime,
  EVENT_LABELS,
  type MachineDetail, type Refs,
} from '@/api/warehouse';

const Metric = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="rounded-xl border border-border/80 bg-card p-5">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-2xl font-bold ${accent || ''}`}>{value}</p>
  </div>
);

const AdminWarehouseMachine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<MachineDetail | null>(null);
  const [refs, setRefs] = useState<Refs | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellForm, setSellForm] = useState({ price: '', account_id: '', customer_name: '', customer_phone: '', comment: '' });

  useEffect(() => { fetchRefs().then(setRefs).catch(() => undefined); }, []);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetchMachine(Number(id))
      .then((d) => { setData(d); setSellForm((f) => ({ ...f, price: String(d.machine.sale_price || 0) })); })
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  const submitSell = async () => {
    if (!data) return;
    setBusy(true);
    try {
      await sell({
        kind: 'machine', machine_id: data.machine.id, price: Number(sellForm.price),
        account_id: sellForm.account_id || undefined,
        customer_name: sellForm.customer_name || undefined,
        customer_phone: sellForm.customer_phone || undefined,
        comment: sellForm.comment || undefined,
      });
      toast({ title: 'Компьютер продан' });
      setSellOpen(false);
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <EmptyState icon="Cpu" title="Компьютер не найден" description="Возможно, он был удалён" />;

  const { machine, parts, events } = data;

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/admin/warehouse/machines')}>
        <Icon name="ArrowLeft" size={16} className="mr-1.5" /> Назад к компьютерам
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{machine.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-xs">{machine.machine_number}</span>
            {machine.serial_number && <span className="font-mono text-xs">· {machine.serial_number}</span>}
            <StatusBadge status={machine.status} machine />
          </p>
        </div>
        {machine.status !== 'sold' && machine.status !== 'disassembled' && (
          <Button onClick={() => setSellOpen(true)}>
            <Icon name="ShoppingCart" size={18} className="mr-1.5" /> Продать
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Себестоимость" value={formatMoney(machine.total_cost)} />
        <Metric label="Работа" value={formatMoney(machine.labor_cost)} />
        <Metric label="Комплектующие" value={formatMoney(machine.parts_cost)} />
        <Metric label="Цена продажи" value={formatMoney(machine.sale_price)} />
        <Metric label="Прибыль" value={formatMoney(machine.profit)} accent={machine.profit > 0 ? 'text-emerald-400' : ''} />
        <Metric label="Маржа" value={`${Math.round(machine.margin_pct || 0)}%`} />
      </div>

      <h2 className="mt-8 font-heading text-xl font-bold">Комплектующие</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
        {parts.length === 0 ? (
          <EmptyState icon="Box" title="Нет комплектующих" description="В сборке пока нет экземпляров" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Модель</th>
                  <th className="px-3 py-2.5 text-left font-medium">Категория</th>
                  <th className="px-3 py-2.5 text-left font-medium">Серийный</th>
                  <th className="px-3 py-2.5 text-left font-medium">Статус</th>
                  <th className="px-3 py-2.5 text-left font-medium">Закупка</th>
                  <th className="px-3 py-2.5 text-left font-medium">Происхождение</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => (
                  <tr key={p.id} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                    onClick={() => navigate(`/admin/warehouse/units/${p.id}`)}>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{p.model_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.category_title || '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.serial_number || '—'}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(p.purchase_cost)}</td>
                    <td className="px-3 py-2.5 text-xs" onClick={(e) => e.stopPropagation()}>
                      {p.is_disassembly ? (
                        <span className="text-violet-400">Разбор: {p.origin_machine || '—'}</span>
                      ) : p.lot_id ? (
                        <Link to={`/admin/warehouse/lots/${p.lot_id}`} className="font-mono text-primary hover:underline">
                          {p.lot_number || `Партия #${p.lot_id}`}
                        </Link>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 className="mt-8 font-heading text-xl font-bold">История</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
        {events.length === 0 ? (
          <EmptyState icon="History" title="Событий нет" description="История операций пуста" />
        ) : (
          <div className="divide-y divide-border/60">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Icon name="Circle" size={12} fallback="Circle" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{EVENT_LABELS[ev.event_type] || ev.event_type}</p>
                  {ev.comment && <p className="text-sm text-muted-foreground">{ev.comment}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(ev.created_at)}{ev.user_name && ` · ${ev.user_name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Продажа компьютера</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Цена, ₽</Label>
              <Input type="number" value={sellForm.price} onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Счёт зачисления</Label>
              <Select value={sellForm.account_id} onValueChange={(v) => setSellForm({ ...sellForm, account_id: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите счёт" /></SelectTrigger>
                <SelectContent>{refs?.accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Имя покупателя</Label><Input value={sellForm.customer_name} onChange={(e) => setSellForm({ ...sellForm, customer_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Телефон</Label><Input value={sellForm.customer_phone} onChange={(e) => setSellForm({ ...sellForm, customer_phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Комментарий</Label><Textarea value={sellForm.comment} onChange={(e) => setSellForm({ ...sellForm, comment: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellOpen(false)}>Отмена</Button>
            <Button disabled={busy} onClick={submitSell}>Продать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWarehouseMachine;
