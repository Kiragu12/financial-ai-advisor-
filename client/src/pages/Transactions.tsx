import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Pencil,
  Receipt,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCategories } from '../api/hooks/use-categories';
import { useDashboardSummary } from '../api/hooks/use-dashboard';
import { useExportTransactions, useTransactions } from '../api/hooks/use-transactions';
import { useWallets } from '../api/hooks/use-wallets';
import { EmptyState } from '../components/finance/EmptyState';
import { StatCard } from '../components/finance/StatCard';
import { TransactionRow } from '../components/finance/TransactionRow';
import { PageHeader } from '../components/layout/PageHeader';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Field } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Spinner } from '../components/ui/spinner';
import { formatMoney } from '../lib/money';
import { TRANSACTION_TYPE_LABEL, directionOf } from '../lib/transaction';
import { AddTransactionDialog } from '../features/transactions/AddTransactionDialog';
import { EditTransactionDialog } from '../features/transactions/EditTransactionDialog';
import { TransferDialog } from '../features/transfers/TransferDialog';

export function Transactions() {
  const [query, setQuery] = useState('');
  const [walletFilter, setWalletFilter] = useState('all');

  const transactions = useTransactions({ limit: 100 });
  const wallets = useWallets();
  const categories = useCategories();
  const summary = useDashboardSummary();
  const exportTransactions = useExportTransactions();

  const walletName = useMemo(
    () => new Map((wallets.data ?? []).map((w) => [w.id, w.name])),
    [wallets.data],
  );
  const categoryName = useMemo(
    () => new Map((categories.data ?? []).map((c) => [c.id, c.name])),
    [categories.data],
  );

  const filtered = useMemo(() => {
    const rows = transactions.data ?? [];
    const q = query.trim().toLowerCase();
    return rows.filter((t) => {
      if (walletFilter !== 'all' && t.walletId !== walletFilter) return false;
      if (q === '') return true;
      const haystack = [
        t.description ?? '',
        t.categoryId ? categoryName.get(t.categoryId) ?? '' : '',
        TRANSACTION_TYPE_LABEL[t.type],
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [transactions.data, query, walletFilter, categoryName]);

  function handleExport() {
    exportTransactions.mutate(walletFilter === 'all' ? {} : { walletId: walletFilter });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="Transactions"
        description="Every income and expense across your wallets. Search, filter and log a new entry in seconds."
        actions={
          <div className="flex gap-2">
            <Button
              variant="default"
              leftIcon={<Download size={16} />}
              loading={exportTransactions.isPending}
              onClick={handleExport}
            >
              Export
            </Button>
            <TransferDialog />
            <AddTransactionDialog />
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Income this month"
          icon={ArrowDownLeft}
          tint="emerald"
          loading={summary.isLoading}
          value={summary.data ? formatMoney(summary.data.income.month) : undefined}
        />
        <StatCard
          label="Spending this month"
          icon={ArrowUpRight}
          tint="amber"
          loading={summary.isLoading}
          value={summary.data ? formatMoney(summary.data.expense.month) : undefined}
        />
      </section>

      {exportTransactions.isError ? (
        <Alert variant="error" title="Could not export transactions">
          {exportTransactions.error instanceof Error
            ? exportTransactions.error.message
            : 'Please try again.'}
        </Alert>
      ) : null}

      <Card className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field>
            <Label htmlFor="tx-search">Search</Label>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                aria-hidden="true"
              />
              <Input
                id="tx-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes, categories…"
                className="pl-9"
              />
            </div>
          </Field>

          <Field>
            <Label htmlFor="tx-filter-wallet">Wallet</Label>
            <select
              id="tx-filter-wallet"
              className="input"
              value={walletFilter}
              onChange={(event) => setWalletFilter(event.target.value)}
            >
              <option value="all">All wallets</option>
              {(wallets.data ?? []).map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {transactions.isError ? (
          <Alert variant="error" title="Couldn't load transactions">
            {transactions.error instanceof Error ? transactions.error.message : 'Please try again.'}
          </Alert>
        ) : transactions.isLoading ? (
          <div className="grid place-items-center py-12">
            <Spinner size={24} label="Loading transactions" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((t) => (
              <TransactionRow
                key={t.id}
                date={t.transactionDate}
                description={t.description || TRANSACTION_TYPE_LABEL[t.type]}
                wallet={walletName.get(t.walletId)}
                category={t.categoryId ? categoryName.get(t.categoryId) : undefined}
                amount={t.amount}
                direction={directionOf(t.type)}
                action={
                  // Only plain income/expense are editable — transfer legs aren't.
                  t.transferId === null ? (
                    <EditTransactionDialog
                      transaction={t}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Edit transaction">
                          <Pencil size={15} />
                        </Button>
                      }
                    />
                  ) : undefined
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title={query.trim() ? `No matches for "${query.trim()}"` : 'No transactions yet'}
            description={
              query.trim()
                ? 'Try a different search or clear the filters.'
                : 'Logged income and expenses will appear here. Add your first one to get started.'
            }
            action={<AddTransactionDialog />}
          />
        )}
      </Card>
    </div>
  );
}
