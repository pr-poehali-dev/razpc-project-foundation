import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { updateBuild, type BuildListItem, type BuildUpdate } from '@/api/catalog';
import { uploadImage } from '@/api/upload';

interface Props {
  build: BuildListItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: (patch: Partial<BuildListItem>) => void;
}

const BuildEditDialog = ({ build, open, onOpenChange, onSaved }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: build.name,
    tagline: build.tagline ?? '',
    price: String(build.price),
    old_price: build.old_price != null ? String(build.old_price) : '',
    tier: build.tier ?? '',
    performance_badge: build.performance_badge ?? '',
    warranty: build.warranty ?? '',
    image_url: build.image_url ?? '',
    status: build.status,
    is_featured: build.is_featured,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      set('image_url', url);
      toast({ title: 'Фото загружено', description: 'Не забудьте сохранить товар.' });
    } catch (err) {
      toast({ title: 'Ошибка', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const patch: BuildUpdate = {
      id: build.id,
      name: form.name,
      tagline: form.tagline || null,
      price: Number(form.price) || 0,
      old_price: form.old_price ? Number(form.old_price) : null,
      tier: form.tier || null,
      performance_badge: form.performance_badge || null,
      warranty: form.warranty,
      image_url: form.image_url || null,
      status: form.status,
      is_featured: form.is_featured,
    };
    try {
      await updateBuild(patch);
      onSaved({
        name: patch.name!,
        tagline: patch.tagline!,
        price: patch.price!,
        old_price: patch.old_price!,
        tier: patch.tier!,
        performance_badge: patch.performance_badge!,
        warranty: patch.warranty!,
        image_url: patch.image_url!,
        status: patch.status!,
        is_featured: patch.is_featured!,
      });
      toast({ title: 'Сохранено', description: 'Товар обновлён.' });
      onOpenChange(false);
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактирование товара</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Краткое описание</Label>
            <Textarea rows={2} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Цена, ₽</Label>
              <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Старая цена, ₽</Label>
              <Input
                type="number"
                value={form.old_price}
                onChange={(e) => set('old_price', e.target.value)}
                placeholder="—"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Класс (tier)</Label>
              <Input value={form.tier} onChange={(e) => set('tier', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Бейдж производительности</Label>
              <Input
                value={form.performance_badge}
                onChange={(e) => set('performance_badge', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Гарантия</Label>
            <Input value={form.warranty} onChange={(e) => set('warranty', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Фото товара</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFile}
            />
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/30">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Icon name="ImageOff" size={22} className="text-muted-foreground/40" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  <Icon name={uploading ? 'Loader' : 'Upload'} size={14} className={`mr-1.5 ${uploading ? 'animate-spin' : ''}`} />
                  {uploading ? 'Загрузка…' : 'Загрузить фото'}
                </Button>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => set('image_url', '')}
                    className="text-left text-xs text-muted-foreground hover:text-destructive"
                  >
                    Убрать фото
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="cursor-pointer">Под заказ</Label>
            <Switch
              checked={form.status === 'on_order'}
              onCheckedChange={(v) => set('status', v ? 'on_order' : 'in_stock')}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="cursor-pointer">Рекомендуемый</Label>
            <Switch
              checked={form.is_featured}
              onCheckedChange={(v) => set('is_featured', v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Icon name="Save" size={16} className="mr-1.5" />
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuildEditDialog;