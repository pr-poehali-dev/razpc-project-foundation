import { useEffect, useState } from 'react';
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

// Слайд 1 — обзор сборки
const OverviewSlide = ({ build }: { build: BuildDetail }) => {
  const cpu = build.components.find((c) => c.type === 'CPU');
  const gpu = build.components.find((c) => c.type === 'GPU');

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div className="relative order-2 lg:order-1">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
        {build.image_url && (
          <img
            src={build.image_url}
            alt={build.name}
            className="relative mx-auto max-h-[380px] w-auto rounded-2xl object-contain"
          />
        )}
      </div>

      <div className="order-1 lg:order-2">
        <span className="text-xs font-medium uppercase tracking-widest text-primary">
          Обзор сборки
        </span>
        <h3 className="mt-2 font-heading text-3xl font-bold md:text-4xl">Ключевые задачи</h3>
        <p className="mt-2 text-muted-foreground">Для чего создан {build.name}</p>

        {build.key_tasks && build.key_tasks.length > 0 && (
          <ul className="mt-6 space-y-3">
            {build.key_tasks.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon name="Check" size={16} strokeWidth={3} />
                </span>
                <span className="font-medium text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {cpu && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
              <Icon name="Cpu" size={20} className="text-primary" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Процессор</p>
                <p className="text-sm font-semibold">{cpu.name}</p>
              </div>
            </div>
          )}
          {gpu && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
              <Icon name="MonitorPlay" size={20} className="text-primary" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Видеокарта</p>
                <p className="text-sm font-semibold">{gpu.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Слайд комплектующей
const ComponentSlide = ({ component, index, total }: { component: BuildComponent; index: number; total: number }) => {
  const meta = typeMeta[component.type] ?? { icon: 'Cpu', label: component.type };
  const specs =
    component.key_specs && component.key_specs.length > 0 ? component.key_specs : [component.spec];

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      {/* Фото */}
      <div className="relative">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
        {component.image_url ? (
          <img
            src={component.image_url}
            alt={component.name}
            className="relative mx-auto max-h-[360px] w-auto rounded-2xl object-contain"
          />
        ) : (
          <div className="relative flex aspect-square items-center justify-center rounded-2xl border border-border bg-secondary/40 text-muted-foreground/40">
            <Icon name={meta.icon} size={64} />
          </div>
        )}
      </div>

      {/* Текст */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon name={meta.icon} size={20} />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {meta.label} · {index}/{total}
          </span>
        </div>

        <span className="inline-flex items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          {component.brand}
        </span>
        <h3 className="mt-3 font-heading text-3xl font-bold md:text-4xl">{component.name}</h3>
        {component.role && <p className="mt-2 text-lg font-medium text-primary">{component.role}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          {specs.map((s) => (
            <span
              key={s}
              className="rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        <Button variant="outline" className="mt-7">
          Подробнее о компоненте
          <Icon name="ArrowRight" size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export interface BuildStoryProps {
  build: BuildDetail;
  className?: string;
}

const order = ['CPU', 'GPU', 'RAM', 'SSD', 'MOTHERBOARD', 'PSU', 'CASE'];

const BuildStory = ({ build, className }: BuildStoryProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
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

  return (
    <div className={cn('relative', className)}>
      {/* Слайды */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          <div className="min-w-0 flex-[0_0_100%] px-1">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm-premium md:p-10">
              <OverviewSlide build={build} />
            </div>
          </div>
          {sorted.map((c, i) => (
            <div key={c.type} className="min-w-0 flex-[0_0_100%] px-1">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm-premium md:p-10">
                <ComponentSlide component={c} index={i + 1} total={sorted.length} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Навигация */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: slidesCount }).map((_, i) => (
            <button
              key={i}
              aria-label={`Слайд ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === selected ? 'w-7 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground/50',
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
          >
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
          >
            <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Листайте свайпом или стрелками — презентация каждого компонента
      </p>
    </div>
  );
};

export default BuildStory;
