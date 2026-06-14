import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 18, className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex text-ink-2', className)}>
      <Loader2 className="animate-spin" size={size} aria-hidden="true" />
    </span>
  );
}
