import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchItem, fetchRefs, formatMoney, formatDate, formatDateTime,
  CONDITION_LABELS, OPERATION_LABELS, OPERATION_ICONS,
  type ItemDetail, type Refs, type Operation, type Item,
} from '@/api/warehouse';
import StatusBadge from '@/components/admin/warehouse/StatusBadge';
import ItemFormDialog from '@/components/admin/warehouse/ItemFormDialog';
import OperationDialog from '@/components/admin/warehouse/OperationDialog';

const QUICK_OPS: Operation[] = ['income', 'reserve', 'build', 'transfer', 'return', 'write_off', 'correction'];

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right">{value ?? '—'}</span>
  </div>
);

const AdminWarehouseItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [data, setData] = useState<ItemDetail | null>(null);
  const [refs, setRefs] = useState<Refs | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [operation, setOperation] = useState<Operation | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    fetchItem(Number(id))
      .then(setData)
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchRefs().then(setRefs).catch(() => undefined); }, []);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;
  }
  if (!data) return null;

  const it = data.item;
  const totalPurchase = it.avg_purchase_price * it.quantity;
  const totalSale = it.sale_price * it.quantity;

  return (
    <div>
      <button onClick={() => navigate('/admin/warehouse/items')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <Icon name="ArrowLeft" size={16} /> К списку товаров
      </button>

      {/* Шапка */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {it.photo_url ? (
            <img src={it.photo_url} alt="" className="h-20 w-20 rounded-xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Icon name={it.category_icon || 'Package'} size={32} fallback="Package" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">{it.name}</h1>
              <StatusBadge status={it.status} />
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{it.sku}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[it.category_title, it.manufacturer, it.model].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Icon name="Pencil" size={16} className="mr-1.5" /> Редактировать
        </Button>
      </div>

      {/* Быстрые действия */}
      <div className="mt-5 flex flex-wrap gap-2">
        {QUICK_OPS.map((op) => (
          <Button key={op} variant="secondary" size="sm" onClick={() => setOperation(op)}>
            <Icon name={OPERATION_ICONS[op]} size={15} className="mr-1.5" />
            {OPERATION_LABELS[op]}
          </Button>
        ))}
      </div>

      {/* Ключевые метрики */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Остаток</p>
          <p className="mt-1 font-heading text-2xl font-bold">{it.quantity} шт</p>
          {it.reserved_qty > 0 && <p className="text-xs text-amber-400">В резерве: {it.reserved_qty}</p>}
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Цена продажи</p>
          <p className="mt-1 font-heading text-2xl font-bold">{formatMoney(it.sale_price)}</p>
          <p className="text-xs text-muted-foreground">Закупка: {formatMoney(it.avg_purchase_price)}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Маржа / прибыль</p>
          <p className={cn('mt-1 font-heading text-2xl font-bold', it.margin_pct >= 20 ? 'text-emerald-400' : it.margin_pct > 0 ? 'text-amber-400' : '')}>
            {it.margin_pct}%
          </p>
          <p className="text-xs text-muted-foreground">{formatMoney(it.unit_profit)} за шт</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Стоимость остатка</p>
          <p className="mt-1 font-heading text-2xl font-bold">{formatMoney(totalSale)}</p>
          <p className="text-xs text-muted-foreground">По закупке: {formatMoney(totalPurchase)}</p>
        </div>
      </div>

      {/* Вкладки */}
      <Tabs defaultValue="info" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="movements">Движения ({data.movements.length})</TabsTrigger>
          <TabsTrigger value="prices">Цены ({data.price_history.length})</TabsTrigger>
          <TabsTrigger value="audits">Инвентаризации ({data.audits.length})</TabsTrigger>
          <TabsTrigger value="builds">Сборки ({data.builds.length})</TabsTrigger>
        </TabsList>

        {/* Информация */}
        <TabsContent value="info">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-card p-5">
              <h3 className="mb-3 font-heading font-semibold">Основное</h3>
              <InfoRow label="Категория" value={it.category_title} />
              <InfoRow label="Производитель" value={it.manufacturer} />
              <InfoRow label="Модель" value={it.model} />
              <InfoRow label="Серийный номер" value={it.serial_number} />
              <InfoRow label="Состояние" value={CONDITION_LABELS[it.condition]} />
              <InfoRow label="Место хранения" value={it.location_title} />
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-5">
              <h3 className="mb-3 font-heading font-semibold">Закупка и склад</h3>
              <InfoRow label="Поставщик" value={it.supplier_name} />
              <InfoRow label="Ср. закупочная" value={formatMoney(it.avg_purchase_price)} />
              <InfoRow label="Последняя закупка" value={formatMoney(it.last_purchase_price)} />
              <InfoRow label="Порог низкого остатка" value={`${it.low_stock_threshold} шт`} />
              <InfoRow label="Дата поступления" value={formatDate(it.received_at)} />
              <InfoRow label="Добавил" value={it.created_by_name} />
            </div>
            {it.notes && (
              <div className="rounded-xl border border-border/80 bg-card p-5 lg:col-span-2">
                <h3 className="mb-2 font-heading font-semibold">Заметки</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{it.notes}</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Движения */}
        <TabsContent value="movements">
          <div className="rounded-xl border border-border/80 bg-card p-5">
            {data.movements.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Движений пока нет</p>
            ) : (
              <div className="space-y-1">
                {data.movements.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon name={OPERATION_ICONS[m.operation] || 'Circle'} size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{OPERATION_LABELS[m.operation]}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.user_name || 'Система'}
                        {m.comment ? ` · ${m.comment}` : ''}
                        {m.from_location || m.to_location ? ` · ${m.from_location || '?'} → ${m.to_location || '?'}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      {m.qty_change !== 0 && (
                        <p className={cn('text-sm font-semibold', m.qty_change > 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {m.qty_change > 0 ? '+' : ''}{m.qty_change} → {m.qty_after}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Цены */}
        <TabsContent value="prices">
          <div className="rounded-xl border border-border/80 bg-card p-5">
            {data.price_history.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Изменений цен пока нет</p>
            ) : (
              <div className="space-y-1">
                {data.price_history.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium">{p.price_type === 'sale' ? 'Цена продажи' : 'Закупочная цена'}</p>
                      <p className="text-xs text-muted-foreground">{p.user_name || 'Система'} · {formatDateTime(p.created_at)}</p>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground line-through">{formatMoney(p.old_price || 0)}</span>
                      {' → '}
                      <span className="font-semibold">{formatMoney(p.new_price || 0)}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Инвентаризации */}
        <TabsContent value="audits">
          <div className="rounded-xl border border-border/80 bg-card p-5">
            {data.audits.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Товар ещё не участвовал в инвентаризациях</p>
            ) : (
              <div className="space-y-1">
                {data.audits.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium">{a.audit_title}</p>
                      <p className="text-xs text-muted-foreground">{a.checked_by_name || '—'} · {formatDateTime(a.checked_at)}</p>
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-muted-foreground">{a.expected_qty} → {a.actual_qty}</span>
                      {a.discrepancy !== 0 && a.discrepancy !== null && (
                        <span className={cn('ml-2 font-semibold', a.discrepancy > 0 ? 'text-emerald-400' : 'text-red-400')}>
                          ({a.discrepancy > 0 ? '+' : ''}{a.discrepancy})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Сборки */}
        <TabsContent value="builds">
          <div className="rounded-xl border border-border/80 bg-card p-5">
            {data.builds.length === 0 ? (
              <div className="py-8 text-center">
                <Icon name="Wrench" size={28} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Компонент пока не используется в сборках</p>
                <p className="mt-1 text-xs text-muted-foreground">Связь появится после интеграции с модулем сборок</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.builds.map((bid) => (
                  <Link key={bid} to={`/admin/catalog`} className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm hover:border-primary/40">
                    Сборка #{bid}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {refs && (
        <>
          <ItemFormDialog open={editOpen} onClose={() => setEditOpen(false)} onSaved={load} refs={refs} item={it as Item} />
          <OperationDialog
            open={!!operation}
            onClose={() => setOperation(null)}
            onDone={load}
            operation={operation}
            item={it as Item}
            refs={refs}
          />
        </>
      )}
    </div>
  );
};

export default AdminWarehouseItem;
