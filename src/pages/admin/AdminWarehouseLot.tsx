import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/admin/warehouse/StatusBadge';
import { fetchLot, formatMoney, formatDate, formatDateTime, type LotDetail } from '@/api/warehouse';

const Metric = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="rounded-xl border border-border/80 bg-card p-5">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-2xl font-bold ${accent || ''}`}>{value}</p>
  </div>
);

const AdminWarehouseLot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<LotDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetchLot(Number(id))
      .then(setData)
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <EmptyState icon="Container" title="Партия не найдена" description="Возможно, она была удалена" />;

  const { lot, units, analytics } = data;

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/admin/warehouse/lots')}>
        <Icon name="ArrowLeft" size={16} className="mr-1.5" /> Назад к партиям
      </Button>

      <div className={`rounded-xl border p-5 ${lot.is_disassembly ? 'border-2 border-violet-500/40 bg-violet-500/5' : 'border-border/80 bg-card'}`}>
        <div className="flex flex-wrap items-center gap-3">
          {lot.is_disassembly && <Icon name="Cpu" size={22} className="text-violet-400" />}
          <h1 className="font-heading text-3xl font-bold">{lot.lot_number}</h1>
          {lot.is_disassembly ? (
            <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-400">Разбор ПК</span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Закупка</span>
          )}
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Поставщик</p><p className="mt-0.5 font-medium">{lot.supplier_name || lot.counterparty_name || '—'}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Дата</p><p className="mt-0.5 font-medium">{formatDate(lot.purchase_date)}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Способ закупки</p><p className="mt-0.5 font-medium">{lot.purchase_method || '—'}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Счёт</p><p className="mt-0.5 font-medium">{lot.account_name || '—'}</p></div>
          {lot.comment && <div className="sm:col-span-2 lg:col-span-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Комментарий</p><p className="mt-0.5 font-medium">{lot.comment}</p></div>}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Куплено за" value={formatMoney(analytics.purchase_cost)} />
        <Metric label="Оценка" value={formatMoney(analytics.estimate_value)} />
        <Metric label="Продано" value={formatMoney(analytics.sold_value)} accent="text-emerald-400" />
        <Metric label="Осталось (оценка)" value={formatMoney(analytics.left_estimate)} />
        <Metric label="Потенц. прибыль" value={formatMoney(analytics.potential_profit)} accent={analytics.potential_profit > 0 ? 'text-emerald-400' : ''} />
        <Metric label="Реализ. прибыль" value={formatMoney(analytics.realized_profit)} accent={analytics.realized_profit > 0 ? 'text-emerald-400' : ''} />
      </div>

      <h2 className="mt-8 font-heading text-xl font-bold">Комплектующие</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
        {units.length === 0 ? (
          <EmptyState icon="Box" title="Нет комплектующих" description="В партии пока нет экземпляров" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Модель</th>
                  <th className="px-3 py-2.5 text-left font-medium">Категория</th>
                  <th className="px-3 py-2.5 text-left font-medium">Серийный</th>
                  <th className="px-3 py-2.5 text-left font-medium">Статус</th>
                  <th className="px-3 py-2.5 text-left font-medium">Закупка</th>
                  <th className="px-3 py-2.5 text-left font-medium">Цена продажи</th>
                  <th className="px-3 py-2.5 text-left font-medium">Продажа / ПК</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                    onClick={() => navigate(`/admin/warehouse/units/${u.id}`)}>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{u.model_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{u.sku}</p>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{u.category_title || '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{u.serial_number || '—'}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={u.status} /></td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(u.purchase_cost)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{formatMoney(u.sale_price)}</td>
                    <td className="px-3 py-2.5 text-xs">
                      {u.status === 'sold' ? (
                        <div className="text-muted-foreground">
                          <span className="font-medium text-emerald-400">{formatMoney(u.sold_price || 0)}</span>
                          <p>{formatDateTime(u.sold_at)}</p>
                          {u.sold_to_name && <p>{u.sold_to_name}</p>}
                        </div>
                      ) : u.machine_number ? (
                        <span className="font-mono text-muted-foreground">{u.machine_number}</span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWarehouseLot;
