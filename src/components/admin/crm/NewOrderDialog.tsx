import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/api/crm';

interface NewOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** Предзаполнение из импорта старого заказа */
  isImport?: boolean;
}

const empty = {
  customer_name: '', customer_phone: '', customer_email: '', customer_city: '',
  title: '', total_amount: '', paid_amount: '', cost_amount: '',
  purchase_date: '', warranty_months: '36', comment: '',
};

const NewOrderDialog = ({ open, onClose, onCreated, isImport }: NewOrderDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.customer_name.trim()) {
      toast({ title: 'Укажите имя клиента', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await createOrder({
        ...form,
        total_amount: Number(form.total_amount) || 0,
        paid_amount: Number(form.paid_amount) || 0,
        cost_amount: Number(form.cost_amount) || 0,
        warranty_months: Number(form.warranty_months) || 36,
        source: isImport ? 'import' : 'manual',
        status: isImport ? 'delivered' : 'new',
      });
      toast({ title: 'Заказ создан', description: res.order_number });
      setForm({ ...empty });
      onCreated();
      onClose();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isImport ? 'Импорт старого заказа' : 'Новый заказ'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Имя клиента *</Label>
              <Input value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Телефон</Label>
              <Input value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Город</Label>
              <Input value={form.customer_city} onChange={(e) => set('customer_city', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Что заказано</Label>
            <Input placeholder="Напр. ПК RazPC Storm" value={form.title}
              onChange={(e) => set('title', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Сумма, ₽</Label>
              <Input type="number" value={form.total_amount} onChange={(e) => set('total_amount', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Оплачено, ₽</Label>
              <Input type="number" value={form.paid_amount} onChange={(e) => set('paid_amount', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Себестоим., ₽</Label>
              <Input type="number" value={form.cost_amount} onChange={(e) => set('cost_amount', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Дата покупки {isImport && '*'}</Label>
              <Input type="date" value={form.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Гарантия, мес.</Label>
              <Input type="number" value={form.warranty_months} onChange={(e) => set('warranty_months', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Комментарий</Label>
            <Textarea rows={2} value={form.comment} onChange={(e) => set('comment', e.target.value)} />
          </div>

          <Button onClick={submit} disabled={saving} className="w-full">
            <Icon name={saving ? 'Loader' : 'Check'} size={15} className={saving ? 'mr-1.5 animate-spin' : 'mr-1.5'} />
            {isImport ? 'Импортировать' : 'Создать заказ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
