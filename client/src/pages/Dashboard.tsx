import { Plus } from 'lucide-react';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/layout/PageHeader';

export function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your aggregate balance, recent activity and goal progress will live here. Wired up once the backend endpoints land."
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} />} disabled>
            Add transaction
          </Button>
        }
      />
      <Alert variant="warn" title="Waiting on the backend">
        Dashboard widgets — aggregate balance, income/expense, categories, goal progress — are
        all server-computed values. They&rsquo;ll appear here once Paul ships the dashboard
        summary endpoints.
      </Alert>
    </>
  );
}
