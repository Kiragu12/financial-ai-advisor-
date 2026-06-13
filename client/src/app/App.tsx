import { Activity, Database, PiggyBank, Server, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getHealth, type HealthResponse } from '../lib/api';

type HealthState =
  | { status: 'loading' }
  | { status: 'online'; data: HealthResponse }
  | { status: 'offline'; message: string };

const foundations = [
  {
    icon: ShieldCheck,
    title: 'Auth foundation',
    body: 'Registration, login, hashed passwords, and protected routes will land first.',
  },
  {
    icon: Database,
    title: 'Trusted finance data',
    body: 'Wallets, transactions, transfers, and goals will be controlled by backend services.',
  },
  {
    icon: Sparkles,
    title: 'Advisor-ready context',
    body: 'The AI advisor will receive summaries from stored user data, not frontend guesses.',
  },
];

export function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    getHealth()
      .then((data) => setHealth({ status: 'online', data }))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unable to reach API';
        setHealth({ status: 'offline', message });
      });
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
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
          <HealthBadge health={health} />
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-akiba-600/20 bg-akiba-50 px-3 py-1 text-sm font-medium text-akiba-700">
              <Activity size={16} />
              Foundation scaffold is running
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              A clean base for the student finance advisor system.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              This first milestone proves the React frontend and Express backend can live in the
              same workspace and communicate through the API. Next, we build authentication as
              the first real vertical slice.
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
            <HealthPanel health={health} />
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

function HealthBadge({ health }: { health: HealthState }) {
  const online = health.status === 'online';
  const label = health.status === 'loading' ? 'Checking API' : online ? 'API online' : 'API offline';

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

function HealthPanel({ health }: { health: HealthState }) {
  if (health.status === 'loading') {
    return <p className="text-sm text-slate-600">Checking whether the backend is reachable...</p>;
  }

  if (health.status === 'offline') {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">The frontend is running, but the API is not reachable yet.</p>
        <p className="mt-2">{health.message}</p>
      </div>
    );
  }

  return (
    <dl className="grid gap-3 text-sm">
      <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
        <dt className="text-slate-500">Status</dt>
        <dd className="font-semibold text-akiba-700">{health.data.status}</dd>
      </div>
      <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
        <dt className="text-slate-500">Service</dt>
        <dd className="font-semibold">{health.data.service}</dd>
      </div>
      <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
        <dt className="text-slate-500">Environment</dt>
        <dd className="font-semibold">{health.data.environment}</dd>
      </div>
    </dl>
  );
}
