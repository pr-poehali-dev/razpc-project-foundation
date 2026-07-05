import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useContentEditor } from '@/context/ContentContext';
import { useToast } from '@/hooks/use-toast';
import {
  fetchSlides,
  saveSlides,
  makeId,
  type Slide,
  type SlideElement,
} from '@/api/slides';
import { DEFAULT_TEXT_STYLE, emptySlide, COLORS } from './slideConstants';
import SlideCanvas from './SlideCanvas';
import ElementPanel from './ElementPanel';

interface SlideEditorProps {
  buildId: number;
}

const SlideEditor = ({ buildId }: SlideEditorProps) => {
  const { editMode, canEdit } = useContentEditor();
  const { toast } = useToast();
  const editable = editMode && canEdit;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchSlides(buildId)
      .then(setSlides)
      .finally(() => setLoading(false));
  }, [buildId]);

  const slide = slides[current];
  const selected = slide?.elements.find((e) => e.id === selectedId) ?? null;

  const updateSlide = (patch: Slide) => {
    setSlides((prev) => prev.map((s, i) => (i === current ? patch : s)));
    setDirty(true);
  };

  const updateSelected = (patch: Partial<SlideElement>) => {
    if (!slide || !selectedId) return;
    updateSlide({
      ...slide,
      elements: slide.elements.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)),
    });
  };

  const deleteSelected = () => {
    if (!slide || !selectedId) return;
    updateSlide({ ...slide, elements: slide.elements.filter((el) => el.id !== selectedId) });
    setSelectedId(null);
  };

  const addText = () => {
    if (!slide) return;
    const el: SlideElement = {
      id: makeId(),
      type: 'text',
      x: 10,
      y: 20,
      w: 50,
      value: 'Текст',
      style: { ...DEFAULT_TEXT_STYLE, size: 'text-2xl' },
    };
    updateSlide({ ...slide, elements: [...slide.elements, el] });
    setSelectedId(el.id);
  };

  const addImage = () => {
    if (!slide) return;
    const el: SlideElement = {
      id: makeId(),
      type: 'image',
      x: 10,
      y: 20,
      w: 40,
      value: '',
    };
    updateSlide({ ...slide, elements: [...slide.elements, el] });
    setSelectedId(el.id);
  };

  const addSlide = () => {
    const s = emptySlide();
    const next = [...slides, s];
    setSlides(next);
    setCurrent(next.length - 1);
    setSelectedId(null);
    setDirty(true);
  };

  const deleteSlide = () => {
    if (slides.length === 0) return;
    const next = slides.filter((_, i) => i !== current);
    setSlides(next);
    setCurrent((c) => Math.max(0, Math.min(c, next.length - 1)));
    setSelectedId(null);
    setDirty(true);
  };

  const setBg = (patch: Partial<Slide>) => {
    if (!slide) return;
    updateSlide({ ...slide, ...patch });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSlides(buildId, slides);
      setDirty(false);
      toast({ title: 'Сохранено', description: 'Презентация опубликована.' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-border bg-card">
        <Icon name="Loader" size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Пусто и не-редактор — ничего не показываем
  if (slides.length === 0 && !editable) return null;

  // Пусто, но админ в режиме редактирования — предложить создать
  if (slides.length === 0 && editable) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card py-16 text-center">
        <Icon name="GalleryHorizontalEnd" size={40} className="text-muted-foreground/50" />
        <div>
          <p className="font-heading text-lg font-semibold">Презентация пуста</p>
          <p className="text-sm text-muted-foreground">Создайте первый слайд и наполните его текстом и фото.</p>
        </div>
        <Button onClick={addSlide}>
          <Icon name="Plus" size={16} className="mr-1.5" />
          Создать слайд
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-4', editable && selected ? 'lg:grid-cols-[1fr_320px]' : 'grid-cols-1')}>
        {/* Слайд */}
        <div>
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-card">
            {slide && (
              <SlideCanvas
                slide={slide}
                editable={editable}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={updateSlide}
              />
            )}

            {/* Стрелки навигации */}
            {slides.length > 1 && (
              <>
                <button
                  disabled={current === 0}
                  onClick={() => { setCurrent((c) => c - 1); setSelectedId(null); }}
                  className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition hover:bg-background disabled:opacity-0"
                >
                  <Icon name="ChevronLeft" size={20} />
                </button>
                <button
                  disabled={current === slides.length - 1}
                  onClick={() => { setCurrent((c) => c + 1); setSelectedId(null); }}
                  className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition hover:bg-background disabled:opacity-0"
                >
                  <Icon name="ChevronRight" size={20} />
                </button>
              </>
            )}

            {/* Индикаторы */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setCurrent(i); setSelectedId(null); }}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === current ? 'w-8 bg-primary' : 'w-4 bg-foreground/25 hover:bg-foreground/50',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Тулбар редактора */}
          {editable && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
              <span className="ml-1 text-xs font-medium text-muted-foreground">
                Слайд {current + 1} / {slides.length}
              </span>
              <div className="mx-1 h-5 w-px bg-border" />
              <Button size="sm" variant="outline" onClick={addText}>
                <Icon name="Type" size={14} className="mr-1" /> Текст
              </Button>
              <Button size="sm" variant="outline" onClick={addImage}>
                <Icon name="Image" size={14} className="mr-1" /> Фото
              </Button>

              {/* Фон слайда */}
              <div className="mx-1 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Фон:</span>
                {COLORS.slice(0, 4).map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => setBg({ bgColor: c.value, bgImage: '' })}
                    className={cn(
                      'h-6 w-6 rounded-full border-2',
                      slide?.bgColor === c.value && !slide?.bgImage ? 'border-primary' : 'border-border',
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              <div className="mx-1 h-5 w-px bg-border" />
              <Button size="sm" variant="outline" onClick={addSlide}>
                <Icon name="Plus" size={14} className="mr-1" /> Слайд
              </Button>
              <Button size="sm" variant="ghost" onClick={deleteSlide} className="text-destructive hover:text-destructive">
                <Icon name="Trash2" size={14} className="mr-1" /> Удалить слайд
              </Button>

              <div className="ml-auto">
                <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
                  <Icon name="Save" size={14} className="mr-1" />
                  {saving ? 'Сохраняем…' : dirty ? 'Сохранить' : 'Сохранено'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Панель выбранного элемента */}
        {editable && selected && (
          <ElementPanel
            element={selected}
            onChange={updateSelected}
            onDelete={deleteSelected}
          />
        )}
      </div>

      {editable && !selected && (
        <p className="text-center text-xs text-muted-foreground">
          Нажмите на текст или фото, чтобы настроить. Перетаскивайте элементы мышью.
        </p>
      )}
    </div>
  );
};

export default SlideEditor;
