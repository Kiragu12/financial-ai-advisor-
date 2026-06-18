import { Plus } from 'lucide-react';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/layout/PageHeader';

export function Goals() {
  return (
    <>
      <PageHeader
        eyebrow="Saving"
        title="Goals"
        description="Set a target — a laptop, an emergency fund, a trip — and watch the progress add up."
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} />} disabled>
            New goal
          </Button>
        }
      />
      <Alert variant="warn" title="Waiting on the backend">
        Goal progress is a server-computed value. We&rsquo;ll render it as soon as Paul ships
        <code> GET /api/goals</code>.
      </Alert>
    </>
  );
}
