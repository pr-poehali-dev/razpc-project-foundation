import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, type ItemStatus } from '@/api/warehouse';

interface Props {
  status: ItemStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: Props) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
      STATUS_COLORS[status] || 'bg-secondary text-muted-foreground border-border',
      className,
    )}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

export default StatusBadge;
