import { Wallet, type LucideIcon } from 'lucide-react';
import { memo, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { formatMoney } from '../../lib/money';
import { Card } from '../ui/card';

type Tint = 'green' | 'emerald' | 'blue' | 'violet' | 'amber' | 'teal' | 'pink' | 'lime' | 'red';

interface WalletCardProps {
  name: ReactNode;
  type: ReactNode;
  /** Numeric balance from the backend. */
  balance: number;
  tint?: Tint;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

function WalletCardImpl({
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

export const WalletCard = memo(WalletCardImpl);
