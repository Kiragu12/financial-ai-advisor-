import {
  ArrowDownRight,
  ArrowUpRight,
  Coffee,
  GraduationCap,
  Home,
  PiggyBank,
  Plus,
  ShoppingBag,
  Sparkles,
  Wallet,
} from 'lucide-react';

const surfaces = [
  { name: 'bg', label: 'Page background', cssVar: '--bg', tw: 'bg-bg', textOn: 'text-ink' },
  { name: 'surface', label: 'Surface', cssVar: '--surface', tw: 'bg-surface', textOn: 'text-ink' },
  { name: 'surface-2', label: 'Surface 2', cssVar: '--surface-2', tw: 'bg-surface-2', textOn: 'text-ink' },
  { name: 'surface-3', label: 'Surface 3', cssVar: '--surface-3', tw: 'bg-surface-3', textOn: 'text-ink' },
];

const inks = [
  { name: 'ink', cssVar: '--ink' },
  { name: 'ink-2', cssVar: '--ink-2' },
  { name: 'ink-3', cssVar: '--ink-3' },
];

const brand = [
  { name: 'primary', cssVar: '--primary' },
  { name: 'primary-press', cssVar: '--primary-press' },
  { name: 'primary-soft', cssVar: '--primary-soft' },
  { name: 'primary-soft-2', cssVar: '--primary-soft-2' },
  { name: 'income', cssVar: '--income' },
  { name: 'income-soft', cssVar: '--income-soft' },
  { name: 'expense', cssVar: '--expense' },
  { name: 'expense-soft', cssVar: '--expense-soft' },
];

const tints = [
  'green',
  'emerald',
  'blue',
  'violet',
  'amber',
  'teal',
  'pink',
  'lime',
  'red',
] as const;

const radii = [
  { name: '--r-sm', px: 11 },
  { name: '--r', px: 16 },
  { name: '--r-lg', px: 22 },
  { name: '--r-pill', px: 999 },
];

const shadows = [
  { name: '--shadow-sm', tw: 'shadow-token-sm' },
  { name: '--shadow', tw: 'shadow-token' },
  { name: '--shadow-lg', tw: 'shadow-token-lg' },
];

export function Sandbox() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1180px] px-8 py-10">
        <header className="mb-10">
          <p className="eyebrow">Phase 1</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Design tokens</h1>
          <p className="mt-2 max-w-2xl text-ink-2">
            Every colour, font, radius, shadow and component class the rest of the app will be
            built against. Source of truth lives in <code className="font-mono text-[13px]">client/src/styles/index.css</code>.
          </p>
        </header>

        <Section title="Typography">
          <div className="card card-pad space-y-4">
            <div>
              <p className="eyebrow">Body — Hanken Grotesk</p>
              <p className="mt-2 text-4xl font-semibold text-ink">The quick brown fox jumps</p>
              <p className="text-2xl font-semibold text-ink">The quick brown fox jumps</p>
              <p className="text-base text-ink">The quick brown fox jumps over the lazy dog.</p>
              <p className="text-sm text-ink-2">Muted body — secondary supporting copy.</p>
              <p className="text-xs text-ink-3">Faint — captions and timestamps.</p>
            </div>
            <div className="divider" />
            <div>
              <p className="eyebrow">Display — Space Grotesk (numerals)</p>
              <p className="num mt-2 text-4xl font-semibold text-ink">KES 124,580.00</p>
              <p className="num text-2xl font-semibold text-income">+ KES 12,400.00</p>
              <p className="num text-2xl font-semibold text-expense">− KES 3,250.50</p>
            </div>
          </div>
        </Section>

        <Section title="Surfaces">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {surfaces.map((s) => (
              <div
                key={s.name}
                className={`rounded-card border border-line p-5 ${s.tw} ${s.textOn}`}
              >
                <p className="font-mono text-xs text-ink-3">{s.cssVar}</p>
                <p className="mt-1 font-semibold">{s.name}</p>
                <p className="mt-1 text-sm text-ink-2">{s.label}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Text colours">
          <div className="card card-pad flex flex-wrap gap-6">
            {inks.map((i) => (
              <div key={i.name}>
                <p className="font-mono text-xs text-ink-3">{i.cssVar}</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: `var(${i.cssVar})` }}>
                  {i.name}
                </p>
                <p className="text-sm" style={{ color: `var(${i.cssVar})` }}>
                  The quick brown fox.
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Brand &amp; semantic">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {brand.map((c) => (
              <Swatch key={c.name} name={c.name} cssVar={c.cssVar} />
            ))}
          </div>
        </Section>

        <Section title="Category tints">
          <div className="card card-pad">
            <div className="flex flex-wrap gap-4">
              {tints.map((t) => (
                <div key={t} className="flex flex-col items-center gap-2">
                  <div className={`tint-${t} ic h-12 w-12`}>
                    <Sparkles size={20} />
                  </div>
                  <p className="font-mono text-xs text-ink-3">t-{t}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Radii">
          <div className="card card-pad flex flex-wrap items-end gap-6">
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="h-20 w-20 bg-primary-soft-2"
                  style={{ borderRadius: `var(${r.name})` }}
                />
                <p className="font-mono text-xs text-ink-3">{r.name}</p>
                <p className="text-xs text-ink-2">{r.px === 999 ? 'pill' : `${r.px}px`}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Shadows">
          <div className="grid gap-4 sm:grid-cols-3">
            {shadows.map((s) => (
              <div
                key={s.name}
                className={`rounded-card bg-surface p-6 ${s.tw}`}
              >
                <p className="font-mono text-xs text-ink-3">{s.name}</p>
                <p className="mt-1 font-semibold text-ink">Card surface</p>
                <p className="text-sm text-ink-2">Hover to feel weight.</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons (design classes)">
          <div className="card card-pad flex flex-wrap gap-3">
            <button className="btn btn-primary">
              <Plus size={16} /> Add transaction
            </button>
            <button className="btn">Default</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-primary btn-sm">Primary small</button>
            <button className="btn btn-sm">Default small</button>
            <button className="btn btn-icon" aria-label="Icon button">
              <Plus size={18} />
            </button>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="card card-pad grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="sandbox-email">Email</label>
              <input id="sandbox-email" className="input" placeholder="you@strathmore.edu" />
            </div>
            <div className="field">
              <label htmlFor="sandbox-pwd">Password</label>
              <input id="sandbox-pwd" type="password" className="input" placeholder="••••••••" />
            </div>
          </div>
        </Section>

        <Section title="Chips, progress, eyebrow, dividers">
          <div className="card card-pad space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="chip">All transactions</span>
              <span className="chip">Food &amp; drink</span>
              <span className="chip">Transport</span>
              <span className="chip">This month</span>
            </div>
            <div>
              <p className="eyebrow">Goal progress</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="bar tint-primary flex-1">
                  <span style={{ width: '64%' }} />
                </div>
                <p className="num text-sm font-semibold text-ink">64%</p>
              </div>
            </div>
            <div className="divider" />
            <div className="flex items-center gap-2 text-sm text-ink-2">
              <span className="dot tint-primary" />
              Default dot uses primary.
            </div>
          </div>
        </Section>

        <Section title="Icon badges (Lucide @ stroke 1.9)">
          <div className="card card-pad flex flex-wrap gap-4">
            <IconBadge tint="green" icon={<Wallet size={20} />} label="Wallet" />
            <IconBadge tint="blue" icon={<ArrowUpRight size={20} />} label="Income" />
            <IconBadge tint="red" icon={<ArrowDownRight size={20} />} label="Expense" />
            <IconBadge tint="amber" icon={<Coffee size={20} />} label="Food" />
            <IconBadge tint="violet" icon={<GraduationCap size={20} />} label="Education" />
            <IconBadge tint="teal" icon={<Home size={20} />} label="Rent" />
            <IconBadge tint="pink" icon={<ShoppingBag size={20} />} label="Shopping" />
            <IconBadge tint="emerald" icon={<PiggyBank size={20} />} label="Savings" />
          </div>
        </Section>

        <footer className="mt-12 border-t border-line pt-6 text-sm text-ink-3">
          Sandbox is dev-only. Phase 2 will replace the design classes shown here with proper
          React primitives so feature code never types these strings.
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-3">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-line shadow-token-sm">
      <div className="h-16" style={{ background: `var(${cssVar})` }} />
      <div className="bg-surface p-3">
        <p className="font-mono text-xs text-ink-3">{cssVar}</p>
        <p className="font-semibold text-ink">{name}</p>
      </div>
    </div>
  );
}

function IconBadge({
  tint,
  icon,
  label,
}: {
  tint: (typeof tints)[number];
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`tint-${tint} ic h-12 w-12`}>{icon}</div>
      <p className="text-xs text-ink-2">{label}</p>
    </div>
  );
}
