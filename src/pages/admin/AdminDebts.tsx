import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  fetchCounterparties, fetchCounterparty, saveCounterparty, saveDebt,
  formatMoney, formatDate, formatDateTime, CP_KINDS,
  type Counterparty, type CounterpartyDetail,
} from '@/api/warehouse';

const AdminDebts = () => {
  const { toast } = useToast();
  const [list, setList] = useState<Counterparty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cpOpen, setCpOpen] = useState(false);
  const [cpForm, setCpForm] = useState({ name: '', kind: 'supplier', phone: '', notes: '' });

  const [debtOpen, setDebtOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({ counterparty_id: '', kind: 'payable', amount: '0', comment: '', due_date: '' });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<CounterpartyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchCounterparties()
      .then((d) => setList(d.counterparties))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (id: number) => {
    setDetail(null);
    setDetailOpen(true);
    setDetailLoading(true);
    fetchCounterparty(id)
      .then(setDetail)
      .catch((e) => toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' }))
      .finally(() => setDetailLoading(false));
  };

  const submitCp = async () => {
    if (!cpForm.name.trim()) { toast({ title: 'Укажите название', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await saveCounterparty({ name: cpForm.name.trim(), kind: cpForm.kind, phone: cpForm.phone || undefined, notes: cpForm.notes || undefined });
      toast({ title: 'Контрагент создан' });
      setCpOpen(false);
      setCpForm({ name: '', kind: 'supplier', phone: '', notes: '' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const submitDebt = async () => {
    if (!debtForm.counterparty_id) { toast({ title: 'Выберите контрагента', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await saveDebt({
        counterparty_id: debtForm.counterparty_id, kind: debtForm.kind,
        amount: Number(debtForm.amount), comment: debtForm.comment || undefined,
        due_date: debtForm.due_date || undefined,
      });
      toast({ title: 'Обязательство добавлено' });
      setDebtOpen(false);
      setDebtForm({ counterparty_id: '', kind: 'payable', amount: '0', comment: '', due_date: '' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const settle = async (id: number) => {
    setSaving(true);
    try {
      await saveDebt({ id, settle: true });
      toast({ title: 'Долг погашен' });
      if (detail) openDetail(detail.counterparty.id);
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Долги</h1>
          <p className="mt-1 text-muted-foreground">Контрагенты и взаиморасчёты</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCpOpen(true)}><Icon name="Plus" size={18} className="mr-1.5" /> Контрагент</Button>
          <Button onClick={() => setDebtOpen(true)}><Icon name="HandCoins" size={18} className="mr-1.5" /> Обязательство</Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          : list.length === 0 ? <EmptyState icon="Users2" title="Нет контрагентов" description="Добавьте контрагента для учёта долгов" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">Контрагент</th>
                    <th className="px-3 py-2.5 text-left font-medium">Тип</th>
                    <th className="px-3 py-2.5 text-left font-medium">Телефон</th>
                    <th className="px-3 py-2.5 text-left font-medium">Мы должны</th>
                    <th className="px-3 py-2.5 text-left font-medium">Нам должны</th>
                    <th className="px-3 py-2.5 text-left font-medium">Итог</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => {
                    const total = c.receivable - c.payable;
                    return (
                      <tr key={c.id} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                        onClick={() => openDetail(c.id)}>
                        <td className="px-3 py-2.5 font-medium">{c.name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{CP_KINDS[c.kind] || c.kind}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{c.phone || '—'}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-red-400">{formatMoney(c.payable)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-emerald-400">{formatMoney(c.receivable)}</td>
                        <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${total > 0 ? 'text-emerald-400' : total < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>{formatMoney(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Dialog open={cpOpen} onOpenChange={setCpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Новый контрагент</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Название</Label><Input value={cpForm.name} onChange={(e) => setCpForm({ ...cpForm, name: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Тип</Label>
              <Select value={cpForm.kind} onValueChange={(v) => setCpForm({ ...cpForm, kind: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CP_KINDS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Телефон</Label><Input value={cpForm.phone} onChange={(e) => setCpForm({ ...cpForm, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Заметки</Label><Textarea value={cpForm.notes} onChange={(e) => setCpForm({ ...cpForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCpOpen(false)}>Отмена</Button>
            <Button disabled={saving} onClick={submitCp}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={debtOpen} onOpenChange={setDebtOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Новое обязательство</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Контрагент</Label>
              <Select value={debtForm.counterparty_id} onValueChange={(v) => setDebtForm({ ...debtForm, counterparty_id: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{list.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Тип</Label>
              <Select value={debtForm.kind} onValueChange={(v) => setDebtForm({ ...debtForm, kind: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payable">Мы должны</SelectItem>
                  <SelectItem value="receivable">Нам должны</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Сумма, ₽</Label><Input type="number" value={debtForm.amount} onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Комментарий</Label><Textarea value={debtForm.comment} onChange={(e) => setDebtForm({ ...debtForm, comment: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Дата погашения</Label><Input type="date" value={debtForm.due_date} onChange={(e) => setDebtForm({ ...debtForm, due_date: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDebtOpen(false)}>Отмена</Button>
            <Button disabled={saving} onClick={submitDebt}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{detail?.counterparty.name || 'Контрагент'}</DialogTitle></DialogHeader>
          {detailLoading || !detail ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="space-y-6 py-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border/80 bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Мы должны</p>
                  <p className="mt-1 font-heading text-xl font-bold text-red-400">{formatMoney(detail.payable)}</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Нам должны</p>
                  <p className="mt-1 font-heading text-xl font-bold text-emerald-400">{formatMoney(detail.receivable)}</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Итог</p>
                  <p className="mt-1 font-heading text-xl font-bold">{formatMoney(detail.balance)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-sm font-semibold">Долги</h3>
                <div className="mt-2 space-y-2">
                  {detail.debts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Долгов нет</p>
                  ) : detail.debts.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-border/80 bg-card p-3">
                      <div className="min-w-0">
                        <p className="font-medium">
                          <span className={d.kind === 'payable' ? 'text-red-400' : 'text-emerald-400'}>
                            {d.kind === 'payable' ? 'Мы должны' : 'Нам должны'} · {formatMoney(d.amount)}
                          </span>
                        </p>
                        {d.comment && <p className="text-xs text-muted-foreground">{d.comment}</p>}
                        <p className="text-xs text-muted-foreground">Срок: {formatDate(d.due_date)}</p>
                      </div>
                      {d.is_settled ? (
                        <span className="text-xs text-muted-foreground">Погашен</span>
                      ) : (
                        <Button size="sm" variant="outline" disabled={saving} onClick={() => settle(d.id)}>Погасить</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-heading text-sm font-semibold">Операции</h3>
                <div className="mt-2 space-y-2">
                  {detail.transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Операций нет</p>
                  ) : detail.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/80 bg-card p-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium">{formatMoney(t.amount)}</p>
                        {t.comment && <p className="text-xs text-muted-foreground">{t.comment}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDateTime(t.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDebts;
