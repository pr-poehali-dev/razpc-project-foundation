import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/admin/warehouse/StatusBadge';
import {
  fetchModel, formatMoney, CONDITION_LABELS,
  type ProductModel, type Unit,
} from '@/api/warehouse';

const Metric = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="rounded-xl border border-border/80 bg-card p-5">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-2xl font-bold ${accent || ''}`}>{value}</p>
  </div>
);

const AdminWarehouseModel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [model, setModel] = useState<ProductModel | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetchModel(Number(id))
      .then((d) => { setModel(d.model); setUnits(d.units); })
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!model) return <EmptyState icon="PackageSearch" title="Модель не найдена" description="Возможно, она была удалена" />;

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/admin/warehouse/items')}>
        <Icon name="ArrowLeft" size={16} className="mr-1.5" /> Назад к моделям
      </Button>

      <div className="flex flex-wrap items-center gap-4">
        {model.photo_url ? (
          <img src={model.photo_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Icon name={model.category_icon || 'Package'} size={28} fallback="Package" />
          </div>
        )}
        <div>
          <h1 className="font-heading text-3xl font-bold">{model.name}</h1>
          <p className="mt-1 text-muted-foreground">
            <span className="font-mono text-xs">{model.sku}</span>
            {model.category_title && <> · {model.category_title}</>}
            {(model.manufacturer || model.model) && <> · {[model.manufacturer, model.model].filter(Boolean).join(' ')}</>}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Metric label="На складе" value={String(model.in_stock)} accent="text-emerald-400" />
        <Metric label="В сборках" value={String(model.in_build)} accent="text-violet-400" />
        <Metric label="Продано" value={String(model.sold)} accent="text-blue-400" />
        <Metric label="Ср. закупка" value={formatMoney(model.avg_cost)} />
        <Metric label="Цена продажи" value={formatMoney(model.default_sale_price)} />
      </div>

      <h2 className="mt-8 font-heading text-xl font-bold">Экземпляры</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
        {units.length === 0 ? (
          <EmptyState icon="Box" title="Нет экземпляров" description="Примите товар, чтобы появились экземпляры" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Номер</th>
                  <th className="px-3 py-2.5 text-left font-medium">Серийный</th>
                  <th className="px-3 py-2.5 text-left font-medium">Статус</th>
                  <th className="px-3 py-2.5 text-left font-medium">Состояние</th>
                  <th className="px-3 py-2.5 text-left font-medium">Закупка</th>
                  <th className="px-3 py-2.5 text-left font-medium">Цена продажи</th>
                  <th className="px-3 py-2.5 text-left font-medium">Партия</th>
                  <th className="px-3 py-2.5 text-left font-medium">Компьютер</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                    onClick={() => navigate(`/admin/warehouse/units/${u.id}`)}>
                    <td className="px-3 py-2.5 font-mono text-xs">{u.unit_number}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{u.serial_number || '—'}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={u.status} /></td>
                    <td className="px-3 py-2.5 text-muted-foreground">{CONDITION_LABELS[u.condition] || u.condition}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(u.purchase_cost)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{formatMoney(u.sale_price)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{u.lot_number || '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{u.machine_number || '—'}</td>
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

export default AdminWarehouseModel;
