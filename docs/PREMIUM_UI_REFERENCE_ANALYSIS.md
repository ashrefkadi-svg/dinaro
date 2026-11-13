# DINARO+ — Premium Responsive UI

Status: implemented in a proposed code branch; not a production release.

## UI analysis of the four uploaded visual references

### 1. Frosted productivity dashboard
The first image uses a floating bright sidebar, layered glass panels, airy bento grids, rounded cards, and strong information hierarchy. DINARO adopts its organized grid, balanced spacing, glass surface treatment and clear separation between summary and detail panels. We do not reproduce the original brand.

### 2. Black mobile banking UI
The second image emphasizes a large balance, smooth line charts, a bold financial card, thumb-friendly shortcuts, a floating central action and a contrasting white recent-transactions sheet. DINARO adopts these interaction patterns with its own charcoal/emerald/ice palette. We deliberately do not display fictitious bank card numbers or account verification marks.

### 3. Icon rail with an active glow
The third image shows an expandable icon-only desktop sidebar, one luminous active navigation item and muted inactive icon outlines. DINARO implements an accessible 82px compact rail, 268px expanded menu and emerald active-state emphasis. Iconsax depicted in the reference is not used: **Lucide React remains the single icon library**.

### 4. Gamification profile
The fourth image suggests profile tiles, learning milestones, achievements and activity progress. These patterns belong to DINARO Academy, Goals and optional World of DINARO, **not to the banking homepage**. No mascot, graphic, brand or artwork was copied.

## Component inventory and implementation

| Component | Responsibility |
|---|---|
| PremiumDashboard | Responsive, detailed financial homepage |
| GlassCard | Shared frosted surface primitive |
| Amount | Privacy-aware monetary value |
| MetricCard | Income/expense aggregate cards |
| PanelTitle | Unified headings and supporting descriptions |
| Action | Interactive quick action |
| PremiumMobileNav | Thumb-friendly fixed bottom navigation |
| Demo selectors | Bigint aggregation, category grouping and flow series |
| App shell | Sidebar, compact rail, mobile drawer, search and routing |
| Premium CSS | Responsive grid, surfaces, focus/motion and themes |

Sources: src/ui/premium/PremiumDashboard.tsx, selectors.ts, premium.css and src/App.tsx.

## Visual rules

- Approved direction B: charcoal backgrounds, emerald primary actions, ice-blue secondary information and rare gold achievements.
- Exact hex values remain editable in src/design-system/tokens.css; chosen values are proposals.
- Moderate glass intensity with user-controlled blur/opacity, and graceful reduced-motion behavior.
- Lucide icons around 18 to 22px, 1.8 stroke where appropriate, consistent focus styling.
- Right-to-left Arabic, desktop sidebar on the left, mobile bottom navigation at <=760px, collapsible desktop sidebar at >=901px.
- Spacious spacing and rounded panels rather than bright neon outlines everywhere.
- The mobile recent-transaction surface intentionally uses pale neutral colors for contrast in dark mode.

## Data and privacy guarantees of this UI slice

The homepage uses only explicitly labeled **synthetic demonstration transactions**, with balance derived from bigint ledger postings. Its charts represent cumulative transaction order, NOT bank-verified monthly history. The Budget view groups demo expenses and avoids fictitious spending limits. The Goal is labeled a sample. The authenticated manual SQLite ledger is a completely separate local-development experience.

## Validation

GitHub Actions executes selector unit tests, existing goal/academy/domain tests, local SQLite API tests, strict TypeScript and Vite build. A green CI check establishes code/build health, not device QA, complete accessibility, security certification or production readiness.

## Next design QA

Visual checks at 375px, 768px, 1024px and 1440px; dark/light contrast and real phone testing; user review of typography/spacing and exact palette; AR/FR/EN localization and RTL/LTR; migration of remaining secondary pages to a fully unified UI kit.
