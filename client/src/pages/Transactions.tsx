import { ArrowDownLeft, ArrowUpRight, Receipt, Search } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { BackendNotReady } from '../components/finance/BackendNotReady';
import { EmptyState } from '../components/finance/EmptyState';
import { StatCard } from '../components/finance/StatCard';
import { Card } from '../components/ui/card';
import { Field } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AddTransactionDialog } from '../features/transactions/AddTransactionDialog';
import { TransferDialog } from '../features/transfers/TransferDialog';

export function Transactions() {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="Transactions"
        description="Every income and expense across your wallets. Search, filter and log a new entry in seconds."
        actions={
          <div className="flex gap-2">
            <TransferDialog />
            <AddTransactionDialog />
          </div>
        }
      />

      <BackendNotReady endpoint="GET /api/transactions">
        Filters and the search box are wired locally — once Paul ships the endpoint, the same
        controls will narrow real results.
      </BackendNotReady>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Income this month" icon={ArrowDownLeft} tint="emerald" />
        <StatCard label="Spending this month" icon={ArrowUpRight} tint="amber" />
      </section>

      <Card className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
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
            <select id="tx-filter-wallet" className="input" disabled>
              <option>All wallets</option>
            </select>
          </Field>

          <Field>
            <Label htmlFor="tx-filter-range">Range</Label>
            <select id="tx-filter-range" className="input" defaultValue="month">
              <option value="month">This month</option>
              <option value="last-month">Last month</option>
              <option value="quarter">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </Field>
        </div>

        <EmptyState
          icon={Receipt}
          title={query.trim() ? `No matches for "${query.trim()}"` : 'No transactions yet'}
          description={
            query.trim()
              ? 'Search runs against the real transaction list once the endpoint is live.'
              : 'Logged income and expenses will appear here as soon as the transactions endpoint exists.'
          }
          action={<AddTransactionDialog />}
        />
      </Card>
    </div>
  );
}
