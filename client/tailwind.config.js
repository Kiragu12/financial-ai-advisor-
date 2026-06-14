/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy hex palette — kept temporarily while Phase 1 lands.
        // New work should reference the CSS variables in src/styles/index.css
        // via the semantic tokens below or arbitrary values.
        akiba: {
          50: '#edfdf5',
          100: '#d4f7e4',
          500: '#1f8a5b',
          600: '#16724b',
          700: '#125b3d',
        },
        cream: '#faf9f5',

        // Semantic design tokens, sourced from the prototype's OKLCH vars.
        // Opacity modifiers (e.g. `bg-primary/50`) are not supported because
        // these are var() references — fall back to the raw class
        // (`bg-[oklch(56%_0.13_158_/_0.5)]`) on the rare occasion you need one.
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        line: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          press: 'var(--primary-press)',
          soft: 'var(--primary-soft)',
          'soft-2': 'var(--primary-soft-2)',
        },
        income: {
          DEFAULT: 'var(--income)',
          soft: 'var(--income-soft)',
        },
        expense: {
          DEFAULT: 'var(--expense)',
          soft: 'var(--expense-soft)',
        },
        tint: {
          green: 'var(--t-green)',
          emerald: 'var(--t-emerald)',
          blue: 'var(--t-blue)',
          violet: 'var(--t-violet)',
          amber: 'var(--t-amber)',
          teal: 'var(--t-teal)',
          pink: 'var(--t-pink)',
          lime: 'var(--t-lime)',
          red: 'var(--t-red)',
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--r)',
        'card-sm': 'var(--r-sm)',
        'card-lg': 'var(--r-lg)',
        pill: 'var(--r-pill)',
      },
      boxShadow: {
        token: 'var(--shadow)',
        'token-sm': 'var(--shadow-sm)',
        'token-lg': 'var(--shadow-lg)',
        ring: 'var(--ring)',
      },
      spacing: {
        sidebar: 'var(--sidebar-w)',
      },
    },
  },
  plugins: [],
};
