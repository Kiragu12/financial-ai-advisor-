import { Banknote, Landmark, PiggyBank, Smartphone, Trash2, Wallet } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useDashboardSummary } from '../api/hooks/use-dashboard';
import { useDeleteWallet, useWallets } from '../api/hooks/use-wallets';
import type { WalletType } from '../api/types';
import { EmptyState } from '../components/finance/EmptyState';
import { StatCard } from '../components/finance/StatCard';
import { WalletCard } from '../components/finance/WalletCard';
import { PageHeader } from '../components/layout/PageHeader';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import { formatMoney } from '../lib/money';
import { AddWalletDialog } from '../features/wallets/AddWalletDialog';

type Tint = 'green' | 'emerald' | 'blue' | 'violet' | 'amber' | 'teal';

const WALLET_META: Record<WalletType, { icon: LucideIcon; tint: Tint; label: string }> = {
  mobile_money: { icon: Smartphone, tint: 'green', label: 'Mobile money' },
  bank: { icon: Landmark, tint: 'blue', label: 'Bank' },
  cash: { icon: Banknote, tint: 'amber', label: 'Cash' },
  savings: { icon: PiggyBank, tint: 'emerald', label: 'Savings' },
  custom: { icon: Wallet, tint: 'violet', label: 'Custom' },
};

export function Wallets() {
  const wallets = useWallets();
  const summary = useDashboardSummary();
  const deleteWallet = useDeleteWallet();

  function handleDeactivate(id: string, name: string) {
    if (window.confirm(`Deactivate "${name}"? It will be hidden but its history is kept.`)) {
      deleteWallet.mutate(id);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Money"
        title="Wallets"
        description="M-Pesa, bank, cash, savings — every account in one place."
        actions={<AddWalletDialog />}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Aggregate balance"
          icon={Wallet}
          tint="green"
          loading={summary.isLoading}
          value={summary.data ? formatMoney(summary.data.totalBalance) : undefined}
        />
        <StatCard
          label="Active wallets"
          icon={Wallet}
          tint="blue"
          loading={summary.isLoading}
          value={summary.data?.walletCount}
        />
      </section>

      {wallets.isError ? (
        <Alert variant="error" title="Couldn't load wallets">
          {wallets.error instanceof Error ? wallets.error.message : 'Please try again.'}
        </Alert>
      ) : null}

      {wallets.isLoading ? (
        <div className="grid place-items-center py-16">
          <Spinner size={24} label="Loading wallets" />
        </div>
      ) : wallets.data && wallets.data.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.data.map((wallet) => {
            const meta = WALLET_META[wallet.type];
            return (
              <WalletCard
                key={wallet.id}
                name={wallet.name}
                type={meta.label}
                balance={wallet.currentBalance}
                tint={meta.tint}
                icon={meta.icon}
                action={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Deactivate ${wallet.name}`}
                    onClick={() => handleDeactivate(wallet.id, wallet.name)}
                  >
                    <Trash2 size={16} />
                  </Button>
                }
              />
            );
          })}
        </section>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No wallets yet"
          description="Add your first wallet — M-Pesa, a bank account, cash or savings — to start tracking."
          action={<AddWalletDialog />}
        />
      )}
    </div>
  );
}
