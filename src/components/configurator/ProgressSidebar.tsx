import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { type SlotDef } from '@/config/pcParts';

interface Props {
  slots: SlotDef[];
  filled: Record<string, boolean>;
  activeCategory: string | null;
  onNavigate: (category: string) => void;
}

const ProgressSidebar = ({ slots, filled, activeCategory, onNavigate }: Props) => {
  const doneCount = slots.filter((s) => s.required && filled[s.category]).length;
  const requiredCount = slots.filter((s) => s.required).length;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm-premium">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Сборка</h3>
        <span className="text-xs font-medium text-muted-foreground">{doneCount}/{requiredCount}</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(doneCount / requiredCount) * 100}%` }} />
      </div>

      <nav className="space-y-0.5">
        {slots.map((slot) => {
          const done = filled[slot.category];
          const isActive = activeCategory === slot.category;
          return (
            <button
              key={slot.category}
              onClick={() => onNavigate(slot.category)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-secondary',
              )}
            >
              <span className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
              )}>
                <Icon name={done ? 'Check' : slot.icon} size={13} />
              </span>
              <span className={cn('flex-1 truncate', done ? 'font-medium' : 'text-muted-foreground')}>
                {slot.title}
              </span>
              {!slot.required && <span className="text-[10px] uppercase text-muted-foreground/60">опц.</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProgressSidebar;
