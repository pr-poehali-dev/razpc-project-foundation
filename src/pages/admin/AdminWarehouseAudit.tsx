import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAudit, saveAuditLine, completeAudit, formatDateTime,
  type AuditDetail, type AuditLine,
} from '@/api/warehouse';

const AuditRow = ({ line, onSaved }: { line: AuditLine; onSaved: () => void }) => {
  const { toast } = useToast();
  const [value, setValue] = useState(line.actual_qty !== null ? String(line.actual_qty) : '');
  const [comment, setComment] = useState(line.comment || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (value === '') return;
    setSaving(true);
    try {
      await saveAuditLine({ line_id: line.id, actual_qty: Number(value), comment });
      onSaved();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const disc = value !== '' ? Number(value) - line.expected_qty : null;

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="px-3 py-2.5">
        <p className="text-sm font-medium">{line.item_name}</p>
        <p className="font-mono text-xs text-muted-foreground">{line.sku}</p>
      </td>
      <td className="px-3 py-2.5 text-center text-muted-foreground">{line.expected_qty}</td>
      <td className="px-3 py-2.5">
        <Input
          type="number"
          className="h-9 w-20"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          placeholder="—"
        />
      </td>
      <td className="px-3 py-2.5 text-center">
        {disc !== null && disc !== 0 ? (
          <span className={cn('font-semibold', disc > 0 ? 'text-emerald-400' : 'text-red-400')}>
            {disc > 0 ? '+' : ''}{disc}
          </span>
        ) : disc === 0 && value !== '' ? (
          <Icon name="Check" size={16} className="mx-auto text-emerald-400" />
        ) : '—'}
      </td>
      <td className="px-3 py-2.5">
        <Input
          className="h-9"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={save}
          placeholder="Комментарий"
        />
      </td>
      <td className="px-3 py-2.5 text-center">
        {saving ? <Spinner size="sm" /> : line.checked_at ? (
          <span className="text-xs text-muted-foreground">{formatDateTime(line.checked_at)}</span>
        ) : null}
      </td>
    </tr>
  );
};

const AdminWarehouseAudit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    fetchAudit(Number(id))
      .then(setData)
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  const finish = async () => {
    if (!id) return;
    setCompleting(true);
    try {
      await completeAudit(Number(id), true);
      toast({ title: 'Инвентаризация завершена', description: 'Остатки скорректированы' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;
  if (!data) return null;

  const a = data.audit;
  const checked = data.lines.filter((l) => l.actual_qty !== null).length;
  const isCompleted = a.status === 'completed';

  return (
    <div>
      <button onClick={() => navigate('/admin/warehouse/audits')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <Icon name="ArrowLeft" size={16} /> К списку инвентаризаций
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold">{a.title}</h1>
            <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium',
              isCompleted ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30')}>
              {isCompleted ? 'Завершена' : 'В процессе'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {a.started_by_name} · {formatDateTime(a.started_at)} · Проверено {checked}/{data.lines.length}
          </p>
        </div>
        {!isCompleted && (
          <Button onClick={finish} disabled={completing || checked === 0}>
            <Icon name="CheckCheck" size={18} className="mr-1.5" />
            {completing ? 'Завершаем…' : 'Завершить и применить'}
          </Button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium">Товар</th>
                <th className="px-3 py-2.5 text-center font-medium">Ожидается</th>
                <th className="px-3 py-2.5 text-left font-medium">Фактически</th>
                <th className="px-3 py-2.5 text-center font-medium">Расхождение</th>
                <th className="px-3 py-2.5 text-left font-medium">Комментарий</th>
                <th className="px-3 py-2.5 text-center font-medium">Проверка</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((line) => (
                isCompleted ? (
                  <tr key={line.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium">{line.item_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{line.sku}</p>
                    </td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">{line.expected_qty}</td>
                    <td className="px-3 py-2.5">{line.actual_qty ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      {line.discrepancy !== null && line.discrepancy !== 0 ? (
                        <span className={cn('font-semibold', line.discrepancy > 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {line.discrepancy > 0 ? '+' : ''}{line.discrepancy}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{line.comment || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{formatDateTime(line.checked_at)}</td>
                  </tr>
                ) : (
                  <AuditRow key={line.id} line={line} onSaved={load} />
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWarehouseAudit;
