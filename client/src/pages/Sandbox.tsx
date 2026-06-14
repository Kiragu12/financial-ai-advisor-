import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Coffee,
  GraduationCap,
  Home,
  LogOut,
  Mail,
  PiggyBank,
  Plus,
  Settings,
  ShoppingBag,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react';
import { Alert } from '../components/ui/alert';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { ErrorText, Field, HelperText } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { Spinner } from '../components/ui/spinner';

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
  { name: 'warn', cssVar: '--warn' },
  { name: 'warn-soft', cssVar: '--warn-soft' },
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
          <p className="eyebrow">Phase 1 + 2</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Design tokens &amp; UI primitives
          </h1>
          <p className="mt-2 max-w-2xl text-ink-2">
            Phase 1: every colour, font, radius, shadow and motion token, sourced from{' '}
            <code className="font-mono text-[13px]">client/src/styles/index.css</code>.<br />
            Phase 2: React primitives in{' '}
            <code className="font-mono text-[13px]">client/src/components/ui/</code> that wrap
            those tokens.
          </p>
        </header>

        <Section title="Typography">
          <Card>
            <div className="space-y-4">
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
          </Card>
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
          <Card>
            <div className="flex flex-wrap gap-6">
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
          </Card>
        </Section>

        <Section title="Brand &amp; semantic">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {brand.map((c) => (
              <Swatch key={c.name} name={c.name} cssVar={c.cssVar} />
            ))}
          </div>
        </Section>

        <Section title="Category tints">
          <Card>
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
          </Card>
        </Section>

        <Section title="Radii">
          <Card>
            <div className="flex flex-wrap items-end gap-6">
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
          </Card>
        </Section>

        <Section title="Shadows">
          <div className="grid gap-4 sm:grid-cols-3">
            {shadows.map((s) => (
              <div key={s.name} className={`rounded-card bg-surface p-6 ${s.tw}`}>
                <p className="font-mono text-xs text-ink-3">{s.name}</p>
                <p className="mt-1 font-semibold text-ink">Card surface</p>
                <p className="text-sm text-ink-2">Hover to feel weight.</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="my-12 border-t border-line pt-12">
          <p className="eyebrow">Phase 2</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">UI primitives</h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            React components in{' '}
            <code className="font-mono text-[13px]">src/components/ui/</code>. Feature code
            should import these — not the raw <code className="font-mono text-[13px]">.btn</code>{' '}
            classes.
          </p>
        </div>

        <Section title="Button">
          <Card>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leftIcon={<Plus size={16} />}>
                  Add transaction
                </Button>
                <Button>Default</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="primary" loading>
                  Saving
                </Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">
                  Primary small
                </Button>
                <Button size="sm">Small</Button>
                <Button variant="ghost" size="sm">
                  Ghost small
                </Button>
                <Button size="icon" aria-label="Add" variant="primary">
                  <Plus size={18} />
                </Button>
                <Button size="icon" aria-label="Settings">
                  <Settings size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Input, Label, Field, HelperText, ErrorText">
          <Card>
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <Field>
                <Label htmlFor="sandbox-email">Email</Label>
                <Input
                  id="sandbox-email"
                  type="email"
                  placeholder="you@strathmore.edu"
                  aria-describedby="sandbox-email-help"
                />
                <HelperText id="sandbox-email-help">Use your school email.</HelperText>
              </Field>
              <Field>
                <Label htmlFor="sandbox-pwd">Password</Label>
                <Input
                  id="sandbox-pwd"
                  type="password"
                  placeholder="••••••••"
                  invalid
                  aria-describedby="sandbox-pwd-err"
                />
                <ErrorText id="sandbox-pwd-err">Must be at least 8 characters.</ErrorText>
              </Field>
              <Field>
                <Label htmlFor="sandbox-disabled">Disabled</Label>
                <Input id="sandbox-disabled" value="—" disabled readOnly />
                <HelperText>Locked while the goal is paused.</HelperText>
              </Field>
            </form>
          </Card>
        </Section>

        <Section title="Card">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <p className="eyebrow">Padded</p>
              <p className="mt-1 text-ink-2">Default (padded) card surface.</p>
            </Card>
            <Card padded={false}>
              <div className="border-b border-line p-5">
                <p className="eyebrow">Unpadded</p>
              </div>
              <div className="p-5">
                <p className="text-ink-2">Useful when the card hosts its own internal layout.</p>
              </div>
            </Card>
            <Card className="bg-primary-soft">
              <p className="eyebrow text-primary">Tinted</p>
              <p className="mt-1 text-ink-2">Override background via className.</p>
            </Card>
          </div>
        </Section>

        <Section title="Badge">
          <Card>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="income">Income</Badge>
              <Badge variant="expense">Expense</Badge>
              <Badge variant="warn">Warning</Badge>
              <Badge>
                <Mail size={12} /> With icon
              </Badge>
            </div>
          </Card>
        </Section>

        <Section title="Avatar">
          <Card>
            <div className="flex flex-wrap items-end gap-4">
              <Avatar name="Amara Njoroge" size="sm" />
              <Avatar name="Amara Njoroge" />
              <Avatar name="Amara Njoroge" size="lg" />
              <Avatar name="Paul" />
              <Avatar name="" />
            </div>
          </Card>
        </Section>

        <Section title="Alert">
          <div className="grid gap-3">
            <Alert variant="info" title="Heads up">
              Wallet balances refresh every time a transaction is recorded.
            </Alert>
            <Alert variant="success" title="Saved">
              Your goal contribution was added.
            </Alert>
            <Alert variant="warn" title="Backend not ready">
              The login endpoint goes live when Paul ships <code>POST /api/auth/login</code>.
            </Alert>
            <Alert variant="error" title="Couldn&rsquo;t load wallets">
              Network request failed. Try again.
            </Alert>
          </div>
        </Section>

        <Section title="Spinner &amp; Skeleton">
          <Card>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-3">Spinner</p>
                <div className="flex items-center gap-4">
                  <Spinner size={14} />
                  <Spinner />
                  <Spinner size={28} />
                  <span className="flex items-center gap-2 text-sm text-ink-2">
                    <Spinner size={14} /> Loading wallets…
                  </span>
                </div>
              </div>
              <div>
                <p className="eyebrow mb-3">Skeleton</p>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="DropdownMenu">
          <Card>
            <div className="flex flex-wrap items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" rightIcon={<ChevronDown size={16} />}>
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                  <DropdownMenuItem disabled>
                    <Avatar name="Amara Njoroge" size="sm" />
                    <span className="flex flex-col">
                      <span className="font-medium">Amara Njoroge</span>
                      <span className="text-xs text-ink-3">amara@strathmore.edu</span>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User size={16} /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings size={16} /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut size={16} /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-sm text-ink-3">
                Radix-backed. Keyboard nav, focus management and click-outside built in.
              </p>
            </div>
          </Card>
        </Section>

        <div className="my-12 border-t border-line pt-12">
          <p className="eyebrow">Reference</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Design classes (raw)
          </h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            The CSS classes the primitives wrap. Useful when sanity-checking visual fidelity.
          </p>
        </div>

        <Section title="Buttons (design classes)">
          <Card>
            <div className="flex flex-wrap gap-3">
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
          </Card>
        </Section>

        <Section title="Chips, progress, dividers">
          <Card>
            <div className="space-y-5">
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
          </Card>
        </Section>

        <Section title="Icon badges (Lucide @ stroke 1.9)">
          <Card>
            <div className="flex flex-wrap gap-4">
              <IconBadge tint="green" icon={<Wallet size={20} />} label="Wallet" />
              <IconBadge tint="blue" icon={<ArrowUpRight size={20} />} label="Income" />
              <IconBadge tint="red" icon={<ArrowDownRight size={20} />} label="Expense" />
              <IconBadge tint="amber" icon={<Coffee size={20} />} label="Food" />
              <IconBadge tint="violet" icon={<GraduationCap size={20} />} label="Education" />
              <IconBadge tint="teal" icon={<Home size={20} />} label="Rent" />
              <IconBadge tint="pink" icon={<ShoppingBag size={20} />} label="Shopping" />
              <IconBadge tint="emerald" icon={<PiggyBank size={20} />} label="Savings" />
            </div>
          </Card>
        </Section>

        <footer className="mt-12 border-t border-line pt-6 text-sm text-ink-3">
          Sandbox is dev-only. Phase 3 wires the app shell + routes.
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-3">{title}</h3>
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
