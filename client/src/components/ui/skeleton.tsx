import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-card-sm bg-surface-3', className)}
      {...props}
    />
  );
}
