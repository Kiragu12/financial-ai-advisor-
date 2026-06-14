import { Activity, Database, PiggyBank, Server, ShieldCheck, Sparkles } from 'lucide-react';
import { useHealth } from '../api/hooks/use-health';
import { ApiError } from '../api/client';
import { formatDateTime } from '../lib/date';

const foundations = [
  {
    icon: ShieldCheck,
    title: 'Auth foundation',
    body: 'Registration, login, hashed passwords, and protected routes land first.',
  },
  {
    icon: Database,
    title: 'Trusted finance data',
    body: 'Wallets, transactions, transfers, and goals are controlled by the backend.',
  },
  {
    icon: Sparkles,
    title: 'Advisor-ready context',
    body: 'The AI advisor receives summaries from stored user data, not frontend guesses.',
  },
];

export function Landing() {
  const health = useHealth();

  return (
    <main className="min-h-screen bg-cream text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-emerald-950/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-akiba-600 text-white shadow-sm">
              <PiggyBank size={23} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-akiba-700">Akiba</p>
              <h1 className="text-xl font-semibold tracking-tight">Finance Tracker</h1>
            </div>
          </div>
          <HealthBadge query={health} />
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-akiba-600/20 bg-akiba-50 px-3 py-1 text-sm font-medium text-akiba-700">
              <Activity size={16} />
              Frontend scaffold is running
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              A clean base for the student finance advisor system.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Vite + React + TypeScript with Tailwind, TanStack Query, and React Router are wired
              up. The next vertical slice is authentication, built feature-by-feature against
              Paul&apos;s real backend.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Backend check</p>
                <h3 className="text-lg font-semibold">GET /api/health</h3>
              </div>
              <Server className="text-akiba-600" />
            </div>
            <HealthPanel query={health} />
          </div>
        </div>

        <section className="grid gap-4 pb-8 md:grid-cols-3">
          {foundations.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <item.icon className="mb-4 text-akiba-600" size={24} />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

type HealthQuery = ReturnType<typeof useHealth>;

function HealthBadge({ query }: { query: HealthQuery }) {
  const online = query.isSuccess;
  const label = query.isPending ? 'Checking API' : online ? 'API online' : 'API offline';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${
        online
          ? 'border-akiba-600/20 bg-akiba-50 text-akiba-700'
          : 'border-amber-500/20 bg-amber-50 text-amber-700'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${online ? 'bg-akiba-600' : 'bg-amber-500'}`} />
      {label}
    </span>
  );
}

function HealthPanel({ query }: { query: HealthQuery }) {
  if (query.isPending) {
    return <p className="text-sm text-slate-600">Checking whether the backend is reachable...</p>;
  }

  if (query.isError) {
    const message =
      query.error instanceof ApiError ? query.error.message : (query.error as Error).message;
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">The frontend is running, but the API is not reachable yet.</p>
        <p className="mt-2">{message}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 shadow-sm hover:bg-amber-100"
        >
          Retry
        </button>
      </div>
    );
  }

  const data = query.data;
  return (
    <dl className="grid gap-3 text-sm">
      <Row label="Status" value={data.status} highlight />
      <Row label="Service" value={data.service} />
      <Row label="Environment" value={data.environment} />
      <Row label="Server time" value={formatDateTime(data.timestamp)} />
    </dl>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-semibold ${highlight ? 'text-akiba-700' : ''}`}>{value}</dd>
    </div>
  );
}
