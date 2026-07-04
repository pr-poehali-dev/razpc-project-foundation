import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface ArticleCardProps {
  image?: string;
  title: string;
  excerpt?: string;
  category?: string;
  date?: string;
  readTime?: string;
  onClick?: () => void;
  className?: string;
}

const ArticleCard = ({
  image,
  title,
  excerpt,
  category,
  date,
  readTime,
  onClick,
  className,
}: ArticleCardProps) => {
  return (
    <article
      onClick={onClick}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm-premium transition-all duration-300 hover:border-primary/40 hover:shadow-md-premium',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary/40">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Icon name="Newspaper" size={40} />
          </div>
        )}
        {category && (
          <div className="absolute left-3 top-3">
            <Badge variant="solid">{category}</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        )}
        {(date || readTime) && (
          <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-muted-foreground">
            {date && (
              <span className="flex items-center gap-1.5">
                <Icon name="Calendar" size={13} />
                {date}
              </span>
            )}
            {readTime && (
              <span className="flex items-center gap-1.5">
                <Icon name="Clock" size={13} />
                {readTime}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
