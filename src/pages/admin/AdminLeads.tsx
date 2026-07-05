import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { EmptyState, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchLeads, updateLead,
  LEAD_STATUS_LABELS,
  type Lead, type LeadStatus,
} from '@/api/crm';

const FILTERS: (LeadStatus | 'all')[] = ['all', 'new', 'in_work', 'converted', 'rejected'];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_work: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  converted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const SOURCE_LABELS: Record<string, string> = {
  site_buy: 'Кнопка «Купить»',
  site_contact: 'Форма контактов',
  configurator: 'Конфигуратор',
  site: 'Сайт',
};

const AdminLeads = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');

  const load = useCallback(() => {
    setLoading(true);
    fetchLeads(filter === 'all' ? undefined : filter)
      .then((d) => setLeads(d.leads))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [filter, toast]);

  useEffect(load, [load]);

  const setStatus = async (lead: Lead, status: LeadStatus) => {
    try {
      await updateLead(lead.id, status);
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Заявки</h1>
      <p className="mt-1 text-muted-foreground">Обращения с сайта: кнопки «Купить», формы, конфигуратор.</p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
              filter === f ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-secondary',
            )}
          >
            {f === 'all' ? 'Все' : LEAD_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : leads.length === 0 ? (
          <EmptyState icon="Inbox" title="Заявок нет" description="Новые заявки с сайта появятся здесь." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {leads.map((l) => (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{l.name || 'Без имени'}</p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                      {l.phone && <span>{l.phone}</span>}
                      {l.email && <span>{l.email}</span>}
                    </div>
                  </div>
                  <span className={cn('rounded-full border px-2 py-0.5 text-xs', STATUS_COLORS[l.status])}>
                    {LEAD_STATUS_LABELS[l.status]}
                  </span>
                </div>

                {l.build_name && (
                  <p className="mt-2 text-sm">
                    <Icon name="Package" size={13} className="mr-1 inline text-primary" />
                    {l.build_name}
                  </p>
                )}
                {l.message && <p className="mt-2 text-sm text-muted-foreground">{l.message}</p>}

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{SOURCE_LABELS[l.source] || l.source}</span>
                  <span>{new Date(l.created_at).toLocaleString('ru-RU')}</span>
                </div>

                {l.status !== 'converted' && l.status !== 'rejected' && (
                  <div className="mt-3 flex gap-2">
                    {l.status === 'new' && (
                      <button onClick={() => setStatus(l, 'in_work')}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-secondary">
                        В работу
                      </button>
                    )}
                    <button onClick={() => setStatus(l, 'converted')}
                      className="rounded-lg border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10">
                      Конверсия
                    </button>
                    <button onClick={() => setStatus(l, 'rejected')}
                      className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10">
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
