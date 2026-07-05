import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { EmptyState, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAudits, startAudit, fetchRefs, formatDateTime,
  type AuditSummary, type Refs,
} from '@/api/warehouse';

const AdminWarehouseAudits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [refs, setRefs] = useState<Refs | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [starting, setStarting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAudits()
      .then((d) => setAudits(d.audits))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); fetchRefs().then(setRefs).catch(() => undefined); }, []);

  const start = async () => {
    setStarting(true);
    try {
      const res = await startAudit({
        title: title || undefined,
        category_id: categoryId !== 'all' ? Number(categoryId) : undefined,
      });
      toast({ title: 'Инвентаризация начата' });
      setDialogOpen(false);
      navigate(`/admin/warehouse/audits/${res.id}`);
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setStarting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Инвентаризации</h1>
          <p className="mt-1 text-muted-foreground">Проверка фактических остатков</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Icon name="ClipboardCheck" size={18} className="mr-1.5" /> Начать инвентаризацию
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border/80 bg-card">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : audits.length === 0 ? (
          <EmptyState icon="ClipboardList" title="Инвентаризаций пока нет" description="Начните первую проверку остатков" />
        ) : (
          <div className="divide-y divide-border/60">
            {audits.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/admin/warehouse/audits/${a.id}`)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
              >
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg',
                  a.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
                  <Icon name={a.status === 'completed' ? 'CheckCheck' : 'Clock'} size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.started_by_name || '—'} · {formatDateTime(a.started_at)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">
                    Проверено {a.checked_lines}/{a.total_lines}
                  </p>
                  {a.discrepancies > 0 && (
                    <p className="text-xs font-medium text-red-400">Расхождений: {a.discrepancies}</p>
                  )}
                </div>
                <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Новая инвентаризация</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Название</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Инвентаризация" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Категория (необязательно)</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Все категории" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {refs?.categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={start} disabled={starting}>{starting ? 'Создаём…' : 'Начать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWarehouseAudits;
