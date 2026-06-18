import { Plus } from 'lucide-react';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/layout/PageHeader';

export function Transactions() {
  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="Transactions"
        description="Every income and expense across your wallets. Search, filter and log a new entry in seconds."
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} />} disabled>
            Add transaction
          </Button>
        }
      />
      <Alert variant="warn" title="Waiting on the backend">
        Transaction list/create/update endpoints land in a later phase. We won&rsquo;t render
        anything here until <code>GET /api/transactions</code> exists.
      </Alert>
    </>
  );
}
