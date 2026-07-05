import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchOrders,
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatMoney,
  type OrderListItem, type OrderStatus,
} from '@/api/crm';
import OrderDialog from '@/components/admin/crm/OrderDialog';
import NewOrderDialog from '@/components/admin/crm/NewOrderDialog';

const FILTERS: (OrderStatus | 'all')[] = [
  'all', 'new', 'approval', 'paid', 'assembly', 'ready', 'delivered', 'canceled',
];

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchOrders(filter === 'all' ? undefined : filter, search || undefined)
      .then((d) => setOrders(d.orders))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [filter, search, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Заказы</h1>
          <p className="mt-1 text-muted-foreground">Управление заказами и воронкой продаж.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImporting(true)}>
            <Icon name="Upload" size={15} className="mr-1.5" /> Импорт
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Icon name="Plus" size={15} className="mr-1.5" /> Новый заказ
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
              filter === f
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-secondary',
            )}
          >
            {f === 'all' ? 'Все' : ORDER_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="relative mt-4 max-w-md">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Поиск: номер, клиент, телефон…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Список */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : orders.length === 0 ? (
          <EmptyState icon="ShoppingCart" title="Заказов нет"
            description="Создайте заказ вручную или дождитесь заявки с сайта." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Номер</th>
                  <th className="px-4 py-3">Клиент</th>
                  <th className="hidden px-4 py-3 md:table-cell">Что заказано</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Сумма</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setOpenId(o.id)}
                    className="cursor-pointer border-t border-border transition hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customer_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                    </td>
                    <td className="hidden max-w-[200px] truncate px-4 py-3 text-muted-foreground md:table-cell">
                      {o.title || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full border px-2 py-0.5 text-xs', ORDER_STATUS_COLORS[o.status])}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium">{formatMoney(o.total_amount)}</div>
                      {o.paid_amount < o.total_amount && (
                        <div className="text-xs text-amber-400">долг {formatMoney(o.total_amount - o.paid_amount)}</div>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                      {new Date(o.created_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDialog orderId={openId} onClose={() => setOpenId(null)} onSaved={load} />
      <NewOrderDialog open={creating} onClose={() => setCreating(false)} onCreated={load} />
      <NewOrderDialog open={importing} onClose={() => setImporting(false)} onCreated={load} isImport />
    </div>
  );
};

export default AdminOrders;
