import { type LucideIcon } from 'lucide-react';
import { memo, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

type Tint = 'green' | 'emerald' | 'blue' | 'violet' | 'amber' | 'teal' | 'pink' | 'lime' | 'red';

interface StatCardProps {
  label: ReactNode;
  value?: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tint?: Tint;
  loading?: boolean;
  className?: string;
}

function StatCardImpl({
  label,
  value,
  hint,
  icon: Icon,
  tint = 'green',
  loading = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2',
        className,
      )}
    >
      <p className="min-w-0 text-xs font-medium uppercase tracking-wider text-ink-3">
        {label}
      </p>

      {Icon ? (
        <span className={cn('ic h-10 w-10 shrink-0', `tint-${tint}`)}>
          <Icon size={18} aria-hidden="true" />
        </span>
      ) : null}

      <div className="col-span-full min-w-0 space-y-2">
        {loading ? (
          <Skeleton className="h-8 w-32 max-w-full" />
        ) : (
          <p className="num max-w-full break-words text-2xl font-semibold leading-tight tracking-tight text-ink">
            {value ?? <span className="text-ink-3">-</span>}
          </p>
        )}
        {hint ? <p className="text-xs text-ink-3">{hint}</p> : null}
      </div>
    </Card>
  );
}

export const StatCard = memo(StatCardImpl);
