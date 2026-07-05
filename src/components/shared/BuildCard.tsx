import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type BuildListItem, formatPrice } from '@/api/catalog';

const typeIcon: Record<string, string> = {
  CPU: 'Cpu',
  GPU: 'MonitorPlay',
  RAM: 'MemoryStick',
  SSD: 'HardDrive',
  MOTHERBOARD: 'CircuitBoard',
  PSU: 'Plug',
  CASE: 'Box',
};

export interface BuildCardProps {
  build: BuildListItem;
  className?: string;
}

const BuildCard = ({ build, className }: BuildCardProps) => {
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm-premium transition-all duration-300 hover:border-primary/40 hover:shadow-lg-premium',
        className,
      )}
    >
      {/* Постер */}
      <Link to={`/catalog/${build.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-secondary/30">
        {build.image_url ? (
          <img
            src={build.image_url}
            alt={build.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Icon name="ImageOff" size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        {/* Теги производительности */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {build.tier && <Badge variant="solid">{build.tier}</Badge>}
          {build.status === 'on_order' && <Badge variant="warning">Под заказ</Badge>}
        </div>
      </Link>

      {/* Инфо */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-2xl font-bold text-foreground">{build.name}</h3>
        {build.tagline && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{build.tagline}</p>
        )}

        {build.performance_badge && (
          <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Icon name="Gauge" size={13} />
            {build.performance_badge}
          </div>
        )}

        {/* Ключевые характеристики (3-4) */}
        <ul className="mt-5 space-y-2.5">
          {build.highlights.map((c) => (
            <li key={c.type} className="flex items-center gap-2.5 text-sm">
              <Icon name={typeIcon[c.type] ?? 'Cpu'} size={16} className="shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground/90">{c.name}</span>
            </li>
          ))}
        </ul>

        {/* Цена + CTA */}
        <div className="mt-auto flex items-end justify-between pt-6">
          <div className="flex flex-col">
            {build.old_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(build.old_price)}
              </span>
            )}
            <span className="font-heading text-2xl font-bold text-foreground">
              {formatPrice(build.price)}
            </span>
          </div>
          <Button asChild>
            <Link to={`/catalog/${build.slug}`}>
              Подробнее
              <Icon name="ArrowRight" size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default BuildCard;
