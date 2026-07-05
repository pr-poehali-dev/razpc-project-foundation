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
  fetchUnit, fetchRefs, unitOperation, sell, formatMoney, formatDate, formatDateTime,
  EVENT_LABELS, CONDITION_LABELS,
  type UnitDetail, type UnitEvent, type Refs,
} from '@/api/warehouse';

const Metric = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="rounded-xl border border-border/80 bg-card p-5">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-2xl font-bold ${accent || ''}`}>{value}</p>
  </div>
);

const AdminWarehouseUnit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [events, setEvents] = useState<UnitEvent[]>([]);
  const [refs, setRefs] = useState<Refs | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellForm, setSellForm] = useState({ price: '', account_id: '', customer_name: '', customer_phone: '', comment: '' });

  useEffect(() => { fetchRefs().then(setRefs).catch(() => undefined); }, []);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetchUnit(Number(id))
      .then((d) => {
        setUnit(d.unit);
        setEvents(d.events || []);
        setSellForm((f) => ({ ...f, price: String(d.unit.sale_price || 0) }));
      })
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  const runOp = async (operation: string) => {
    if (!unit) return;
    setBusy(true);
    try {
      await unitOperation({ operation, unit_id: unit.id });
      toast({ title: 'Операция выполнена' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const submitSell = async () => {
    if (!unit) return;
    setBusy(true);
    try {
      await sell({
        kind: 'unit', unit_id: unit.id, price: Number(sellForm.price),
        account_id: sellForm.account_id || undefined,
        customer_name: sellForm.customer_name || undefined,
        customer_phone: sellForm.customer_phone || undefined,
        comment: sellForm.comment || undefined,
      });
      toast({ title: 'Экземпляр продан' });
      setSellOpen(false);
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!unit) return <EmptyState icon="Box" title="Экземпляр не найден" description="Возможно, он был удалён" />;

  const profit = unit.sale_price - unit.purchase_cost;

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
        <Icon name="ArrowLeft" size={16} className="mr-1.5" /> Назад
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold">{unit.model_name}</h1>
            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
              <span className="font-mono text-xs">{unit.unit_number}</span>
              {unit.sku && <span className="font-mono text-xs">· {unit.sku}</span>}
              <StatusBadge status={unit.status} />
            </p>
          </div>
        </div>
        {unit.status !== 'sold' && unit.status !== 'written_off' && (
          <Button onClick={() => setSellOpen(true)}>
            <Icon name="ShoppingCart" size={18} className="mr-1.5" /> Продать
          </Button>
        )}
      </div>

      <div className="mt-6 rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Icon name="GitBranch" size={18} /> Происхождение
        </h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Откуда появился</p>
            {unit.is_disassembly ? (
              <p className="mt-1 font-medium">Из разбора: {unit.machine_title || '—'}</p>
            ) : (
              <p className="mt-1 font-medium">
                {unit.lot_id ? (
                  <Link to={`/admin/warehouse/lots/${unit.lot_id}`} className="text-primary hover:underline">
                    {unit.lot_number || `Партия #${unit.lot_id}`}
                  </Link>
                ) : '—'}
                {unit.supplier_name && <span className="text-muted-foreground"> · {unit.supplier_name}</span>}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Поступил</p>
            <p className="mt-1 font-medium">{formatDate(unit.received_at)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Состояние</p>
            <p className="mt-1 font-medium">{CONDITION_LABELS[unit.condition] || unit.condition}</p>
          </div>
          {unit.machine_id && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">В компьютере</p>
              <p className="mt-1 font-medium">
                <Link to={`/admin/warehouse/machines/${unit.machine_id}`} className="text-primary hover:underline">
                  {unit.machine_number || `Компьютер #${unit.machine_id}`}
                </Link>
              </p>
            </div>
          )}
          {unit.status === 'sold' && (
            <>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Продан</p>
                <p className="mt-1 font-medium">{formatDateTime(unit.sold_at)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Покупатель</p>
                <p className="mt-1 font-medium">{unit.sold_to_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Продан за</p>
                <p className="mt-1 font-medium">{formatMoney(unit.sold_price || 0)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Прибыль</p>
                <p className={`mt-1 font-medium ${(unit.sale_price - unit.purchase_cost) > 0 ? 'text-emerald-400' : ''}`}>
                  {formatMoney(unit.sale_price - unit.purchase_cost)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Закупка" value={formatMoney(unit.purchase_cost)} />
        <Metric label="Цена продажи" value={formatMoney(unit.sale_price)} />
        <Metric label="Прибыль" value={formatMoney(profit)} accent={profit > 0 ? 'text-emerald-400' : ''} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={() => runOp('reserve')}>Зарезервировать</Button>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => runOp('unreserve')}>Снять резерв</Button>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => runOp('to_stock')}>Вернуть на склад</Button>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => runOp('to_diagnostics')}>На диагностику</Button>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => runOp('to_repair')}>В ремонт</Button>
        <Button variant="outline" size="sm" disabled={busy} className="text-destructive hover:text-destructive" onClick={() => runOp('write_off')}>Списать</Button>
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
          <DialogHeader><DialogTitle>Продажа экземпляра</DialogTitle></DialogHeader>
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

export default AdminWarehouseUnit;
