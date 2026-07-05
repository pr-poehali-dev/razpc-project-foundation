import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type BuildDetail, type BuildComponent } from '@/api/catalog';

const typeMeta: Record<string, { icon: string; label: string }> = {
  CPU: { icon: 'Cpu', label: 'Процессор' },
  GPU: { icon: 'MonitorPlay', label: 'Видеокарта' },
  RAM: { icon: 'MemoryStick', label: 'Оперативная память' },
  SSD: { icon: 'HardDrive', label: 'Накопитель' },
  MOTHERBOARD: { icon: 'CircuitBoard', label: 'Материнская плата' },
  PSU: { icon: 'Plug', label: 'Блок питания' },
  CASE: { icon: 'Box', label: 'Корпус' },
};

const order = ['CPU', 'GPU', 'RAM', 'SSD', 'MOTHERBOARD', 'PSU', 'CASE'];

// ── Полноэкранный слайд-обзор ──
const OverviewSlide = ({ build }: { build: BuildDetail }) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
    {build.image_url && (
      <img
        src={build.image_url}
        alt={build.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

    <div className="container-page relative flex h-full flex-col justify-center py-16">
      <div className="max-w-2xl">
        <span className="text-sm font-medium uppercase tracking-widest text-primary">
          Обзор сборки
        </span>
        <h3 className="mt-3 font-heading text-4xl font-bold leading-tight md:text-6xl">
          Ключевые задачи
        </h3>
        <p className="mt-3 text-lg text-muted-foreground">Для чего создан {build.name}</p>

        {build.key_tasks && build.key_tasks.length > 0 && (
          <ul className="mt-8 space-y-4">
            {build.key_tasks.map((t) => (
              <li key={t} className="flex items-center gap-3 text-lg">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon name="Check" size={18} strokeWidth={3} />
                </span>
                <span className="font-medium text-foreground">{t}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

// ── Полноэкранный слайд комплектующей ──
const ComponentSlide = ({
  component,
  index,
  total,
}: {
  component: BuildComponent;
  index: number;
  total: number;
}) => {
  const meta = typeMeta[component.type] ?? { icon: 'Cpu', label: component.type };
  const specs =
    component.key_specs && component.key_specs.length > 0 ? component.key_specs : [component.spec];

  return (
    <div className="relative flex h-full w-full items-center overflow-hidden">
      {/* Фоновое свечение */}
      <div className="pointer-events-none absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/4 rounded-full bg-primary/10 blur-[130px]" />

      <div className="container-page relative grid h-full items-center gap-8 py-14 lg:grid-cols-2">
        {/* Текст */}
        <div className="order-2 lg:order-1">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon name={meta.icon} size={22} />
            </span>
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {meta.label} · {index}/{total}
            </span>
          </div>

          <span className="inline-flex items-center rounded-md bg-primary/15 px-3 py-1 text-sm font-bold uppercase tracking-wider text-primary">
            {component.brand}
          </span>
          <h3 className="mt-4 font-heading text-4xl font-bold leading-tight md:text-6xl">
            {component.name}
          </h3>
          {component.role && (
            <p className="mt-3 text-xl font-medium text-primary">{component.role}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {specs.map((s) => (
              <span
                key={s}
                className="rounded-xl border border-border/60 bg-card/70 px-5 py-3 text-base font-semibold text-foreground backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </div>

          <Button variant="outline" size="lg" className="mt-9">
            Подробнее о компоненте
            <Icon name="ArrowRight" size={18} className="ml-1" />
          </Button>
        </div>

        {/* Фото */}
        <div className="relative order-1 flex items-center justify-center lg:order-2">
          {component.image_url ? (
            <img
              src={component.image_url}
              alt={component.name}
              className="relative max-h-[60vh] w-auto object-contain drop-shadow-2xl"
            />
          ) : (
            <div className="flex aspect-square w-full max-w-md items-center justify-center rounded-3xl border border-border bg-secondary/40 text-muted-foreground/40">
              <Icon name={meta.icon} size={96} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface BuildStoryProps {
  build: BuildDetail;
  className?: string;
}

const BuildStory = ({ build, className }: BuildStoryProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const sorted = [...build.components].sort(
    (a, b) => order.indexOf(a.type) - order.indexOf(b.type),
  );
  const slidesCount = sorted.length + 1;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Навигация клавиатурой
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') emblaApi?.scrollNext();
      if (e.key === 'ArrowLeft') emblaApi?.scrollPrev();
    },
    [emblaApi],
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border/80 bg-card outline-none',
        className,
      )}
      tabIndex={0}
      onKeyDown={handleKey}
    >
      {/* Слайды на весь экран блока */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          <div className="h-[80vh] min-h-[560px] min-w-0 flex-[0_0_100%]">
            <OverviewSlide build={build} />
          </div>
          {sorted.map((c, i) => (
            <div key={c.type} className="h-[80vh] min-h-[560px] min-w-0 flex-[0_0_100%]">
              <ComponentSlide component={c} index={i + 1} total={sorted.length} />
            </div>
          ))}
        </div>
      </div>

      {/* Стрелки поверх слайда */}
      <button
        aria-label="Предыдущий слайд"
        disabled={!canPrev}
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-sm transition-all hover:bg-background disabled:pointer-events-none disabled:opacity-0"
      >
        <Icon name="ChevronLeft" size={22} />
      </button>
      <button
        aria-label="Следующий слайд"
        disabled={!canNext}
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-sm transition-all hover:bg-background disabled:pointer-events-none disabled:opacity-0"
      >
        <Icon name="ChevronRight" size={22} />
      </button>

      {/* Полоски-индикаторы снизу */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {Array.from({ length: slidesCount }).map((_, i) => (
          <button
            key={i}
            aria-label={`Слайд ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === selected ? 'w-8 bg-primary' : 'w-4 bg-foreground/25 hover:bg-foreground/50',
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BuildStory;
