import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="grid h-12 w-12 place-items-center rounded-card-sm bg-surface-2 text-ink-3">
          <Icon size={22} aria-hidden="true" />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-base font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-6 text-ink-2">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
