import { useState, useEffect } from 'react';
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
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  doOperation, OPERATION_LABELS, OPERATION_ICONS,
  type Item, type Refs, type Operation,
} from '@/api/warehouse';

interface Props {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  operation: Operation | null;
  item: Item | null;
  refs: Refs;
}

const OperationDialog = ({ open, onClose, onDone, operation, item, refs }: Props) => {
  const { toast } = useToast();
  const [qty, setQty] = useState('1');
  const [newQty, setNewQty] = useState('0');
  const [unitPrice, setUnitPrice] = useState('0');
  const [toLocation, setToLocation] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setQty('1');
      setNewQty(String(item.quantity));
      setUnitPrice(String(item.purchase_price || 0));
      setToLocation('');
      setSupplierId(String(item.supplier_id || ''));
      setComment('');
    }
  }, [item, operation, open]);

  if (!operation || !item) return null;

  const submit = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        operation, item_id: item.id, comment,
      };
      if (operation === 'correction') {
        payload.new_qty = Number(newQty);
      } else {
        payload.qty = Number(qty);
      }
      if (operation === 'income') {
        payload.unit_price = Number(unitPrice);
        if (supplierId) payload.supplier_id = supplierId;
      }
      if (operation === 'transfer') payload.to_location_id = toLocation;
      await doOperation(payload);
      toast({ title: `${OPERATION_LABELS[operation]} — выполнено` });
      onDone();
      onClose();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const free = item.quantity - item.reserved_qty;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name={OPERATION_ICONS[operation]} size={20} className="text-primary" />
            {OPERATION_LABELS[operation]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-secondary/60 px-3 py-2 text-sm">
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.sku} · Остаток: {item.quantity} шт · Свободно: {free} шт
            </p>
          </div>

          {operation === 'correction' ? (
            <div className="space-y-1.5">
              <Label>Фактический остаток</Label>
              <Input type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Количество</Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          )}

          {operation === 'income' && (
            <>
              <div className="space-y-1.5">
                <Label>Цена закупки за единицу, ₽</Label>
                <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Поставщик</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder="Не выбран" /></SelectTrigger>
                  <SelectContent>
                    {refs.suppliers.map((sp) => (
                      <SelectItem key={sp.id} value={String(sp.id)}>{sp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {operation === 'transfer' && (
            <div className="space-y-1.5">
              <Label>Переместить в</Label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger><SelectValue placeholder="Выберите место" /></SelectTrigger>
                <SelectContent>
                  {refs.locations.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Комментарий</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Необязательно" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Выполняем…' : 'Подтвердить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OperationDialog;
