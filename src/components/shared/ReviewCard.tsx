import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ReviewCardProps {
  author: string;
  avatar?: string;
  role?: string;
  rating?: number;
  date?: string;
  text: string;
  className?: string;
}

const ReviewCard = ({ author, avatar, role, rating = 5, date, text, className }: ReviewCardProps) => {
  const initials = author
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border/80 bg-card p-6 shadow-sm-premium',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon
            key={i}
            name="Star"
            size={16}
            className={i < rating ? 'text-primary' : 'text-muted'}
            fallback="Star"
          />
        ))}
      </div>

      <p className="flex-1 text-sm leading-relaxed text-foreground/90">«{text}»</p>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <Avatar className="h-10 w-10">
          {avatar && <AvatarImage src={avatar} alt={author} />}
          <AvatarFallback className="bg-secondary text-sm font-medium text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{author}</p>
          {(role || date) && (
            <p className="truncate text-xs text-muted-foreground">
              {role}
              {role && date && ' · '}
              {date}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
