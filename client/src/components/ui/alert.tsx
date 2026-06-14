import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'info' | 'success' | 'warn' | 'error';

interface AlertProps {
  variant?: Variant;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const variantMeta: Record<Variant, { bg: string; accent: string; icon: LucideIcon }> = {
  info: { bg: 'bg-surface-2 border-line', accent: 'text-ink-2', icon: Info },
  success: { bg: 'bg-income-soft border-transparent', accent: 'text-income', icon: CheckCircle2 },
  warn: { bg: 'bg-warn-soft border-transparent', accent: 'text-warn', icon: AlertTriangle },
  error: { bg: 'bg-expense-soft border-transparent', accent: 'text-expense', icon: AlertCircle },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const meta = variantMeta[variant];
  const Icon = meta.icon;
  return (
    <div
      role={variant === 'error' || variant === 'warn' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-card border p-4', meta.bg, className)}
    >
      <Icon className={cn('mt-0.5 shrink-0', meta.accent)} size={18} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className={cn('font-semibold', meta.accent)}>{title}</p>}
        {children && <div className={cn('text-ink-2', title && 'mt-1')}>{children}</div>}
      </div>
    </div>
  );
}
