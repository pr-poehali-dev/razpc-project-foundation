import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ProductCardProps {
  image?: string;
  title: string;
  category?: string;
  price?: string;
  oldPrice?: string;
  badge?: { label: string; variant?: 'default' | 'success' | 'warning' | 'destructive' | 'solid' };
  specs?: { icon: string; label: string }[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const ProductCard = ({
  image,
  title,
  category,
  price,
  oldPrice,
  badge,
  specs,
  actionLabel = 'Подробнее',
  onAction,
  className,
}: ProductCardProps) => {
  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm-premium transition-all duration-300 hover:border-primary/40 hover:shadow-md-premium',
        className,
      )}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/40">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Icon name="ImageOff" size={40} />
          </div>
        )}
        {badge && (
          <div className="absolute left-3 top-3">
            <Badge variant={badge.variant ?? 'solid'}>{badge.label}</Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {category && (
          <span className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {category}
          </span>
        )}
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">
          {title}
        </h3>

        {specs && specs.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {specs.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name={s.icon} size={15} className="shrink-0 text-primary" />
                <span className="truncate">{s.label}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between pt-5">
          {price && (
            <div className="flex flex-col">
              {oldPrice && (
                <span className="text-xs text-muted-foreground line-through">{oldPrice}</span>
              )}
              <span className="font-heading text-xl font-bold text-foreground">{price}</span>
            </div>
          )}
          <Button size="sm" variant={price ? 'default' : 'outline'} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
