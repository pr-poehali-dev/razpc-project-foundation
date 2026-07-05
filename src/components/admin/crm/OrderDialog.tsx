import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  fetchOrder, updateOrder,
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatMoney,
  type OrderDetail, type OrderStatus,
} from '@/api/crm';

const FUNNEL: OrderStatus[] = ['new', 'approval', 'paid', 'assembly', 'ready', 'delivered'];

interface OrderDialogProps {
  orderId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

const OrderDialog = ({ orderId, onClose, onSaved }: OrderDialogProps) => {
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetchOrder(orderId)
      .then(setOrder)
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [orderId, toast]);

  const changeStatus = async (status: OrderStatus) => {
    if (!order || status === order.status) return;
    setSaving(true);
    try {
      await updateOrder({ id: order.id, status });
      const fresh = await fetchOrder(order.id);
      setOrder(fresh);
      onSaved();
      toast({ title: 'Статус обновлён', description: ORDER_STATUS_LABELS[status] });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveFields = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrder({
        id: order.id,
        title: order.title,
        total_amount: order.total_amount,
        paid_amount: order.paid_amount,
        cost_amount: order.cost_amount,
        comment: order.comment,
        purchase_date: order.purchase_date,
        warranty_months: order.warranty_months,
      });
      onSaved();
      toast({ title: 'Сохранено' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const patch = (p: Partial<OrderDetail>) => setOrder((o) => (o ? { ...o, ...p } : o));

  return (
    <Dialog open={!!orderId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {loading || !order ? (
          <div className="flex h-40 items-center justify-center">
            <Icon name="Loader" className="animate-spin text-muted-foreground" size={26} />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Заказ {order.order_number}</span>
                <span className={cn('rounded-full border px-2 py-0.5 text-xs', ORDER_STATUS_COLORS[order.status])}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </DialogTitle>
            </DialogHeader>

            {/* Воронка статусов */}
            <div className="flex flex-wrap gap-1.5">
              {FUNNEL.map((s) => (
                <button
                  key={s}
                  disabled={saving}
                  onClick={() => changeStatus(s)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                    order.status === s
                      ? ORDER_STATUS_COLORS[s]
                      : 'border-border text-muted-foreground hover:bg-secondary',
                  )}
                >
                  {ORDER_STATUS_LABELS[s]}
                </button>
              ))}
              <button
                disabled={saving}
                onClick={() => changeStatus('canceled')}
                className={cn(
                  'ml-auto rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                  order.status === 'canceled'
                    ? ORDER_STATUS_COLORS.canceled
                    : 'border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-400',
                )}
              >
                Отмена
              </button>
            </div>

            {/* Клиент */}
            <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Icon name="User" size={15} />
                {order.customer_name || 'Без клиента'}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
                {order.customer_phone && <span>{order.customer_phone}</span>}
                {order.customer_email && <span>{order.customer_email}</span>}
                {order.customer_city && <span>{order.customer_city}</span>}
              </div>
            </div>

            {/* Основные поля */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Название заказа</Label>
                <Input value={order.title || ''} onChange={(e) => patch({ title: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Сумма, ₽</Label>
                  <Input type="number" value={order.total_amount}
                    onChange={(e) => patch({ total_amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Оплачено, ₽</Label>
                  <Input type="number" value={order.paid_amount}
                    onChange={(e) => patch({ paid_amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Себестоим., ₽</Label>
                  <Input type="number" value={order.cost_amount}
                    onChange={(e) => patch({ cost_amount: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Дата покупки</Label>
                  <Input type="date" value={order.purchase_date || ''}
                    onChange={(e) => patch({ purchase_date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Гарантия, мес.</Label>
                  <Input type="number" value={order.warranty_months}
                    onChange={(e) => patch({ warranty_months: Number(e.target.value) })} />
                </div>
              </div>
              {order.warranty_until && (
                <p className="text-xs text-muted-foreground">
                  <Icon name="ShieldCheck" size={13} className="mr-1 inline" />
                  Гарантия до {order.warranty_until}
                </p>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Комментарий</Label>
                <Textarea rows={2} value={order.comment || ''}
                  onChange={(e) => patch({ comment: e.target.value })} />
              </div>
            </div>

            {/* Позиции заказа */}
            {order.items.length > 0 && (
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="mb-2 font-medium">Позиции</p>
                {order.items.map((it, i) => (
                  <div key={i} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                    <span>{it.name} × {it.qty}</span>
                    <span className="text-muted-foreground">{formatMoney(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* История статусов */}
            {order.history.length > 0 && (
              <div className="rounded-xl border border-border p-3 text-xs">
                <p className="mb-2 font-medium">История</p>
                {order.history.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 py-0.5 text-muted-foreground">
                    <Icon name="Clock" size={12} />
                    <span>{new Date(h.created_at).toLocaleString('ru-RU')}</span>
                    <span>→ {ORDER_STATUS_LABELS[h.to_status]}</span>
                    {h.comment && <span className="italic">· {h.comment}</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={saveFields} disabled={saving} className="flex-1">
                <Icon name="Save" size={15} className="mr-1.5" />
                Сохранить
              </Button>
              <Button variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
