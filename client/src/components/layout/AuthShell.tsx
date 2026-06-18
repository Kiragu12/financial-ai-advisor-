import { PiggyBank } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';

interface AuthShellProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary-soft-2 opacity-60 blur-3xl"
      />
      <div className="mx-auto flex min-h-screen max-w-[520px] flex-col px-6 py-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Akiba — home">
          <span className="grid h-10 w-10 place-items-center rounded-card-sm bg-primary text-white shadow-token-sm">
            <PiggyBank size={20} strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-ink">Akiba</span>
            <span className="text-[11px] uppercase tracking-wider text-ink-3">
              Finance tracker
            </span>
          </span>
        </Link>

        <div className="flex flex-1 flex-col justify-center py-10">
          <Card className="w-full">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
            {description ? (
              <p className="mt-2 text-sm text-ink-2">{description}</p>
            ) : null}
            <div className="mt-6">{children}</div>
          </Card>
          {footer ? (
            <p className="mt-6 text-center text-sm text-ink-2">{footer}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
