import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchCrmStats, ORDER_STATUS_LABELS, formatMoney,
  type CrmStats, type OrderStatus,
} from '@/api/crm';

const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const monthLabel = (m: string) => {
  const idx = Number(m.split('-')[1]) - 1;
  return MONTHS_RU[idx] || m;
};

interface KpiProps { icon: string; label: string; value: string; hint?: string; accent?: boolean }
const Kpi = ({ icon, label, value, hint, accent }: KpiProps) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon name={icon} size={16} className={accent ? 'text-primary' : ''} />
      {label}
    </div>
    <div className={cn('mt-2 text-2xl font-bold', accent && 'text-primary')}>{value}</div>
    {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
  </div>
);

const AdminAnalytics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrmStats()
      .then(setStats)
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!stats) return null;

  const maxRevenue = Math.max(1, ...stats.revenue_by_month.map((m) => m.paid));
  const statusEntries = Object.entries(stats.orders_by_status) as [OrderStatus, number][];
  const maxStatus = Math.max(1, ...statusEntries.map(([, v]) => v));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Аналитика</h1>
      <p className="mt-1 text-muted-foreground">Продажи, финансы, лиды и конверсия.</p>

      {/* KPI */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon="Wallet" label="Оплачено" value={formatMoney(stats.finance.paid)} accent />
        <Kpi icon="TrendingUp" label="Прибыль" value={formatMoney(stats.finance.profit)}
          hint={`себестоимость ${formatMoney(stats.finance.cost)}`} />
        <Kpi icon="Clock" label="Долг клиентов" value={formatMoney(stats.finance.debt)} />
        <Kpi icon="ShoppingCart" label="Заказов" value={String(stats.finance.orders_total)} />
        <Kpi icon="Users2" label="Клиентов" value={String(stats.customers_total)} />
        <Kpi icon="Inbox" label="Заявок" value={String(Object.values(stats.leads).reduce((a, b) => a + b, 0))} />
        <Kpi icon="Target" label="Конверсия" value={`${stats.conversion}%`} accent />
        <Kpi icon="DollarSign" label="Выручка (общая)" value={formatMoney(stats.finance.revenue)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Выручка по месяцам */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-lg font-semibold">Выручка по месяцам</h2>
          {stats.revenue_by_month.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет данных.</p>
          ) : (
            <div className="flex h-48 items-end gap-3">
              {stats.revenue_by_month.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-primary transition-all"
                      style={{ height: `${(m.paid / maxRevenue) * 100}%`, minHeight: m.paid ? 4 : 0 }}
                      title={formatMoney(m.paid)}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Заказы по статусам */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-lg font-semibold">Заказы по статусам</h2>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет данных.</p>
          ) : (
            <div className="space-y-2.5">
              {statusEntries.map(([status, count]) => (
                <div key={status} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 text-muted-foreground">{ORDER_STATUS_LABELS[status]}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Источники лидов */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 font-heading text-lg font-semibold">Источники заявок</h2>
        {stats.lead_sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет заявок.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {stats.lead_sources.map((s) => (
              <div key={s.source} className="rounded-xl border border-border px-4 py-2">
                <div className="text-lg font-bold">{s.count}</div>
                <div className="text-xs text-muted-foreground">{s.source}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
