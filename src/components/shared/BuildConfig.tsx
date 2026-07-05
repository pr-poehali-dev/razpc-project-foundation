import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type BuildComponent } from '@/api/catalog';

const typeMeta: Record<string, { icon: string; label: string }> = {
  CPU: { icon: 'Cpu', label: 'Процессор' },
  GPU: { icon: 'MonitorPlay', label: 'Видеокарта' },
  RAM: { icon: 'MemoryStick', label: 'Оперативная память' },
  SSD: { icon: 'HardDrive', label: 'Накопитель' },
  MOTHERBOARD: { icon: 'CircuitBoard', label: 'Материнская плата' },
  PSU: { icon: 'Plug', label: 'Блок питания' },
  CASE: { icon: 'Box', label: 'Корпус' },
};

type Level = 'hero' | 'support' | 'infra';

interface CardProps {
  component: BuildComponent;
  level: Level;
}

const ComponentCard = ({ component, level }: CardProps) => {
  const meta = typeMeta[component.type] ?? { icon: 'Cpu', label: component.type };
  const specs =
    component.key_specs && component.key_specs.length > 0 ? component.key_specs : [component.spec];

  // ── HERO (CPU / GPU) ──
  if (level === 'hero') {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-7 shadow-sm-premium transition-all duration-300 hover:border-primary/50 hover:shadow-lg-premium sm:p-8">
        {/* фирменное свечение */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex items-center justify-between">
          <span className="inline-flex items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {component.brand}
          </span>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon name={meta.icon} size={34} />
          </div>
        </div>

        <div className="relative mt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {meta.label}
          </p>
          <h3 className="mt-1 font-heading text-3xl font-bold leading-tight text-foreground">
            {component.name}
          </h3>
          {component.role && (
            <p className="mt-2 text-base font-medium text-primary">{component.role}</p>
          )}
        </div>

        <div className="relative mt-6 grid grid-cols-3 gap-3">
          {specs.slice(0, 3).map((s) => (
            <div
              key={s}
              className="rounded-xl border border-border/60 bg-secondary/50 px-3 py-3 text-center"
            >
              <span className="text-sm font-semibold text-foreground">{s}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-7 pt-1">
          <Button variant="outline" className="w-full sm:w-auto">
            Подробнее
            <Icon name="ArrowRight" size={16} className="ml-1" />
          </Button>
        </div>
      </article>
    );
  }

  // ── SUPPORT (RAM / SSD) ──
  if (level === 'support') {
    return (
      <article className="group flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm-premium transition-all duration-300 hover:border-primary/40 hover:shadow-md-premium">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            {component.brand}
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon name={meta.icon} size={24} />
          </div>
        </div>

        <p className="mt-5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {meta.label}
        </p>
        <h3 className="mt-0.5 font-heading text-xl font-bold text-foreground">{component.name}</h3>
        {component.role && <p className="mt-1 text-sm font-medium text-primary">{component.role}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {specs.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold text-foreground/90"
            >
              {s}
            </span>
          ))}
        </div>

        <button className="mt-5 inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
          Подробнее
          <Icon name="ChevronRight" size={15} />
        </button>
      </article>
    );
  }

  // ── INFRA (Motherboard / PSU / Case) ──
  return (
    <article className="group flex flex-col rounded-xl border border-border/80 bg-card p-5 transition-all duration-300 hover:border-primary/40">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon name={meta.icon} size={20} />
        </div>
        <span className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          {component.brand}
        </span>
      </div>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {meta.label}
      </p>
      <h3 className="mt-0.5 font-heading text-base font-bold leading-snug text-foreground">
        {component.name}
      </h3>
      {component.role && <p className="mt-1 text-xs font-medium text-primary">{component.role}</p>}

      <button className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary">
        Подробнее
        <Icon name="ChevronRight" size={13} />
      </button>
    </article>
  );
};

interface LevelHeadingProps {
  index: string;
  title: string;
  subtitle: string;
}

const LevelHeading = ({ index, title, subtitle }: LevelHeadingProps) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="font-heading text-sm font-bold text-primary">{index}</span>
    <div className="h-px flex-1 bg-border" />
    <div className="text-right">
      <p className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}
      </p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export interface BuildConfigProps {
  components: BuildComponent[];
  className?: string;
}

const BuildConfig = ({ components, className }: BuildConfigProps) => {
  const pick = (types: string[]) =>
    types
      .map((t) => components.find((c) => c.type === t))
      .filter((c): c is BuildComponent => Boolean(c));

  const hero = pick(['CPU', 'GPU']);
  const support = pick(['RAM', 'SSD']);
  const infra = pick(['MOTHERBOARD', 'PSU', 'CASE']);

  return (
    <div className={cn('space-y-12', className)}>
      {hero.length > 0 && (
        <div>
          <LevelHeading index="01" title="Сердце системы" subtitle="Процессор и видеокарта" />
          <div className="grid gap-5 md:grid-cols-2">
            {hero.map((c) => (
              <ComponentCard key={c.type} component={c} level="hero" />
            ))}
          </div>
        </div>
      )}

      {support.length > 0 && (
        <div>
          <LevelHeading index="02" title="Скорость и объём" subtitle="Память и накопитель" />
          <div className="grid gap-4 sm:grid-cols-2">
            {support.map((c) => (
              <ComponentCard key={c.type} component={c} level="support" />
            ))}
          </div>
        </div>
      )}

      {infra.length > 0 && (
        <div>
          <LevelHeading index="03" title="Основа сборки" subtitle="Платформа, питание, корпус" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {infra.map((c) => (
              <ComponentCard key={c.type} component={c} level="infra" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildConfig;
