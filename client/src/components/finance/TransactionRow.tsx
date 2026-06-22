import { memo, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/date';
import { formatMoney } from '../../lib/money';
import { Badge } from '../ui/badge';

type Direction = 'income' | 'expense';

interface TransactionRowProps {
  date: string;
  description: ReactNode;
  category?: ReactNode;
  wallet?: ReactNode;
  /** Numeric amount from the backend. */
  amount: number;
  direction: Direction;
  className?: string;
}

function TransactionRowImpl({
  date,
  description,
  category,
  wallet,
  amount,
  direction,
  className,
}: TransactionRowProps) {
  const isIncome = direction === 'income';
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-card-sm border border-line bg-surface px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium text-ink">{description}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
          <span>{formatDate(date)}</span>
          {wallet ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{wallet}</span>
            </>
          ) : null}
          {category ? <Badge variant={isIncome ? 'income' : 'default'}>{category}</Badge> : null}
        </div>
      </div>
      <p
        className={cn(
          'num shrink-0 text-sm font-semibold tabular-nums',
          isIncome ? 'text-income' : 'text-expense',
        )}
      >
        {isIncome ? '+' : '−'}
        {formatMoney(amount)}
      </p>
    </div>
  );
}

export const TransactionRow = memo(TransactionRowImpl);
