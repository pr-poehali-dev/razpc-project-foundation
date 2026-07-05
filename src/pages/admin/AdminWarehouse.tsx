import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  fetchDashboard, formatMoney, formatDateTime, EVENT_LABELS,
  type DashboardData,
} from '@/api/warehouse';

const StatCard = ({ icon, label, value, hint, accent = 'text-primary' }: {
  icon: string; label: string; value: string; hint?: string; accent?: string;
}) => (
  <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm-premium">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon name={icon} size={16} className={accent} />
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const QuickLink = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
  <Link to={to} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
    <Icon name={icon} size={18} /> {label}
  </Link>
);

const AdminWarehouse = () => {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard().then(setData)
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;
  if (!data) return null;
  const s = data.summary;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Склад</h1>
          <p className="mt-1 text-muted-foreground">Сводка по запасам и последние операции</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickLink to="/admin/warehouse/receive" icon="ArrowDownToLine" label="Приёмка" />
          <QuickLink to="/admin/warehouse/units" icon="Boxes" label="Экземпляры" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="Wallet" label="Склад по закупке" value={formatMoney(s.purchase_value)} />
        <StatCard icon="TrendingUp" label="Оценка продажи" value={formatMoney(s.sale_value)} accent="text-emerald-400" />
        <StatCard icon="Coins" label="Потенц. прибыль" value={formatMoney(s.potential_profit)} accent="text-amber-400" />
        <StatCard icon="Percent" label="Средняя маржа" value={`${s.avg_margin}%`} accent="text-violet-400" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="Package" label="Экземпляров на складе" value={String(s.in_stock)} />
        <StatCard icon="LayoutList" label="Моделей товаров" value={String(s.models_count)} />
        <StatCard icon="Container" label="Активных партий" value={String(s.lots_count)} accent="text-cyan-400" />
        <StatCard icon="Cpu" label="Компьютеров" value={String(s.machines_count)} accent="text-blue-400" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-5">
          <h2 className="mb-4 font-heading text-lg font-semibold">Последние операции</h2>
          {data.events.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Операций пока нет</p>
          ) : (
            <div className="space-y-2">
              {data.events.map((e) => (
                <Link key={e.id} to={`/admin/warehouse/units/${e.unit_id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon name="History" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.model_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {EVENT_LABELS[e.event_type] || e.event_type} · {e.unit_number} · {e.user_name || 'Система'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-5">
          <h2 className="mb-3 font-heading text-lg font-semibold">Заканчиваются</h2>
          {data.low_stock.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Всё в достатке</p>
          ) : (
            <div className="space-y-2">
              {data.low_stock.map((it) => (
                <Link key={it.id} to={`/admin/warehouse/models/${it.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-secondary">
                  <span className="truncate text-sm">{it.name}</span>
                  <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">{it.qty} шт</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWarehouse;
