import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('field', className)} {...props} />;
}

export function HelperText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-ink-3', className)} {...props} />;
}

export function ErrorText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      role="alert"
      className={cn('text-xs font-medium text-expense', className)}
      {...props}
    />
  );
}
