import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeMap;
}

const Spinner = ({ size = 'md', className, ...props }: SpinnerProps) => {
  return (
    <div
      role="status"
      aria-label="Загрузка"
      className={cn(
        'inline-block animate-spin rounded-full border-muted border-t-primary',
        sizeMap[size],
        className,
      )}
      {...props}
    />
  );
};

export { Spinner };
