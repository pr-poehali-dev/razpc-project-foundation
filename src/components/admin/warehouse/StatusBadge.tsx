import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, MACHINE_STATUS_LABELS } from '@/api/warehouse';

interface Props {
  status: string;
  machine?: boolean;
  className?: string;
}

const StatusBadge = ({ status, machine, className }: Props) => {
  const label = machine
    ? MACHINE_STATUS_LABELS[status] || status
    : STATUS_LABELS[status] || status;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        STATUS_COLORS[status] || 'bg-secondary text-muted-foreground border-border',
        className,
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;