import {
  ArrowRight,
  Brain,
  CheckCircle2,
  PiggyBank,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function Landing() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </main>
  );
}

/* ───────────────────── Header ───────────────────── */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
        <Brand />
        <nav className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Get started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Akiba — home">
      <span className="grid h-10 w-10 place-items-center rounded-card-sm bg-primary text-white shadow-token-sm">
        <PiggyBank size={20} strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-semibold text-ink">Akiba</span>
        <span className="text-[11px] uppercase tracking-wider text-ink-3">Finance tracker</span>
      </span>
    </Link>
  );
}

/* ───────────────────── Hero ───────────────────── */

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1180px] gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <Badge variant="primary">Built for university students</Badge>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          Track every shilling.
          <br />
          Save towards what matters.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
          Akiba is a personal finance tracker built for Kenyan university students. Bring your
          M-Pesa, bank, cash and savings into one view, log your spending in seconds, and get
          gentle, judgement-free nudges from an AI advisor when you need them.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/register">
            <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
              Get started — free in beta
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost">I already have an account</Button>
          </Link>
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-3">
          <span className="dot tint-primary" />
          Free while in beta · Built in Nairobi
        </p>
      </div>

      <HeroVisual />
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-card-lg bg-gradient-to-br from-primary-soft via-bg to-primary-soft-2 blur-2xl"
      />
      <Card className="relative overflow-hidden" padded={false}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <p className="eyebrow">Sample dashboard</p>
          <Badge variant="income">+12% this month</Badge>
        </div>
        <div className="space-y-5 px-6 py-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-3">
              Aggregate balance
            </p>
            <p className="num mt-1 text-[44px] font-semibold leading-none tracking-tight text-ink">
              KES 87,430
            </p>
          </div>
          <div className="space-y-2.5">
            <PreviewRow tint="green" label="M-Pesa" amount="KES 24,200" />
            <PreviewRow tint="blue" label="Bank" amount="KES 51,500" />
            <PreviewRow tint="amber" label="Cash" amount="KES 4,230" />
            <PreviewRow tint="emerald" label="Savings" amount="KES 7,500" />
          </div>
        </div>
      </Card>
      <p className="mt-3 text-center text-xs text-ink-3">
        Illustration only — your real data appears once you sign in.
      </p>
    </div>
  );
}

function PreviewRow({ tint, label, amount }: { tint: string; label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between rounded-card-sm border border-line bg-surface px-3 py-2.5">
      <span className="flex items-center gap-3">
        <span className={`tint-${tint} ic h-9 w-9`}>
          <Wallet size={16} />
        </span>
        <span className="text-sm font-medium text-ink">{label}</span>
      </span>
      <span className="num text-sm font-semibold text-ink">{amount}</span>
    </div>
  );
}

/* ───────────────────── Features ───────────────────── */

const features = [
  {
    tint: 'green' as const,
    icon: Wallet,
    title: 'All your money, one view',
    body: 'M-Pesa, bank, cash, savings. See balances and how each wallet moves, side by side.',
  },
  {
    tint: 'blue' as const,
    icon: Sparkles,
    title: 'Log spending in seconds',
    body: 'Quick entry with smart categories. Spot patterns and habits without spreadsheets.',
  },
  {
    tint: 'violet' as const,
    icon: Brain,
    title: 'AI advisor, on your side',
    body: 'Friendly, judgement-free nudges. Ask about your budget, goals or last month&rsquo;s spending.',
  },
] as const;

function Features() {
  return (
    <section className="border-t border-line bg-surface-2/40">
      <div className="mx-auto max-w-[1180px] px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">What it does</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            A money tracker that fits how students actually spend.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title}>
                <span className={`tint-${f.tint} ic mb-4 inline-grid h-12 w-12`}>
                  <Icon size={22} />
                </span>
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p
                  className="mt-2 text-sm leading-6 text-ink-2"
                  dangerouslySetInnerHTML={{ __html: f.body }}
                />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── How it works ───────────────────── */

const steps = [
  {
    n: 1,
    icon: Wallet,
    title: 'Add your wallets',
    body: 'Tell Akiba which M-Pesa, bank, cash and savings you use. Two minutes, done.',
  },
  {
    n: 2,
    icon: Sparkles,
    title: 'Log your spending',
    body: 'Tap in transactions as they happen. Akiba picks up the patterns automatically.',
  },
  {
    n: 3,
    icon: Target,
    title: 'Save towards what matters',
    body: 'Set goals — a laptop, a trip, an emergency fund — and watch progress add up.',
  },
] as const;

function HowItWorks() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1180px] px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Three steps from messy to clear.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex flex-col gap-3">
                <span className="flex items-center gap-3">
                  <span className="num grid h-9 w-9 place-items-center rounded-pill bg-primary text-white">
                    {s.n}
                  </span>
                  <Icon className="text-ink-3" size={20} />
                </span>
                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                <p className="text-sm leading-6 text-ink-2">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Final CTA ───────────────────── */

function FinalCta() {
  const reassurance = [
    'Free while in beta',
    'No credit card needed',
    'Built in Nairobi',
  ];

  return (
    <section className="border-t border-line bg-primary-soft/40">
      <div className="mx-auto max-w-[1180px] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Get going</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Start your first wallet today.
          </h2>
          <p className="mt-3 text-ink-2">
            Akiba is in beta — built quietly in Nairobi alongside students like you. Tell us what
            you wish a money app would do, and we&rsquo;ll build it.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/register">
              <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
                Get started — it&rsquo;s free
              </Button>
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-2">
            {reassurance.map((r) => (
              <li key={r} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-primary" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Footer ───────────────────── */

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-6 py-8 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-card-sm bg-primary text-white">
            <PiggyBank size={14} strokeWidth={2.2} />
          </span>
          <span>
            Akiba · Built in Nairobi · &copy; {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/about" className="hover:text-ink-2">
            About
          </Link>
          <Link to="/privacy" className="hover:text-ink-2">
            Privacy
          </Link>
          <Link to="/contact" className="hover:text-ink-2">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
