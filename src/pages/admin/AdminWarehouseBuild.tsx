import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  fetchRefs, fetchUnits, buildMachine, CONDITION_LABELS,
  type Refs, type Unit,
} from '@/api/warehouse';

interface Part {
  source: 'stock' | 'custom';
  unit_id: string;
  name: string; category_id: string; serial_number: string; condition: string; unit_cost: string; sale_price: string;
}

const emptyPart = (): Part => ({ source: 'stock', unit_id: '', name: '', category_id: '', serial_number: '', condition: 'new', unit_cost: '0', sale_price: '0' });

const AdminWarehouseBuild = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refs, setRefs] = useState<Refs | null>(null);
  const [stock, setStock] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', serial_number: '', labor_cost: '0', sale_price: '0', comment: '' });
  const [parts, setParts] = useState<Part[]>([emptyPart()]);

  useEffect(() => {
    Promise.all([fetchRefs(), fetchUnits({ status: 'in_stock' })])
      .then(([r, u]) => { setRefs(r); setStock(u.units); })
      .catch((e) => toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const setPart = (i: number, patch: Partial<Part>) => setParts((arr) => arr.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  const submit = async () => {
    if (!form.name.trim()) { toast({ title: 'Укажите название', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const res = await buildMachine({
        name: form.name.trim(), serial_number: form.serial_number || undefined,
        labor_cost: Number(form.labor_cost), sale_price: Number(form.sale_price),
        comment: form.comment || undefined,
        parts: parts.map((p) => p.source === 'stock'
          ? { source: 'stock', unit_id: p.unit_id }
          : {
              source: 'custom', name: p.name, category_id: p.category_id || undefined,
              serial_number: p.serial_number || undefined, condition: p.condition,
              unit_cost: Number(p.unit_cost), sale_price: Number(p.sale_price),
            }),
      });
      toast({ title: 'Компьютер собран' });
      navigate(`/admin/warehouse/machines/${res.machine_id}`);
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading || !refs) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div>
        <h1 className="font-heading text-3xl font-bold">Сборка компьютера</h1>
        <p className="mt-1 text-muted-foreground">Соберите ПК из складских экземпляров или добавьте внешние комплектующие</p>
      </div>

      <div className="mt-6 rounded-xl border border-border/80 bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Параметры</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 lg:col-span-2"><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Игровой ПК RTX 4070" /></div>
          <div className="space-y-1.5"><Label>Серийный номер</Label><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Стоимость работ, ₽</Label><Input type="number" value={form.labor_cost} onChange={(e) => setForm({ ...form, labor_cost: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Цена продажи, ₽</Label><Input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Комментарий</Label><Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Комплектующие</h2>
          <Button variant="outline" size="sm" onClick={() => setParts([...parts, emptyPart()])}>
            <Icon name="Plus" size={16} className="mr-1.5" /> Добавить
          </Button>
        </div>
        {parts.map((p, i) => (
          <div key={i} className="rounded-xl border border-border/80 bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="w-56">
                <Select value={p.source} onValueChange={(v) => setPart(i, { source: v as Part['source'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Со склада</SelectItem>
                    <SelectItem value="custom">Внешняя (вручную)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {parts.length > 1 && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setParts(parts.filter((_, idx) => idx !== i))}>
                  <Icon name="Trash2" size={16} />
                </Button>
              )}
            </div>

            {p.source === 'stock' ? (
              <div className="space-y-1.5">
                <Label>Экземпляр со склада</Label>
                <Select value={p.unit_id} onValueChange={(v) => setPart(i, { unit_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите экземпляр" /></SelectTrigger>
                  <SelectContent>
                    {stock.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.model_name} · {u.unit_number}{u.serial_number ? ` · ${u.serial_number}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
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
                <div className="space-y-1.5"><Label>Себестоимость, ₽</Label><Input type="number" value={p.unit_cost} onChange={(e) => setPart(i, { unit_cost: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Цена продажи, ₽</Label><Input type="number" value={p.sale_price} onChange={(e) => setPart(i, { sale_price: e.target.value })} /></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button className="mt-6" disabled={saving} onClick={submit}>
        <Icon name="Wrench" size={18} className="mr-1.5" /> Собрать
      </Button>
    </div>
  );
};

export default AdminWarehouseBuild;
