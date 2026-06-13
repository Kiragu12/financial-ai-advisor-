# Akiba Sample Design Review

Source file:

- `Akiba Finance Tracker (shareable) (1).html`

## Purpose

This file is a sample frontend prototype for the personal finance tracker. It is not the final application architecture, but it gives a useful direction for visual style, screen layout, and feature expectations.

## What The Prototype Contains

Main screens:

- Authentication screen.
- Dashboard.
- Wallets.
- Transactions.
- Savings Goals.
- AI Advisor.

Main UI patterns:

- Left sidebar navigation.
- Sticky top bar.
- Dashboard summary cards.
- Wallet cards.
- Transaction rows.
- Spending category visualization.
- Goal progress cards.
- AI advisor chat with a right-side proactive insights rail.
- Add transaction modal.
- Transfer modal.

Sample domain concepts:

- Student profile.
- KES currency.
- M-Pesa, bank, cash, and savings wallet examples.
- Student-friendly categories such as food, transport, rent, airtime, education, health, entertainment, and shopping.
- Savings goals such as laptop, emergency fund, and trip.
- Advisor suggestions based on recent spending.

## Design Direction To Keep

- The name `Akiba` works well for the product.
- The green finance-focused brand direction fits the project.
- The sidebar layout is a good fit for a finance dashboard.
- The dashboard correctly emphasizes total balance, income, spending, recent activity, spending categories, goals, and advisor insight.
- The advisor screen is strong because it combines chat with proactive financial insights.
- The prototype uses Kenyan student context well: KES, M-Pesa, HELB, rent, transport, airtime, and campus food spending.
- The modals for adding transactions and transfers match the workflows in our architecture.

## What Should Change In The Real App

- The real app should be built as a proper React project, not a bundled single HTML prototype.
- Mock data must be replaced with backend API calls.
- The frontend should not compute trusted balances; backend services must compute and persist balance changes.
- The AI advisor should not use hardcoded replies; it should call the backend advisor API.
- Auth should use real registration, login, session/token handling, and protected routes.
- Forms need real validation, loading states, error states, and success feedback.
- The layout needs responsive behavior for smaller screens.
- Inline styles should become reusable components and Tailwind classes where appropriate.
- The design uses fairly rounded cards; our final UI should keep the friendly feel but avoid excessive card nesting.

## Suggested Frontend Architecture Mapping

```text
client/src/
  app/
    App.jsx
    routes.jsx
  features/
    auth/
    dashboard/
    wallets/
    transactions/
    transfers/
    goals/
    advisor/
  components/
    layout/
    ui/
    finance/
  lib/
    api.js
    formatters.js
    validation.js
```

Prototype-to-real mapping:

- `Auth` -> `features/auth`
- `Sidebar` and `Topbar` -> `components/layout`
- `Dashboard` -> `features/dashboard`
- `Wallets` -> `features/wallets`
- `Transactions` and `AddTransaction` -> `features/transactions`
- `Transfer` -> `features/transfers`
- `Goals` -> `features/goals`
- `Advisor` -> `features/advisor`
- `IconBadge`, `TxRow`, `StatCard`, progress components -> reusable UI/finance components

## Design Risks To Watch

- Dashboard can become visually crowded if we add too many widgets too soon.
- The prototype has many inline styles, which would be hard to maintain in production.
- The advisor screen must clearly state that the advice is educational and not regulated financial advice.
- Savings wallet and savings goals need a clear model so users understand whether goal money is deducted from spendable wallet balances.
- Search, notifications, export, and settings appear in the prototype but should not be built until the core flows work.

## Recommendation

Use the Akiba prototype as a visual and product reference, not as production code.

The best path is:

1. Keep the screen structure and product language.
2. Rebuild it cleanly in React with feature folders.
3. Connect each screen to real backend APIs as each vertical slice is implemented.
4. Preserve the student/Kenya context because it strongly matches the proposal.
