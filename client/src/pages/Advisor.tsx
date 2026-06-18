import { Alert } from '../components/ui/alert';
import { PageHeader } from '../components/layout/PageHeader';

export function Advisor() {
  return (
    <>
      <PageHeader
        eyebrow="AI"
        title="Advisor"
        description="Friendly, judgement-free nudges. Ask about your budget, your goals or last month&rsquo;s spending."
      />
      <Alert variant="warn" title="Waiting on the backend">
        The advisor calls Claude server-side via Paul&rsquo;s backend — never directly from the
        browser. Chat will work as soon as the advisor endpoints exist.
      </Alert>
    </>
  );
}
