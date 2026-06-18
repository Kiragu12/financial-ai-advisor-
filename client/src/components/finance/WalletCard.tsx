import { Wallet, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { formatMoney } from '../../lib/money';
import { Card } from '../ui/card';

type Tint = 'green' | 'emerald' | 'blue' | 'violet' | 'amber' | 'teal' | 'pink' | 'lime' | 'red';

interface WalletCardProps {
  name: ReactNode;
  type: ReactNode;
  /** Decimal-string balance from the backend, e.g. "1500.00". */
  balance: string;
  tint?: Tint;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function WalletCard({
  name,
  type,
  balance,
  tint = 'green',
  icon: Icon = Wallet,
  action,
  className,
}: WalletCardProps) {
  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('ic h-10 w-10', `tint-${tint}`)}>
          <Icon size={18} aria-hidden="true" />
        </span>
        {action}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{name}</p>
        <p className="text-xs uppercase tracking-wider text-ink-3">{type}</p>
      </div>
      <p className="num text-xl font-semibold tracking-tight text-ink">{formatMoney(balance)}</p>
    </Card>
  );
}
