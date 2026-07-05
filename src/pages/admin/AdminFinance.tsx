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
  fetchFinanceSummary, fetchAccounts, fetchTransactions, saveAccount, createTransaction,
  formatMoney, formatDateTime, ACCOUNT_KINDS,
  type FinanceSummary, type Account, type Transaction,
} from '@/api/warehouse';

const OP_LABELS: Record<string, string> = {
  income: 'Приход', expense: 'Расход', transfer: 'Перевод',
  deposit: 'Пополнение', withdrawal: 'Списание', refund: 'Возврат',
};
const OP_GREEN = ['income', 'deposit', 'refund'];
const OP_RED = ['expense', 'withdrawal'];

const opColor = (op: string) =>
  OP_GREEN.includes(op) ? 'text-emerald-400' : OP_RED.includes(op) ? 'text-red-400' : 'text-muted-foreground';

const SummaryCard = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="rounded-xl border border-border/80 bg-card p-5">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-2xl font-bold ${accent || ''}`}>{value}</p>
  </div>
);

const AdminFinance = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accOpen, setAccOpen] = useState(false);
  const [accForm, setAccForm] = useState({ name: '', kind: 'cash', balance: '0' });

  const [opOpen, setOpOpen] = useState(false);
  const [opForm, setOpForm] = useState({ op_type: 'income', amount: '0', account_id: '', to_account_id: '', comment: '' });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchFinanceSummary(), fetchAccounts(), fetchTransactions()])
      .then(([s, a, t]) => { setSummary(s); setAccounts(a.accounts); setTransactions(t.transactions); })
      .catch((e) => toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const submitAccount = async () => {
    if (!accForm.name.trim()) { toast({ title: 'Укажите название', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await saveAccount({ name: accForm.name.trim(), kind: accForm.kind, balance: Number(accForm.balance) });
      toast({ title: 'Счёт создан' });
      setAccOpen(false);
      setAccForm({ name: '', kind: 'cash', balance: '0' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const submitOp = async () => {
    if (!opForm.account_id) { toast({ title: 'Выберите счёт', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await createTransaction({
        op_type: opForm.op_type, amount: Number(opForm.amount), account_id: opForm.account_id,
        to_account_id: opForm.op_type === 'transfer' ? (opForm.to_account_id || undefined) : undefined,
        comment: opForm.comment || undefined,
      });
      toast({ title: 'Операция проведена' });
      setOpOpen(false);
      setOpForm({ op_type: 'income', amount: '0', account_id: '', to_account_id: '', comment: '' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Финансы</h1>
          <p className="mt-1 text-muted-foreground">Счета, операции и денежные потоки</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAccOpen(true)}><Icon name="Plus" size={18} className="mr-1.5" /> Счёт</Button>
          <Button onClick={() => setOpOpen(true)}><Icon name="ArrowLeftRight" size={18} className="mr-1.5" /> Операция</Button>
        </div>
      </div>

      {summary && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Общий баланс" value={formatMoney(summary.total_balance)} />
          <SummaryCard label="Приход за месяц" value={formatMoney(summary.income_month)} accent="text-emerald-400" />
          <SummaryCard label="Расход за месяц" value={formatMoney(summary.expense_month)} accent="text-red-400" />
          <SummaryCard label="Мы должны" value={formatMoney(summary.total_payable)} accent="text-red-400" />
          <SummaryCard label="Нам должны" value={formatMoney(summary.total_receivable)} accent="text-emerald-400" />
        </div>
      )}

      <h2 className="mt-8 font-heading text-xl font-bold">Счета</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <EmptyState className="sm:col-span-2 lg:col-span-3" icon="Wallet" title="Нет счетов" description="Создайте счёт для учёта денег" />
        ) : accounts.map((a) => (
          <div key={a.id} className="rounded-xl border border-border/80 bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">{ACCOUNT_KINDS[a.kind] || a.kind}</p>
              </div>
              <Icon name="Wallet" size={20} className="text-muted-foreground" />
            </div>
            <p className="mt-3 font-heading text-2xl font-bold">{formatMoney(a.balance)}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-heading text-xl font-bold">Последние операции</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
        {transactions.length === 0 ? (
          <EmptyState icon="Receipt" title="Операций нет" description="Проведите первую операцию" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Тип</th>
                  <th className="px-3 py-2.5 text-left font-medium">Сумма</th>
                  <th className="px-3 py-2.5 text-left font-medium">Счёт</th>
                  <th className="px-3 py-2.5 text-left font-medium">Комментарий</th>
                  <th className="px-3 py-2.5 text-left font-medium">Связь</th>
                  <th className="px-3 py-2.5 text-left font-medium">Дата</th>
                  <th className="px-3 py-2.5 text-left font-medium">Пользователь</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const link = t.lot_number || t.machine_number || t.unit_number || t.counterparty_name;
                  return (
                    <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40">
                      <td className={`px-3 py-2.5 font-medium ${opColor(t.op_type)}`}>{OP_LABELS[t.op_type] || t.op_type}</td>
                      <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${opColor(t.op_type)}`}>
                        {t.direction < 0 ? '−' : t.direction > 0 ? '+' : ''}{formatMoney(t.amount)}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {t.account_name}{t.to_account_name && <> → {t.to_account_name}</>}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{t.comment || '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{link || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDateTime(t.created_at)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{t.user_name || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={accOpen} onOpenChange={setAccOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Новый счёт</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Название</Label><Input value={accForm.name} onChange={(e) => setAccForm({ ...accForm, name: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Тип</Label>
              <Select value={accForm.kind} onValueChange={(v) => setAccForm({ ...accForm, kind: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(ACCOUNT_KINDS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Начальный баланс, ₽</Label><Input type="number" value={accForm.balance} onChange={(e) => setAccForm({ ...accForm, balance: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccOpen(false)}>Отмена</Button>
            <Button disabled={saving} onClick={submitAccount}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={opOpen} onOpenChange={setOpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Новая операция</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Тип операции</Label>
              <Select value={opForm.op_type} onValueChange={(v) => setOpForm({ ...opForm, op_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(OP_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Сумма, ₽</Label><Input type="number" value={opForm.amount} onChange={(e) => setOpForm({ ...opForm, amount: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Счёт</Label>
              <Select value={opForm.account_id} onValueChange={(v) => setOpForm({ ...opForm, account_id: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите счёт" /></SelectTrigger>
                <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {opForm.op_type === 'transfer' && (
              <div className="space-y-1.5">
                <Label>Счёт назначения</Label>
                <Select value={opForm.to_account_id} onValueChange={(v) => setOpForm({ ...opForm, to_account_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите счёт" /></SelectTrigger>
                  <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5"><Label>Комментарий</Label><Textarea value={opForm.comment} onChange={(e) => setOpForm({ ...opForm, comment: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpOpen(false)}>Отмена</Button>
            <Button disabled={saving} onClick={submitOp}>Провести</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;
