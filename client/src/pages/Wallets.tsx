import { Plus } from 'lucide-react';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/layout/PageHeader';

export function Wallets() {
  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Wallets"
        description="M-Pesa, bank, cash, savings — every account in one place."
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} />} disabled>
            New wallet
          </Button>
        }
      />
      <Alert variant="warn" title="Waiting on the backend">
        Wallet create/list/update endpoints aren&rsquo;t built yet. This page will render the
        real list (and balances) the moment Paul ships <code>GET /api/wallets</code>.
      </Alert>
    </>
  );
}
