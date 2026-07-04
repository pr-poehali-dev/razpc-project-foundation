import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';

export interface InfoCardProps {
  icon: string;
  title: string;
  description?: string;
  variant?: 'default' | 'highlight';
  onClick?: () => void;
  className?: string;
}

const InfoCard = ({
  icon,
  title,
  description,
  variant = 'default',
  onClick,
  className,
}: InfoCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group rounded-xl border bg-card p-6 shadow-sm-premium transition-all duration-300',
        variant === 'highlight' ? 'border-primary/40' : 'border-border/80 hover:border-primary/40',
        onClick && 'cursor-pointer hover:shadow-md-premium',
        className,
      )}
    >
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
          variant === 'highlight'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground',
        )}
      >
        <Icon name={icon} size={24} />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default InfoCard;
