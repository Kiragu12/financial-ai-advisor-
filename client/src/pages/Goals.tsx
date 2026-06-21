import { Plus, PiggyBank, Target, Trophy } from 'lucide-react';
import { useDashboardSummary } from '../api/hooks/use-dashboard';
import { useGoals } from '../api/hooks/use-goals';
import { EmptyState } from '../components/finance/EmptyState';
import { GoalCard } from '../components/finance/GoalCard';
import { StatCard } from '../components/finance/StatCard';
import { PageHeader } from '../components/layout/PageHeader';
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import { formatMoney } from '../lib/money';
import { AddGoalDialog } from '../features/goals/AddGoalDialog';
import { ContributeDialog } from '../features/goals/ContributeDialog';

export function Goals() {
  const goals = useGoals();
  const summary = useDashboardSummary();
  const goalStats = summary.data?.goals;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Saving"
        title="Goals"
        description="Set a target — a laptop, an emergency fund, a trip — and watch the progress add up."
        actions={<AddGoalDialog />}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total saved"
          icon={PiggyBank}
          tint="emerald"
          loading={summary.isLoading}
          value={goalStats ? formatMoney(goalStats.totalSaved) : undefined}
        />
        <StatCard
          label="Active goals"
          icon={Target}
          tint="green"
          loading={summary.isLoading}
          value={goalStats?.active}
        />
        <StatCard
          label="Completed goals"
          icon={Trophy}
          tint="violet"
          loading={summary.isLoading}
          value={goalStats?.completed}
        />
      </section>

      {goals.isError ? (
        <Alert variant="error" title="Couldn't load goals">
          {goals.error instanceof Error ? goals.error.message : 'Please try again.'}
        </Alert>
      ) : null}

      {goals.isLoading ? (
        <div className="grid place-items-center py-16">
          <Spinner size={24} label="Loading goals" />
        </div>
      ) : goals.data && goals.data.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.data.map((goal) => (
            <GoalCard
              key={goal.id}
              name={
                <span className="flex items-center gap-2">
                  {goal.name}
                  {goal.status === 'completed' ? (
                    <Badge variant="income">Done</Badge>
                  ) : goal.status !== 'active' ? (
                    <Badge>{goal.status}</Badge>
                  ) : null}
                </span>
              }
              progressPercent={goal.progress}
              current={goal.currentAmount}
              target={goal.targetAmount}
              deadline={goal.deadline ?? undefined}
              action={
                goal.status === 'active' ? (
                  <ContributeDialog
                    goalId={goal.id}
                    goalName={goal.name}
                    trigger={
                      <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>
                        Add
                      </Button>
                    }
                  />
                ) : undefined
              }
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a first target — even a small one. Akiba keeps the running total and paces you to the date."
          action={<AddGoalDialog />}
        />
      )}
    </div>
  );
}
