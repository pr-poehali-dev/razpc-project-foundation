import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  fetchDashboard, formatMoney, formatDateTime,
  OPERATION_LABELS, OPERATION_ICONS,
  type DashboardData, type Operation,
} from '@/api/warehouse';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}

const StatCard = ({ icon, label, value, hint, accent = 'text-primary' }: StatCardProps) => (
  <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm-premium">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon name={icon} size={16} className={accent} />
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const AdminWarehouse = () => {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;
  const s = data.summary;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Склад</h1>
          <p className="mt-1 text-muted-foreground">Сводка по запасам и последние операции</p>
        </div>
        <Link
          to="/admin/warehouse/items"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Icon name="Package" size={18} />
          Все товары
        </Link>
      </div>

      {/* Финансовая сводка */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="Wallet" label="Стоимость по закупке" value={formatMoney(s.purchase_value)} />
        <StatCard icon="TrendingUp" label="Оценка продажи" value={formatMoney(s.sale_value)} accent="text-emerald-400" />
        <StatCard icon="Coins" label="Потенц. прибыль" value={formatMoney(s.potential_profit)} accent="text-amber-400" />
        <StatCard icon="Percent" label="Средняя маржа" value={`${s.avg_margin}%`} accent="text-violet-400" />
      </div>

      {/* Количественная сводка */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon="Boxes" label="Единиц товара" value={s.total_units.toLocaleString('ru-RU')} />
        <StatCard icon="LayoutList" label="Позиций" value={String(s.total_positions)} />
        <StatCard icon="Sparkles" label="Новые (7 дней)" value={String(s.new_arrivals)} accent="text-cyan-400" />
        <StatCard icon="TriangleAlert" label="Низкий остаток" value={String(s.low_stock)} accent="text-amber-400" />
        <StatCard icon="PackageX" label="Нет в наличии" value={String(s.out_of_stock)} accent="text-red-400" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Последние движения */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Последние движения</h2>
            <Icon name="History" size={18} className="text-muted-foreground" />
          </div>
          {data.movements.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Движений пока нет</p>
          ) : (
            <div className="space-y-2">
              {data.movements.map((m) => (
                <Link
                  key={m.id}
                  to={`/admin/warehouse/items/${m.item_id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon name={OPERATION_ICONS[m.operation as Operation] || 'Circle'} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.item_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {OPERATION_LABELS[m.operation as Operation]} · {m.user_name || 'Система'}
                    </p>
                  </div>
                  <div className="text-right">
                    {m.qty_change !== 0 && (
                      <span className={cn2(m.qty_change > 0)}>
                        {m.qty_change > 0 ? '+' : ''}{m.qty_change}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Низкий остаток + категории */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border/80 bg-card p-5">
            <h2 className="mb-3 font-heading text-lg font-semibold">Заканчиваются</h2>
            {data.low_stock_items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Всё в достатке</p>
            ) : (
              <div className="space-y-2">
                {data.low_stock_items.map((it) => (
                  <Link
                    key={it.id}
                    to={`/admin/warehouse/items/${it.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    <span className="truncate text-sm">{it.name}</span>
                    <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                      {it.quantity} шт
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5">
            <h2 className="mb-3 font-heading text-lg font-semibold">По категориям</h2>
            {data.by_category.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Нет данных</p>
            ) : (
              <div className="space-y-1.5">
                {data.by_category.map((c) => (
                  <div key={c.title} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c.title}</span>
                    <span className="font-medium">{c.units} шт · {c.positions} поз</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function cn2(positive: boolean): string {
  return positive
    ? 'text-sm font-semibold text-emerald-400'
    : 'text-sm font-semibold text-red-400';
}

export default AdminWarehouse;
