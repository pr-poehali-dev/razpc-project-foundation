import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  createItem, updateItem,
  CONDITION_LABELS, STATUS_LABELS,
  type Refs, type Item, type Condition, type ItemStatus,
} from '@/api/warehouse';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  refs: Refs;
  item?: Item | null;
}

const empty = {
  name: '', sku: '', category_id: '', manufacturer: '', model: '',
  serial_number: '', quantity: '0', low_stock_threshold: '2',
  purchase_price: '0', sale_price: '0', condition: 'new' as Condition,
  status: 'in_stock' as ItemStatus, supplier_id: '', location_id: '',
  photo_url: '', received_at: '', notes: '',
};

const ItemFormDialog = ({ open, onClose, onSaved, refs, item }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name, sku: item.sku, category_id: String(item.category_id || ''),
        manufacturer: item.manufacturer || '', model: item.model || '',
        serial_number: item.serial_number || '', quantity: String(item.quantity),
        low_stock_threshold: String(item.low_stock_threshold),
        purchase_price: String(item.purchase_price), sale_price: String(item.sale_price),
        condition: item.condition, status: item.status,
        supplier_id: String(item.supplier_id || ''), location_id: String(item.location_id || ''),
        photo_url: item.photo_url || '', received_at: item.received_at || '',
        notes: item.notes || '',
      });
    } else {
      setForm(empty);
    }
  }, [item, open]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Введите наименование', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(), sku: form.sku.trim(),
        category_id: form.category_id, manufacturer: form.manufacturer,
        model: form.model, serial_number: form.serial_number,
        low_stock_threshold: Number(form.low_stock_threshold),
        sale_price: Number(form.sale_price), condition: form.condition,
        status: form.status, supplier_id: form.supplier_id,
        location_id: form.location_id, photo_url: form.photo_url,
        received_at: form.received_at || null, notes: form.notes,
      };
      if (isEdit) {
        await updateItem({ id: item!.id, ...payload });
      } else {
        payload.quantity = Number(form.quantity);
        payload.purchase_price = Number(form.purchase_price);
        await createItem(payload);
      }
      toast({ title: isEdit ? 'Товар обновлён' : 'Товар добавлен' });
      onSaved();
      onClose();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Наименование *</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Например, Intel Core i5-13400F" />
          </div>

          <div className="space-y-1.5">
            <Label>Категория</Label>
            <Select value={form.category_id} onValueChange={(v) => set('category_id', v)}>
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                {refs.categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>SKU (артикул)</Label>
            <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Авто, если пусто" />
          </div>

          <div className="space-y-1.5">
            <Label>Производитель</Label>
            <Input value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Модель</Label>
            <Input value={form.model} onChange={(e) => set('model', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Серийный номер</Label>
            <Input value={form.serial_number} onChange={(e) => set('serial_number', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Состояние</Label>
            <Select value={form.condition} onValueChange={(v) => set('condition', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <>
              <div className="space-y-1.5">
                <Label>Количество</Label>
                <Input type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Закупочная цена, ₽</Label>
                <Input type="number" value={form.purchase_price} onChange={(e) => set('purchase_price', e.target.value)} />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Цена продажи, ₽</Label>
            <Input type="number" value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Порог низкого остатка</Label>
            <Input type="number" value={form.low_stock_threshold} onChange={(e) => set('low_stock_threshold', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Поставщик</Label>
            <Select value={form.supplier_id} onValueChange={(v) => set('supplier_id', v)}>
              <SelectTrigger><SelectValue placeholder="Не выбран" /></SelectTrigger>
              <SelectContent>
                {refs.suppliers.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">Список пуст</div>
                )}
                {refs.suppliers.map((sp) => (
                  <SelectItem key={sp.id} value={String(sp.id)}>{sp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Место хранения</Label>
            <Select value={form.location_id} onValueChange={(v) => set('location_id', v)}>
              <SelectTrigger><SelectValue placeholder="Не выбрано" /></SelectTrigger>
              <SelectContent>
                {refs.locations.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label>Статус</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Дата поступления</Label>
            <Input type="date" value={form.received_at} onChange={(e) => set('received_at', e.target.value)} />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label>Ссылка на фото</Label>
            <Input value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} placeholder="https://..." />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label>Заметки</Label>
            <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemFormDialog;
