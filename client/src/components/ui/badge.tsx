import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'default' | 'primary' | 'income' | 'expense' | 'warn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  default: '',
  primary: 'border-transparent bg-primary-soft text-primary',
  income: 'border-transparent bg-income-soft text-income',
  expense: 'border-transparent bg-expense-soft text-expense',
  warn: 'border-transparent bg-warn-soft text-warn',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <span className={cn('chip', variantClass[variant], className)} {...props} />;
}
