# DINARO+ Design System — v0.1

## Product direction
- Arabic-first interface with RTL layout.
- Responsive desktop and mobile dashboard.
- Dark emerald visual identity with restrained motion.
- DZD as the initial display currency.
- Clear distinction between prototype data and persisted financial records.

## Library responsibilities
- **shadcn/ui**: component conventions and accessible composable UI patterns.
- **Radix UI**: accessible interaction primitives (dialogs, menus, tabs).
- **Motion**: transitions and micro-interactions.
- **Magic UI / React Bits**: selectively adapted decorative effects; avoid excessive animation.
- **Lucide React**: consistent iconography.
- **Google Fonts**: IBM Plex Sans Arabic and DM Sans typography.
- **Zod + React Hook Form**: validated forms.
- **TanStack Table**: transaction table sorting/filtering when the full ledger view is implemented.
- **Recharts**: dashboard cash-flow visualization.

## Visual tokens
- App background: #08130f
- Surface: #101e19
- Elevated surface: #14251e
- Emerald accent: #22c997
- Primary text: #edf5f0
- Muted text: #81948a
- Borders: #20352c

## Current prototype boundary
The dashboard currently uses local in-memory demonstration data. It does not read or write real user financial records, connect to a bank, or persist newly added transactions. Do not present prototype values as verified balances.

## Next implementation stages
1. Connect authenticated API data and replace demo values.
2. Implement account and transaction CRUD with server-side validation.
3. Add budget and goal persistence.
4. Add automated tests and responsive accessibility checks.
5. Integrate scan and document workflows after core financial data is reliable.
