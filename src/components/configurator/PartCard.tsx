import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type AnyPart } from '@/config/pcParts';
import { formatPrice, formatWarranty } from '@/lib/pcCompat';

interface Props {
  part: AnyPart;
  icon: string;
  incompatible?: boolean;
  reasons?: string[];
  onSelect: () => void;
}

const PartCard = ({ part, icon, incompatible, reasons, onSelect }: Props) => {
  const inStock = part.leadDays === 0;
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-card p-4 transition-all',
        incompatible
          ? 'border-border/60 opacity-60'
          : 'border-border/80 hover:border-primary/50 hover:shadow-md-premium',
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-primary">
          <Icon name={icon} size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{part.brand}</p>
          <h4 className="truncate font-heading text-sm font-semibold leading-tight">{part.name}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              inStock ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
              <Icon name={inStock ? 'Check' : 'Truck'} size={10} />
              {inStock ? 'В наличии' : `${part.leadDays} дн.`}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {part.condition === 'new' ? 'Новое' : 'Б/У'}
            </span>
          </div>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {part.shortSpecs.map((s) => (
          <li key={s} className="rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">{s}</li>
        ))}
      </ul>

      {incompatible && reasons && reasons.length > 0 && (
        <div className="mt-3 space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-2">
          {reasons.map((r) => (
            <p key={r} className="flex items-start gap-1.5 text-xs text-destructive">
              <Icon name="TriangleAlert" size={12} className="mt-0.5 shrink-0" />
              {r}
            </p>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <div>
          <p className="font-heading text-lg font-bold">{formatPrice(part.price)}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Icon name="ShieldCheck" size={11} className="text-primary" />
            {formatWarranty(part.warrantyMonths)}
          </p>
        </div>
        <Button size="sm" onClick={onSelect} disabled={incompatible}>
          <Icon name="Plus" size={15} className="mr-1" />
          Выбрать
        </Button>
      </div>
    </div>
  );
};

export default PartCard;
