import { ArrowLeft, Construction } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function NotReady() {
  const location = useLocation();
  const name = humanizePath(location.pathname);

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center px-6">
        <Card className="w-full text-center">
          <Construction size={28} className="mx-auto text-primary" />
          <p className="eyebrow mt-4">Coming soon</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {name} isn&rsquo;t built yet
          </h1>
          <p className="mt-3 text-ink-2">
            We&rsquo;re building Akiba feature by feature against Paul&rsquo;s backend. This page lands
            in a later phase. Check back soon.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/">
              <Button variant="ghost" leftIcon={<ArrowLeft size={16} />}>
                Back to home
              </Button>
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-ink-3">{location.pathname}</p>
        </Card>
      </div>
    </main>
  );
}

function humanizePath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'This page';
  const last = segments[segments.length - 1] ?? '';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
