import { Target } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/date';
import { formatMoney } from '../../lib/money';
import { Card } from '../ui/card';

interface GoalCardProps {
  name: ReactNode;
  /** Server-computed progress percentage 0–100. */
  progressPercent: number;
  /** Numeric amounts from the backend. */
  current: number;
  target: number;
  deadline?: string;
  action?: ReactNode;
  className?: string;
}

export function GoalCard({
  name,
  progressPercent,
  current,
  target,
  deadline,
  action,
  className,
}: GoalCardProps) {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="ic tint-emerald h-10 w-10">
          <Target size={18} aria-hidden="true" />
        </span>
        {action}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{name}</p>
        {deadline ? (
          <p className="text-xs text-ink-3">By {formatDate(deadline)}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-pill bg-surface-2" aria-hidden="true">
          <div
            className="h-full rounded-pill bg-primary transition-[width]"
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="flex items-end justify-between gap-2 text-xs text-ink-3">
          <span className="num">
            <span className="font-semibold text-ink">{formatMoney(current)}</span> of{' '}
            {formatMoney(target)}
          </span>
          <span className="font-medium text-ink">{Math.round(clamped)}%</span>
        </div>
      </div>
    </Card>
  );
}
