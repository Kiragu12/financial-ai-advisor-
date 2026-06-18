import { ArrowDownLeft, ArrowUpRight, Brain, Plus, Receipt, Sparkles, Target, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { BackendNotReady } from '../components/finance/BackendNotReady';
import { EmptyState } from '../components/finance/EmptyState';
import { StatCard } from '../components/finance/StatCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your aggregate balance, recent activity and goal progress at a glance."
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} />} disabled>
            Add transaction
          </Button>
        }
      />

      <BackendNotReady endpoint="GET /api/dashboard/summary">
        Until then, each section below shows its empty state so you can see the layout.
      </BackendNotReady>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Aggregate balance" icon={Wallet} tint="green" />
        <StatCard label="Income this month" icon={ArrowDownLeft} tint="emerald" />
        <StatCard label="Spending this month" icon={ArrowUpRight} tint="amber" />
      </section>

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
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Logged income and expenses will appear here as soon as the transactions endpoint is live."
            />
          </SectionCard>

          <SectionCard
            eyebrow="Where money goes"
            title="Spending by category"
            action={<span className="text-xs text-ink-3">This month</span>}
          >
            <EmptyState
              icon={Sparkles}
              title="No category data yet"
              description="A breakdown of spending across food, transport, rent and the rest will land once the dashboard summary endpoint exists."
            />
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
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Create a savings goal — a laptop, a trip, an emergency fund — and watch the progress here."
              action={
                <Link to="/goals">
                  <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                    Add a goal
                  </Button>
                </Link>
              }
            />
          </SectionCard>

          <SectionCard
            eyebrow="AI advisor"
            title="Latest insight"
            action={
              <Link to="/advisor" className="text-sm font-medium text-primary hover:underline">
                Open advisor
              </Link>
            }
          >
            <EmptyState
              icon={Brain}
              title="No insights yet"
              description="Once you have a few transactions and the advisor endpoint is live, judgement-free nudges will appear here."
            />
          </SectionCard>
        </div>
      </section>
    </div>
  );
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
