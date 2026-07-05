import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type AnyPart, type SlotDef } from '@/config/pcParts';
import { formatPrice, formatWarranty } from '@/lib/pcCompat';

export interface SlotEntry {
  part: AnyPart;
  qty?: number;
}

interface Props {
  slot: SlotDef;
  entries: SlotEntry[];
  highlight: boolean;
  onOpen: () => void;
  onReplace: (part: AnyPart) => void;
  onRemove: (part: AnyPart) => void;
  onQty?: (part: AnyPart, qty: number) => void;
}

const SlotBlock = ({ slot, entries, highlight, onOpen, onReplace, onRemove, onQty }: Props) => {
  const empty = entries.length === 0;

  return (
    <div
      id={`slot-${slot.category}`}
      className={cn(
        'scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm-premium transition-all',
        highlight ? 'border-primary/60 ring-1 ring-primary/30' : 'border-border/80',
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
          empty ? 'bg-secondary text-primary' : 'bg-primary text-primary-foreground',
        )}>
          <Icon name={empty ? slot.icon : 'Check'} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold">{slot.title}</h3>
            {!slot.required && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Опционально
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{slot.hint}</p>
        </div>
      </div>

      {empty ? (
        <button
          onClick={onOpen}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Icon name="Plus" size={18} />
          Выбрать {slot.title.toLowerCase()}
        </button>
      ) : (
        <div className="space-y-2.5">
          {entries.map(({ part, qty }) => (
            <div key={part.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon name={slot.icon} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{part.brand} {part.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{formatPrice(part.price)}</span>
                  <span className="flex items-center gap-1"><Icon name="ShieldCheck" size={11} className="text-primary" /> {formatWarranty(part.warrantyMonths)}</span>
                  <span>{part.condition === 'new' ? 'Новое' : 'Б/У'}</span>
                  {part.leadDays === 0 ? (
                    <span className="text-emerald-400">В наличии</span>
                  ) : (
                    <span className="text-amber-400">{part.leadDays} дн.</span>
                  )}
                </div>
              </div>

              {slot.multiple && onQty && (
                <div className="flex items-center rounded-lg border border-border">
                  <button onClick={() => onQty(part, (qty || 1) - 1)} disabled={(qty || 1) <= 1}
                    className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40">
                    <Icon name="Minus" size={13} />
                  </button>
                  <span className="w-7 text-center text-sm">{qty || 1}</span>
                  <button onClick={() => onQty(part, (qty || 1) + 1)}
                    className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-secondary">
                    <Icon name="Plus" size={13} />
                  </button>
                </div>
              )}

              {!slot.multiple && (
                <Button variant="ghost" size="sm" onClick={() => onReplace(part)}>
                  <Icon name="RefreshCw" size={14} className="mr-1" /> Заменить
                </Button>
              )}
              <button onClick={() => onRemove(part)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          ))}

          {slot.multiple && (
            <button onClick={onOpen}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
              <Icon name="Plus" size={16} /> Добавить ещё
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotBlock;
