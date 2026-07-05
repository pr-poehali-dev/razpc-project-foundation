import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export type ConfigTier = 1 | 2 | 3;

export interface ConfigItemProps {
  component: BuildComponent;
  tier?: ConfigTier;
}

const ConfigItem = ({ component, tier = 3 }: ConfigItemProps) => {
  const meta = typeMeta[component.type] ?? { icon: 'Cpu', label: component.type };
  const specs =
    component.key_specs && component.key_specs.length > 0 ? component.key_specs : [component.spec];

  // 1 уровень — крупные карточки-герои (CPU, GPU)
  if (tier === 1) {
    return (
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm-premium transition-all duration-300 hover:border-primary/50 hover:shadow-lg-premium">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon name={meta.icon} size={30} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {meta.label}
          </span>
        </div>

        <div className="relative mt-5">
          <Badge variant="outline">{component.brand}</Badge>
          <h3 className="mt-2 font-heading text-2xl font-bold text-foreground">{component.name}</h3>
          {component.role && <p className="mt-1 text-sm font-medium text-primary">{component.role}</p>}
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {specs.map((s) => (
            <span
              key={s}
              className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-foreground/90"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="relative mt-auto pt-6">
          <Button variant="outline" size="sm">
            Подробнее
            <Icon name="ChevronRight" size={15} className="ml-0.5" />
          </Button>
        </div>
      </div>
    );
  }

  // 2 уровень — средние карточки (RAM, SSD)
  if (tier === 2) {
    return (
      <div className="group flex flex-col rounded-xl border border-border/80 bg-card p-5 shadow-sm-premium transition-all duration-300 hover:border-primary/40">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon name={meta.icon} size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {meta.label}
            </span>
            <Badge variant="outline">{component.brand}</Badge>
          </div>
        </div>

        <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">{component.name}</h3>
        {component.role && <p className="text-sm text-primary">{component.role}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {specs.map((s) => (
            <span
              key={s}
              className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-foreground/80"
            >
              {s}
            </span>
          ))}
        </div>

        <button className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          Подробнее
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>
    );
  }

  // 3 уровень — компактные строки-карточки (MB, PSU, Case)
  return (
    <div className="group flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon name={meta.icon} size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {meta.label}
          </span>
          <Badge variant="outline">{component.brand}</Badge>
        </div>
        <p className="truncate font-heading text-sm font-semibold text-foreground">{component.name}</p>
      </div>
      <Icon
        name="ChevronRight"
        size={16}
        className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
      />
    </div>
  );
};

export default ConfigItem;
