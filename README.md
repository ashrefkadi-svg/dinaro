# DINARO+

**YOUR MONEY. YOUR FUTURE.**

DINARO+ is a personal and family financial management platform, beginning with the needs of users in Algeria and designed with an architecture that can expand internationally.

## Product principles

- **Clarity first:** approachable for beginners; advanced controls appear when needed.
- **One financial source of truth:** accounts, transactions, budgets, goals, and reports must use consistent underlying data.
- **Personal and shared spaces:** personal finances remain separate from family finances, with explicit membership and permissions.
- **Local-first product decisions:** DZD is the initial base currency; international currencies and localization are planned.
- **Privacy by design:** collect the minimum data required, protect credentials, and never commit secrets or real financial records.
- **Accessible, responsive interaction:** mobile-first layouts, keyboard support, readable contrast, and reduced-motion support.

## Initial product scope

1. Financial foundation: accounts, income, expenses, transfers, balances, and ledger integrity.
2. Dashboard: balance overview, cash flow, recent activity, budgets, and goals.
3. Planning: budgets, savings goals, and useful financial summaries.
4. DINARO Scan: assisted entry from receipts and financial documents, with user confirmation before saving.
5. Identity and security: authentication, sessions, privacy controls, and personal/family spaces.

AI assistant features are intentionally out of the initial scope.

## Engineering principles

- Type-safe application code and clear domain boundaries.
- Validate all untrusted input at system boundaries.
- Store monetary values in integer minor units (or an explicitly documented decimal representation); never use floating-point arithmetic for financial calculations.
- Keep UI state separate from authoritative financial records.
- Add automated tests for financial calculations, authorization, and critical user flows.
- Document migrations and preserve backward compatibility where practical.

## Current frontend prototype

The first responsive React + Vite interface is available in `src/`.

- Arabic-first RTL dashboard with an emerald dark theme.
- Overview cards, cash-flow chart, monthly budget, recent transactions, and a savings goal.
- Prototype navigation for transactions, accounts, budgets, and goals.
- Add-transaction interaction using in-memory demonstration data.
- Responsive sidebar and reduced-motion support.

**Important:** displayed balances and chart values are demonstration data. The current interface does not persist transactions or connect to the financial API yet.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

See [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) for visual tokens and the role of each UI library.

## Security

Do not commit API keys, passwords, session tokens, private certificates, production environment files, or real personal/financial data. Use environment variables and provide sanitized examples only.

## License

No license has been selected yet. Until one is added, all rights are reserved by the copyright holder.
