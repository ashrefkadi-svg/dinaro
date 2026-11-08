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

## Algeria finance intelligence\n\n- Algeria-focused spending categories with Arabic, French, and English labels and keyword suggestions.\n- Bill tracking presets for Sonelgaz electricity/gas, water providers, internet, mobile and landline services.\n- DINARO Scan uses Tesseract.js for browser-side OCR and PDF.js to render the first PDF page before recognition. Extracted fields remain editable and must be confirmed before a transaction is saved. The first OCR run downloads language data and requires an internet connection; the document image is processed in the browser.\n- Smart reminders use browser notifications for upcoming bills, recurring entries, and exceeded budgets. They run while the app is open; background push delivery is not included.\n- Spending Intelligence summarizes recorded DZD expenses without mixing currencies.\n\n## Run locally

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

## Complete financial platform workspace

The `feature/complete-financial-platform` branch adds a dedicated Financial Academy and a financial workspace:

- **Financial Academy:** 12 structured curricula, 36 lesson units, learning objectives, detailed explanations, practical cases, exercises, knowledge checks, answer explanations, source lists, and local progress tracking.
- **DINARO Insights:** explainable spending signals based on recorded transactions, budgets, and upcoming bills. Key signals are also surfaced on the configurable main dashboard. Insights are descriptive and do not promise future outcomes.
- **Cash Flow Timeline:** chronological view of unpaid bills, recurring entries, and savings-goal due dates. A concise upcoming-events summary is available on the configurable main dashboard. Each currency remains separate.
- **Custom Dashboard:** visibility and ordering controls are shared with the main dashboard. Saved widget preferences drive the homepage layout, including balances by currency, Safe to Spend, income and expenses, upcoming bills, goals, budgets, DINARO Insights, Cash Flow Timeline, and Financial Academy shortcuts. Preferences remain local to the device.
- **Universal Transaction Search:** searches transaction descriptions, categories, dates, and amounts.
- **Financial Reports:** 12-month DZD summary, CSV export compatible with Excel, and browser print-to-PDF.
- **Multi-Profile and Shared Wallets:** local prototype records only. They do not isolate financial data or provide authenticated member access.
- **Financial Reports:** a 12-month DZD monthly summary, per-currency totals, CSV export, and browser print-to-PDF.
- **Recurring Rules:** view, add, edit, delete, and record the next scheduled occurrence; recording a rule creates a transaction and advances its next date.
- **Recurring Rules:** displays existing recurring entries.
- **Offline transaction capture:** new and edited transactions are saved immediately to the browser's local data store and also written to a durable IndexedDB outbox. The app displays connection state and the number of queued operations. When connectivity returns, the page and (where supported) the service worker attempt to send queued operations.

### Important implementation boundaries

This branch is still a browser-local prototype. Offline transactions remain safely queued on the current browser until a backend implements `POST /api/sync/transactions`. The endpoint must accept `{ transaction, operationId }`, enforce `Idempotency-Key`, and return `{ accepted: true, operationId }` only after a durable database commit. No endpoint is present in this branch yet, so the queue is not reported as synchronized and cross-device sync is not available. Authenticated multi-user profiles, server-side family permissions, conflict resolution, background push notifications, native XLSX generation, and server-backed backups are also not yet provided. Do not treat local profile names or shared-wallet member labels as access control. These require a backend, durable database, migrations, authentication, authorization, audit history, and synchronization tests.

Financial Academy lessons are educational material, not individualized investment, legal, or tax advice. Tax and regulatory content must be checked against current official Algerian publications before operational use.


## Intelligent financial experience

The intelligent workspace is available from **More → Intelligent Financial Experience** and groups ten capabilities into four focused areas:

- **Spending Patterns:** category-level month-over-month comparisons, separated by currency.
- **Unusual Activity Detection:** highlights expenses at least 2.5× the prior category average when at least three earlier observations exist. This is a review signal, not fraud detection.
- **Net Worth Tracker:** account balances less recorded debt balances, shown separately per currency. Other asset classes are not yet represented.
- **Smart Money Envelopes:** local spending allocations matched to the transaction category and currency. Existing DZD budgets seed the initial envelope list.
- **Debt Manager:** local debt records with total, paid, remaining amount, currency, and due date. Debt records are currently stored in this browser and are not yet part of a server-backed ledger.
- **Goal Planner 2.0:** goal progress, target dates, estimated monthly contribution, and manual progress contributions.
- **Adaptive Dashboard:** reuses the existing dashboard order and visibility preferences.
- **Quick Actions Center:** shortcuts to transaction entry and existing financial sections.
- **Smart Notification Center:** in-app alerts for due bills, budget thresholds, unusual expenses, goal deadlines, and debt due dates. Browser notification permission is optional; background push is not included.
- **Personalization Studio:** local accent color, density, and balance-privacy preferences.

### Current limitations

This is still a local-first frontend prototype. Debt and envelope records, notification state, and appearance preferences are browser-local. Net worth covers account balances and recorded debts only; it does not yet include property, investments, vehicles, or other manually valued assets. Goal contributions update goal progress but are not posted as ledger transactions. Do not use these prototype figures as audited financial statements.


## Effortless Experience

The home dashboard now includes a compact beginner-friendly experience layer:

- **One-Tap Actions:** opens the existing transaction form directly for expenses, income, or transfers; it reuses the same validation and save path.
- **Smart Suggestions:** surfaces simple prompts based on upcoming unpaid bills and whether savings goals exist. Suggestions are informational, not automated financial decisions.
- **Contextual Guidance / Plain Language Finance:** a multilingual glossary with practical examples for cash flow, budgets, emergency funds, debt, and net worth.
- **Quick Command Center:** recognizes a small set of Arabic, English, and French commands for common sections and transaction entry; unrecognized text falls back to Universal Search. It is not an AI natural-language agent.
- **Adaptive Experience:** records section visits locally and shows frequently used destinations on the home experience. This is device-local usage history.
- **Smart Defaults:** remembers the last transaction account, category, currency context, and type in browser local storage. The selected account determines the transaction currency; users can still change all editable fields.
- **Duplicate Detection:** asks for confirmation when a new transaction matches an existing transaction by date, type, account, currency, amount, and normalized description. It is a heuristic warning, not a guarantee that two records are duplicates.
- **Personal Themes:** links to the existing Personalization Studio for local accent, density, and balance-privacy preferences.
- **Micro Celebrations / Financial Journey:** shows savings-goal progress and an optional lightweight celebration. No streak penalties, financial rankings, or pressure mechanics are used.

These experience preferences and usage counts are stored in the current browser. They are not synced across devices. The home dashboard remains a prototype and the underlying financial data is still browser-local.
