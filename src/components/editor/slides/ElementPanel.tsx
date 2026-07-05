import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/api/upload';
import type { SlideElement, SlideTextStyle, SlideAnim } from '@/api/slides';
import { DEFAULT_ANIM } from '@/api/slides';
import { FONT_SIZES, FONTS, WEIGHTS, ALIGNS, COLORS, ANIM_OPTIONS } from './slideConstants';

interface ElementPanelProps {
  element: SlideElement;
  onChange: (patch: Partial<SlideElement>) => void;
  onDelete: () => void;
}

const ElementPanel = ({ element, onChange, onDelete }: ElementPanelProps) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const style = element.style ?? {};
  const anim: SlideAnim = element.anim ?? DEFAULT_ANIM;

  const setStyle = (patch: Partial<SlideTextStyle>) =>
    onChange({ style: { ...style, ...patch } });

  const setAnim = (patch: Partial<SlideAnim>) =>
    onChange({ anim: { ...anim, ...patch } });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange({ value: url });
      toast({ title: 'Фото загружено' });
    } catch (err) {
      toast({ title: 'Ошибка', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon name={element.type === 'text' ? 'Type' : 'Image'} size={16} />
          {element.type === 'text' ? 'Текстовый блок' : 'Изображение'}
        </span>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Icon name="Trash2" size={14} className="mr-1" />
          Удалить
        </Button>
      </div>

      {element.type === 'text' ? (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">Текст</Label>
            <Textarea
              rows={2}
              value={element.value}
              onChange={(e) => onChange({ value: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Размер</Label>
            <div className="flex flex-wrap gap-1">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle({ size: s.value })}
                  className={cn(
                    'rounded border px-2 py-1 text-xs',
                    style.size === s.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Шрифт</Label>
            <div className="flex flex-wrap gap-1">
              {FONTS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStyle({ font: f.value })}
                  className={cn(
                    'rounded border px-2 py-1 text-xs',
                    (style.font ?? '') === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Начертание</Label>
            <div className="flex flex-wrap gap-1">
              {WEIGHTS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setStyle({ weight: w.value })}
                  className={cn(
                    'rounded border px-2 py-1 text-xs',
                    style.weight === w.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Выравнивание</Label>
            <div className="flex gap-1">
              {ALIGNS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setStyle({ align: a.value })}
                  className={cn(
                    'inline-flex rounded border p-1.5',
                    style.align === a.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                  )}
                >
                  <Icon name={a.icon} size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Цвет</Label>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setStyle({ color: c.value })}
                  className={cn(
                    'h-7 w-7 rounded-full border-2',
                    style.color === c.value ? 'border-primary' : 'border-border',
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Icon name={uploading ? 'Loader' : 'Upload'} size={15} className={cn('mr-1.5', uploading && 'animate-spin')} />
            {uploading ? 'Загрузка…' : element.value ? 'Заменить фото' : 'Загрузить фото'}
          </Button>
        </div>
      )}

      {/* Ширина элемента */}
      <div className="space-y-1.5">
        <Label className="text-xs">Ширина: {Math.round(element.w)}%</Label>
        <input
          type="range"
          min={10}
          max={100}
          value={element.w}
          onChange={(e) => onChange({ w: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      {/* Анимация появления */}
      <div className="space-y-2 border-t border-border pt-3">
        <Label className="flex items-center gap-1.5 text-xs">
          <Icon name="Sparkles" size={13} />
          Анимация появления
        </Label>
        <div className="grid grid-cols-2 gap-1">
          {ANIM_OPTIONS.map((a) => (
            <button
              key={a.value}
              onClick={() => setAnim({ type: a.value })}
              className={cn(
                'inline-flex items-center gap-1.5 rounded border px-2 py-1.5 text-xs',
                anim.type === a.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
              )}
            >
              <Icon name={a.icon} size={13} />
              {a.label}
            </button>
          ))}
        </div>

        {anim.type !== 'none' && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Задержка старта: {anim.delay.toFixed(1)} с</Label>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={anim.delay}
                onChange={(e) => setAnim({ delay: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Длительность: {anim.duration.toFixed(1)} с</Label>
              <input
                type="range"
                min={0.2}
                max={2.5}
                step={0.1}
                value={anim.duration}
                onChange={(e) => setAnim({ duration: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ElementPanel;