# Akiba — Design Tokens

These are the visual tokens the frontend builds against. The source of truth
lives in `client/src/styles/index.css` as CSS variables; this document is the
human-readable index.

Tokens were ported from the Claude Design prototype
(`Akiba Finance Tracker (shareable) (1).html`). Where the prototype used OKLCH
we kept OKLCH — modern browsers support it natively and it produces more
perceptually-even tones than the hex equivalents.

## Fonts

| Use | Family | Weights |
|---|---|---|
| Body, UI | `Hanken Grotesk`, system-ui, sans-serif | 400, 500, 600, 700 |
| Numerals (`.num`) | `Space Grotesk`, system-ui, sans-serif | 400, 500, 600, 700 |

Loaded from Google Fonts in `client/index.html`. Numerals use
`font-feature-settings: "tnum" 1` so columns of money line up.

Tailwind: `font-sans` (body), `font-display` (numerals).

## Type baseline

- `body`: 15px / 1.5
- Smoothing: `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`

## Colours

All colours are CSS variables; Tailwind exposes semantic aliases.

### Surfaces

| Token | CSS var | OKLCH | Tailwind |
|---|---|---|---|
| Page background | `--bg` | `oklch(98.2% 0.006 150)` | `bg-bg` |
| Surface (cards) | `--surface` | `#ffffff` | `bg-surface` |
| Surface 2 | `--surface-2` | `oklch(97.4% 0.008 150)` | `bg-surface-2` |
| Surface 3 | `--surface-3` | `oklch(95.6% 0.01 150)` | `bg-surface-3` |
| Border | `--border` | `oklch(91.5% 0.009 150)` | `border-line` |
| Border (strong) | `--border-strong` | `oklch(86% 0.012 150)` | `border-line-strong` |

### Text

| Token | CSS var | OKLCH | Tailwind |
|---|---|---|---|
| Ink (primary) | `--ink` | `oklch(26% 0.02 158)` | `text-ink` |
| Ink 2 (muted) | `--ink-2` | `oklch(48% 0.016 158)` | `text-ink-2` |
| Ink 3 (faint) | `--ink-3` | `oklch(63% 0.012 158)` | `text-ink-3` |

### Brand + semantic

| Token | CSS var | OKLCH | Tailwind |
|---|---|---|---|
| Primary | `--primary` | `oklch(56% 0.13 158)` | `bg-primary` / `text-primary` |
| Primary pressed | `--primary-press` | `oklch(50% 0.13 158)` | `bg-primary-press` |
| Primary soft | `--primary-soft` | `oklch(95% 0.035 158)` | `bg-primary-soft` |
| Primary soft 2 | `--primary-soft-2` | `oklch(91% 0.05 158)` | `bg-primary-soft-2` |
| Income | `--income` | `oklch(56% 0.13 158)` | `text-income` |
| Income soft | `--income-soft` | `oklch(95% 0.035 158)` | `bg-income-soft` |
| Expense | `--expense` | `oklch(60% 0.16 28)` | `text-expense` |
| Expense soft | `--expense-soft` | `oklch(96% 0.03 28)` | `bg-expense-soft` |

### Category tints

Used for the coloured icon badges (`.tint-* .ic`) and progress bars. Identical
chroma/lightness, varied hue so they read as a family.

| Tint | OKLCH | Tailwind |
|---|---|---|
| green | `oklch(64% 0.13 150)` | `text-tint-green` |
| emerald | `oklch(62% 0.13 165)` | `text-tint-emerald` |
| blue | `oklch(64% 0.12 235)` | `text-tint-blue` |
| violet | `oklch(60% 0.13 290)` | `text-tint-violet` |
| amber | `oklch(72% 0.13 70)` | `text-tint-amber` |
| teal | `oklch(66% 0.11 195)` | `text-tint-teal` |
| pink | `oklch(66% 0.15 350)` | `text-tint-pink` |
| lime | `oklch(72% 0.13 120)` | `text-tint-lime` |
| red | `oklch(62% 0.16 25)` | `text-tint-red` |

## Radii

| Token | CSS var | Px | Tailwind | Use |
|---|---|---|---|---|
| `--r-sm` | 11 | `rounded-card-sm` | Buttons, inputs, chips |
| `--r` | 16 | `rounded-card` | Cards |
| `--r-lg` | 22 | `rounded-card-lg` | Larger surfaces / modals |
| `--r-pill` | 999 | `rounded-pill` | Chips, badges, progress bars |

## Shadows

| Token | CSS var | Tailwind |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(20,44,32,.05)` | `shadow-token-sm` |
| `--shadow` | `+ 0 10px 28px -16px rgba(20,44,32,.18)` | `shadow-token` |
| `--shadow-lg` | `+ 0 24px 60px -28px rgba(20,44,32,.28)` | `shadow-token-lg` |
| `--ring` | `0 0 0 4px var(--primary-soft-2)` | `shadow-ring` (focus ring) |

## Layout

- Sidebar width: `--sidebar-w: 248px` → Tailwind `w-sidebar`
- Page container: max-width 1180px, padding `28px 34px 64px`

## Icons

- Library: `lucide-react`
- Default stroke width: **1.9** (set on `svg.lucide` globally)
- Default sizes: 16 (inline), 20 (UI buttons), 24 (cards), 28 (avatar badges)

## Motion

- `rise` keyframe: `translateY(10px) → 0`, `420ms cubic-bezier(.2,.7,.2,1)`
- `.stagger > *`: applies `rise` at `500ms` for sequential child entrance
- All animations respect `prefers-reduced-motion: reduce` (no-op)

## Component shorthand classes (in `index.css`)

These are the design's component classes, kept verbatim. Phase 2 primitives
will wrap them so feature code never references them directly.

| Class | Purpose |
|---|---|
| `.card` / `.card-pad` | Card surface, 20px padding variant |
| `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.btn-icon` | Buttons |
| `.input` / `.field` | Form inputs and field wrapper (label + control) |
| `.chip` | Pill / chip / badge |
| `.tint-* .ic` | Coloured icon badge |
| `.bar` / `.bar > span` | Progress bar |
| `.eyebrow` | Small uppercase section labels |
| `.divider` / `.dot` | 1px line / 8px dot |
| `.num` | Tabular numerals (use for any money/count display) |
| `.rise` / `.stagger` | Entrance animation utilities |

## Visual reference

Run the app and visit [`/sandbox`](http://127.0.0.1:5274/sandbox) — every
token above is rendered there. The sandbox route is dev-only and is not
linked from the public app shell.
