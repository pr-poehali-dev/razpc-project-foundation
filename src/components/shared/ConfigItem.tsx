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

export interface ConfigItemProps {
  component: BuildComponent;
}

const ConfigItem = ({ component }: ConfigItemProps) => {
  const meta = typeMeta[component.type] ?? { icon: 'Cpu', label: component.type };

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/40 sm:p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon name={meta.icon} size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {meta.label}
          </span>
          <Badge variant="outline">{component.brand}</Badge>
        </div>
        <p className="truncate font-heading text-base font-semibold text-foreground">
          {component.name}
        </p>
        <p className="truncate text-sm text-muted-foreground">{component.spec}</p>
      </div>

      <Button variant="ghost" size="sm" className="hidden shrink-0 sm:inline-flex">
        Подробнее
        <Icon name="ChevronRight" size={15} className="ml-0.5" />
      </Button>
    </div>
  );
};

export default ConfigItem;
