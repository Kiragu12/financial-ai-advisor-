import { ArrowDownLeft, ArrowUpRight, Brain, Flame, Receipt, Sparkles, Target, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../api/hooks/use-categories';
import { useCashflow, useDashboardSummary, useSpendingByCategory } from '../api/hooks/use-dashboard';
import { useGoals } from '../api/hooks/use-goals';
import { useGamificationSummary } from '../api/hooks/use-gamification';
import { useTransactions } from '../api/hooks/use-transactions';
import { useWallets } from '../api/hooks/use-wallets';
import { CashflowChart } from '../components/finance/CashflowChart';
import { EmptyState } from '../components/finance/EmptyState';
import { MoneyQuote } from '../components/finance/MoneyQuote';
import { SpendingDonut } from '../components/finance/SpendingDonut';
import { StatCard } from '../components/finance/StatCard';
import { TransactionRow } from '../components/finance/TransactionRow';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Spinner } from '../components/ui/spinner';
import { formatMoney } from '../lib/money';
import { TRANSACTION_TYPE_LABEL, directionOf } from '../lib/transaction';
import { AddTransactionDialog } from '../features/transactions/AddTransactionDialog';

export function Dashboard() {
  const summary = useDashboardSummary();
  const recent = useTransactions({ limit: 5 });
  const spending = useSpendingByCategory();
  const cashflow = useCashflow(6);
  const goals = useGoals('active');
  const gamification = useGamificationSummary();
  const wallets = useWallets();
  const categories = useCategories();

  const walletName = useMemo(
    () => new Map((wallets.data ?? []).map((w) => [w.id, w.name])),
    [wallets.data],
  );
  const categoryName = useMemo(
    () => new Map((categories.data ?? []).map((c) => [c.id, c.name])),
    [categories.data],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your aggregate balance, recent activity and goal progress at a glance."
        actions={<AddTransactionDialog />}
      />

      <MoneyQuote />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aggregate balance"
          icon={Wallet}
          tint="green"
          loading={summary.isLoading}
          value={summary.data ? formatMoney(summary.data.totalBalance) : undefined}
        />
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
        <StatCard
          label="Tracking streak"
          icon={Flame}
          tint="red"
          loading={gamification.isLoading}
          value={
            gamification.data
              ? `${gamification.data.currentStreak} day${gamification.data.currentStreak === 1 ? '' : 's'}`
              : undefined
          }
          hint={
            gamification.data
              ? `Best ${gamification.data.longestStreak} · ${gamification.data.activeDaysThisMonth} active this month`
              : undefined
          }
        />
      </section>

      <SectionCard
        eyebrow="Trend"
        title="Income vs spending"
        action={<span className="text-xs text-ink-3">Last 6 months</span>}
      >
        {cashflow.isLoading ? (
          <Centered>
            <Spinner size={22} label="Loading cashflow" />
          </Centered>
        ) : cashflow.data && cashflow.data.months.length > 0 ? (
          <CashflowChart months={cashflow.data.months} />
        ) : (
          <EmptyState
            icon={ArrowUpRight}
            title="No cashflow yet"
            description="Log income and expenses and your monthly trend will appear here."
          />
        )}
      </SectionCard>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            eyebrow="Recent activity"
            title="Latest transactions"
            action={
              <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            }
          >
            {recent.isLoading ? (
              <Centered>
                <Spinner size={22} label="Loading transactions" />
              </Centered>
            ) : recent.data && recent.data.length > 0 ? (
              <div className="space-y-2">
                {recent.data.map((t) => (
                  <TransactionRow
                    key={t.id}
                    date={t.transactionDate}
                    description={t.description || TRANSACTION_TYPE_LABEL[t.type]}
                    wallet={walletName.get(t.walletId)}
                    category={t.categoryId ? categoryName.get(t.categoryId) : undefined}
                    amount={t.amount}
                    direction={directionOf(t.type)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Log your first income or expense and it'll show up here."
                action={<AddTransactionDialog />}
              />
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Where money goes"
            title="Spending by category"
            action={<span className="text-xs text-ink-3">This month</span>}
          >
            {spending.isLoading ? (
              <Centered>
                <Spinner size={22} label="Loading spending" />
              </Centered>
            ) : spending.data && spending.data.categories.length > 0 ? (
              <SpendingDonut categories={spending.data.categories.slice(0, 8)} />
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No category data yet"
                description="A breakdown of where your money goes appears once you log some expenses."
              />
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            eyebrow="Savings goals"
            title="Progress"
            action={
              <Link to="/goals" className="text-sm font-medium text-primary hover:underline">
                Manage
              </Link>
            }
          >
            {goals.isLoading ? (
              <Centered>
                <Spinner size={22} label="Loading goals" />
              </Centered>
            ) : goals.data && goals.data.length > 0 ? (
              <div className="space-y-4">
                {goals.data.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-ink">{goal.name}</span>
                      <span className="text-ink-3">{goal.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-pill bg-surface-2" aria-hidden="true">
                      <div
                        className="h-full rounded-pill bg-primary"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="num text-xs text-ink-3">
                      {formatMoney(goal.currentAmount)} of {formatMoney(goal.targetAmount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="No goals yet"
                description="Create a savings goal — a laptop, a trip, an emergency fund — and watch the progress here."
                action={
                  <Link to="/goals">
                    <Button variant="primary" size="sm">
                      Add a goal
                    </Button>
                  </Link>
                }
              />
            )}
          </SectionCard>

          <SectionCard
            eyebrow="AI advisor"
            title="Ask Akiba"
            action={
              <Link to="/advisor" className="text-sm font-medium text-primary hover:underline">
                Open advisor
              </Link>
            }
          >
            <EmptyState
              icon={Brain}
              title="Get judgement-free guidance"
              description="Ask about your budget, spending or goals — the advisor reads your real numbers."
              action={
                <Link to="/advisor">
                  <Button variant="primary" size="sm">
                    Open advisor
                  </Button>
                </Link>
              }
            />
          </SectionCard>
        </div>
      </section>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid place-items-center py-10">{children}</div>;
}

interface SectionCardProps {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ eyebrow, title, action, children }: SectionCardProps) {
  return (
    <Card className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold text-ink">{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </Card>
  );
}
