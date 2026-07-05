import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  fetchModels, fetchRefs, saveModel, formatMoney,
  type ProductModel, type Refs,
} from '@/api/warehouse';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AdminWarehouseItems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [models, setModels] = useState<ProductModel[]>([]);
  const [refs, setRefs] = useState<Refs | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ name: '', manufacturer: '', model: '', category_id: '', default_sale_price: '0', low_stock_threshold: '2' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRefs().then(setRefs).catch(() => undefined); }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchModels(search || undefined, category !== 'all' ? category : undefined)
      .then((d) => setModels(d.models))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [search, category, toast]);

  useEffect(() => { const t = setTimeout(load, search ? 300 : 0); return () => clearTimeout(t); }, [load, search]);

  const submit = async () => {
    if (!form.name.trim()) { toast({ title: 'Введите наименование', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await saveModel({
        name: form.name.trim(), manufacturer: form.manufacturer, model: form.model,
        category_id: form.category_id, default_sale_price: Number(form.default_sale_price),
        low_stock_threshold: Number(form.low_stock_threshold),
      });
      toast({ title: 'Модель добавлена' });
      setDialog(false);
      setForm({ name: '', manufacturer: '', model: '', category_id: '', default_sale_price: '0', low_stock_threshold: '2' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Модели товаров</h1>
          <p className="mt-1 text-muted-foreground">{models.length} моделей · количество считается по экземплярам</p>
        </div>
        <Button onClick={() => setDialog(true)}>
          <Icon name="Plus" size={18} className="mr-1.5" /> Новая модель
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Поиск по названию, SKU, производителю…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Категория" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {refs?.categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          : models.length === 0 ? <EmptyState icon="PackageSearch" title="Моделей не найдено" description="Добавьте модель или примите товар" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">Модель</th>
                    <th className="px-3 py-2.5 text-left font-medium">Категория</th>
                    <th className="px-3 py-2.5 text-left font-medium">SKU</th>
                    <th className="px-3 py-2.5 text-center font-medium">На складе</th>
                    <th className="px-3 py-2.5 text-center font-medium">В сборках</th>
                    <th className="px-3 py-2.5 text-center font-medium">Продано</th>
                    <th className="px-3 py-2.5 text-left font-medium">Ср. закупка</th>
                    <th className="px-3 py-2.5 text-left font-medium">Цена продажи</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.id} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                      onClick={() => navigate(`/admin/warehouse/models/${m.id}`)}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {m.photo_url ? <img src={m.photo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                            : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground"><Icon name={m.category_icon || 'Package'} size={16} fallback="Package" /></div>}
                          <div>
                            <p className="font-medium">{m.name}</p>
                            {(m.manufacturer || m.model) && <p className="text-xs text-muted-foreground">{[m.manufacturer, m.model].filter(Boolean).join(' · ')}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{m.category_title || '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{m.sku}</td>
                      <td className="px-3 py-2.5 text-center font-semibold">{m.in_stock}</td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">{m.in_build}</td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">{m.sold}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatMoney(m.avg_cost)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{formatMoney(m.default_sale_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Новая модель товара</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Наименование *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Samsung 990 Pro 1TB" />
            </div>
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{refs?.categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Производитель</Label><Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Модель</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Цена продажи, ₽</Label><Input type="number" value={form.default_sale_price} onChange={(e) => setForm({ ...form, default_sale_price: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Порог низкого остатка</Label><Input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Отмена</Button>
            <Button onClick={submit} disabled={saving}>{saving ? 'Сохраняем…' : 'Добавить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWarehouseItems;
