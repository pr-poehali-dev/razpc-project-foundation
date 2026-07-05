import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  fetchRefs, receiveLot, createDisassembly, CONDITION_LABELS,
  type Refs,
} from '@/api/warehouse';

interface Item {
  name: string; category_id: string; manufacturer: string; qty: string;
  unit_cost: string; sale_price: string; condition: string; serials: string;
}
interface Part {
  name: string; category_id: string; serial_number: string; condition: string; sale_price: string;
}

const emptyItem = (): Item => ({ name: '', category_id: '', manufacturer: '', qty: '1', unit_cost: '0', sale_price: '0', condition: 'new', serials: '' });
const emptyPart = (): Part => ({ name: '', category_id: '', serial_number: '', condition: 'used', sale_price: '0' });

const AdminWarehouseReceive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refs, setRefs] = useState<Refs | null>(null);
  const [mode, setMode] = useState('receive');
  const [saving, setSaving] = useState(false);

  const [lot, setLot] = useState({ supplier_id: '', purchase_method: '', account_id: '', purchase_date: '', comment: '', purchase_cost: '0', location_id: '' });
  const [items, setItems] = useState<Item[]>([emptyItem()]);

  const [dis, setDis] = useState({ machine_title: '', purchase_cost: '0', account_id: '', supplier_id: '', comment: '' });
  const [parts, setParts] = useState<Part[]>([emptyPart()]);

  useEffect(() => { fetchRefs().then(setRefs).catch(() => undefined); }, []);

  const setItem = (i: number, patch: Partial<Item>) => setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const setPart = (i: number, patch: Partial<Part>) => setParts((arr) => arr.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  const submitReceive = async () => {
    if (items.length === 0) { toast({ title: 'Добавьте хотя бы одну позицию', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const res = await receiveLot({
        supplier_id: lot.supplier_id || undefined,
        purchase_method: lot.purchase_method || undefined,
        account_id: lot.account_id || undefined,
        purchase_date: lot.purchase_date || undefined,
        comment: lot.comment || undefined,
        purchase_cost: Number(lot.purchase_cost),
        location_id: lot.location_id || undefined,
        items: items.map((it) => ({
          name: it.name, category_id: it.category_id || undefined, manufacturer: it.manufacturer || undefined,
          qty: Number(it.qty), unit_cost: Number(it.unit_cost), sale_price: Number(it.sale_price),
          condition: it.condition,
          serials: it.serials.split('\n').map((s) => s.trim()).filter(Boolean),
        })),
      });
      toast({ title: 'Товар оприходован' });
      navigate(`/admin/warehouse/lots/${res.lot_id}`);
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const submitDisassembly = async () => {
    if (!dis.machine_title.trim()) { toast({ title: 'Укажите компьютер', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const res = await createDisassembly({
        machine_title: dis.machine_title, purchase_cost: Number(dis.purchase_cost),
        account_id: dis.account_id || undefined, supplier_id: dis.supplier_id || undefined,
        comment: dis.comment || undefined,
        parts: parts.map((p) => ({
          name: p.name, category_id: p.category_id || undefined, serial_number: p.serial_number || undefined,
          condition: p.condition, sale_price: Number(p.sale_price),
        })),
      });
      toast({ title: 'Партия из разбора создана' });
      navigate(`/admin/warehouse/lots/${res.lot_id}`);
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (!refs) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div>
        <h1 className="font-heading text-3xl font-bold">Приёмка товара</h1>
        <p className="mt-1 text-muted-foreground">Оприходуйте партию или создайте партию из разбора компьютера</p>
      </div>

      <Tabs value={mode} onValueChange={setMode} className="mt-6">
        <TabsList>
          <TabsTrigger value="receive">Обычная приёмка</TabsTrigger>
          <TabsTrigger value="disassembly">Компьютер на разбор</TabsTrigger>
        </TabsList>

        <TabsContent value="receive" className="mt-6 space-y-6">
          <div className="rounded-xl border border-border/80 bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Партия</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Поставщик</Label>
                <Select value={lot.supplier_id} onValueChange={(v) => setLot({ ...lot, supplier_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>{refs.suppliers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Способ закупки</Label><Input value={lot.purchase_method} onChange={(e) => setLot({ ...lot, purchase_method: e.target.value })} placeholder="Наличные / перевод…" /></div>
              <div className="space-y-1.5">
                <Label>Счёт оплаты</Label>
                <Select value={lot.account_id} onValueChange={(v) => setLot({ ...lot, account_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>{refs.accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Дата</Label><Input type="date" value={lot.purchase_date} onChange={(e) => setLot({ ...lot, purchase_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Общая закупочная стоимость, ₽</Label><Input type="number" value={lot.purchase_cost} onChange={(e) => setLot({ ...lot, purchase_cost: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Комментарий</Label><Textarea value={lot.comment} onChange={(e) => setLot({ ...lot, comment: e.target.value })} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Позиции</h2>
              <Button variant="outline" size="sm" onClick={() => setItems([...items, emptyItem()])}>
                <Icon name="Plus" size={16} className="mr-1.5" /> Добавить позицию
              </Button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="rounded-xl border border-border/80 bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Позиция {i + 1}</span>
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5 lg:col-span-2"><Label>Наименование</Label><Input value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Категория</Label>
                    <Select value={it.category_id} onValueChange={(v) => setItem(i, { category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                      <SelectContent>{refs.categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Производитель</Label><Input value={it.manufacturer} onChange={(e) => setItem(i, { manufacturer: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Количество</Label><Input type="number" value={it.qty} onChange={(e) => setItem(i, { qty: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Состояние</Label>
                    <Select value={it.condition} onValueChange={(v) => setItem(i, { condition: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Закупка за ед., ₽</Label><Input type="number" value={it.unit_cost} onChange={(e) => setItem(i, { unit_cost: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Цена продажи, ₽</Label><Input type="number" value={it.sale_price} onChange={(e) => setItem(i, { sale_price: e.target.value })} /></div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Серийные номера (по одному на строку)</Label><Textarea value={it.serials} onChange={(e) => setItem(i, { serials: e.target.value })} placeholder="SN001&#10;SN002" /></div>
                </div>
              </div>
            ))}
          </div>

          <Button disabled={saving} onClick={submitReceive}>
            <Icon name="PackageCheck" size={18} className="mr-1.5" /> Оприходовать
          </Button>
        </TabsContent>

        <TabsContent value="disassembly" className="mt-6 space-y-6">
          <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/5 p-5">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <Icon name="Cpu" size={18} /> Выкупленный компьютер
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5 lg:col-span-2"><Label>Компьютер (название)</Label><Input value={dis.machine_title} onChange={(e) => setDis({ ...dis, machine_title: e.target.value })} placeholder="ПК на i5-10400 / RTX 3060" /></div>
              <div className="space-y-1.5"><Label>Стоимость выкупа, ₽</Label><Input type="number" value={dis.purchase_cost} onChange={(e) => setDis({ ...dis, purchase_cost: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Счёт оплаты</Label>
                <Select value={dis.account_id} onValueChange={(v) => setDis({ ...dis, account_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>{refs.accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Поставщик</Label>
                <Select value={dis.supplier_id} onValueChange={(v) => setDis({ ...dis, supplier_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>{refs.suppliers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Комментарий</Label><Textarea value={dis.comment} onChange={(e) => setDis({ ...dis, comment: e.target.value })} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Комплектующие</h2>
              <Button variant="outline" size="sm" onClick={() => setParts([...parts, emptyPart()])}>
                <Icon name="Plus" size={16} className="mr-1.5" /> Добавить
              </Button>
            </div>
            {parts.map((p, i) => (
              <div key={i} className="rounded-xl border border-border/80 bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Комплектующая {i + 1}</span>
                  {parts.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setParts(parts.filter((_, idx) => idx !== i))}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5 lg:col-span-2"><Label>Наименование</Label><Input value={p.name} onChange={(e) => setPart(i, { name: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Категория</Label>
                    <Select value={p.category_id} onValueChange={(v) => setPart(i, { category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                      <SelectContent>{refs.categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Серийный номер</Label><Input value={p.serial_number} onChange={(e) => setPart(i, { serial_number: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Состояние</Label>
                    <Select value={p.condition} onValueChange={(v) => setPart(i, { condition: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Оценочная цена продажи, ₽</Label><Input type="number" value={p.sale_price} onChange={(e) => setPart(i, { sale_price: e.target.value })} /></div>
                </div>
              </div>
            ))}
          </div>

          <Button disabled={saving} onClick={submitDisassembly}>
            <Icon name="Cpu" size={18} className="mr-1.5" /> Создать партию из разбора
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminWarehouseReceive;
