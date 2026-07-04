import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface WorkCardProps {
  image?: string;
  title: string;
  category?: string;
  description?: string;
  tags?: string[];
  onClick?: () => void;
  className?: string;
}

const WorkCard = ({ image, title, category, description, tags, onClick, className }: WorkCardProps) => {
  return (
    <article
      onClick={onClick}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm-premium transition-all duration-300 hover:border-primary/40 hover:shadow-md-premium',
        onClick && 'cursor-pointer',
        className,
      )}
    >
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
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {category && (
          <div className="absolute left-3 top-3">
            <Badge variant="solid">{category}</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default WorkCard;
