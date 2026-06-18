import { Wallet } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { BackendNotReady } from '../components/finance/BackendNotReady';
import { EmptyState } from '../components/finance/EmptyState';
import { StatCard } from '../components/finance/StatCard';
import { AddWalletDialog } from '../features/wallets/AddWalletDialog';

export function Wallets() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Money"
        title="Wallets"
        description="M-Pesa, bank, cash, savings — every account in one place."
        actions={<AddWalletDialog />}
      />

      <BackendNotReady endpoint="GET /api/wallets">
        The grid below renders an empty state until the wallets endpoint exists. Create one with
        the button above to see the form.
      </BackendNotReady>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Aggregate balance" icon={Wallet} tint="green" />
        <StatCard label="Active wallets" icon={Wallet} tint="blue" />
        <StatCard label="Updated" icon={Wallet} tint="violet" />
      </section>

      <section>
        <EmptyState
          icon={Wallet}
          title="No wallets yet"
          description="Add your first wallet — M-Pesa, a bank account, cash or savings — to start tracking."
          action={<AddWalletDialog />}
        />
      </section>
    </div>
  );
}
