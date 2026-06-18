import { PiggyBank, Target, Trophy } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { BackendNotReady } from '../components/finance/BackendNotReady';
import { EmptyState } from '../components/finance/EmptyState';
import { StatCard } from '../components/finance/StatCard';
import { AddGoalDialog } from '../features/goals/AddGoalDialog';

export function Goals() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Saving"
        title="Goals"
        description="Set a target — a laptop, an emergency fund, a trip — and watch the progress add up."
        actions={<AddGoalDialog />}
      />

      <BackendNotReady endpoint="GET /api/goals">
        Progress is a server-computed value. The cards below render their empty state until then.
      </BackendNotReady>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total saved" icon={PiggyBank} tint="emerald" />
        <StatCard label="Active goals" icon={Target} tint="green" />
        <StatCard label="Completed goals" icon={Trophy} tint="violet" />
      </section>

      <section>
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a first target — even a small one. Akiba keeps the running total and paces you to the date."
          action={<AddGoalDialog />}
        />
      </section>
    </div>
  );
}
