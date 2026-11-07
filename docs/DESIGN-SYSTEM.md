# DINARO+ Design System — v0.2 Midnight Banking

## Product direction
- Arabic-first interface with RTL layout and responsive desktop/mobile behavior.
- Midnight Banking visual identity: deep navy, graphite surfaces, restrained emerald accent, and cool blue secondary signals.
- Advanced motion is purposeful, short, and subordinate to financial clarity.
- DZD remains the initial display currency.
- Prototype data must remain clearly distinguished from persisted financial records.

## Design principles
1. **Trust through restraint:** avoid excessive glow, gradients, and decorative animation around financial values.
2. **Hierarchy before decoration:** balance and key cash-flow indicators receive the strongest visual emphasis.
3. **Consistent surfaces:** use shared surface, border, radius, shadow, and spacing tokens rather than page-specific values.
4. **Accessible interaction:** visible keyboard focus, adequate contrast, clear interactive states, and reduced-motion support.
5. **Responsive by default:** preserve readable financial data and touch-friendly controls at narrow widths.

## Core tokens
| Token | Value | Role |
|---|---|---|
| Background | #080d18 | Main app canvas |
| Background soft | #0b1220 | Secondary canvas |
| Surface | #101a2b | Standard panels |
| Surface raised | #152238 | Elevated controls |
| Surface hover | #1a2a42 | Hover state |
| Border | #26364d | Structural separators |
| Text | #f2f6fc | Primary text |
| Text soft | #c0ccdc | Secondary text |
| Muted | #8292a9 | Supporting text |
| Emerald | #35d6a0 | Primary action / positive financial state |
| Emerald strong | #19b982 | Accent depth |
| Blue | #79a9ff | Informational state |
| Warning | #f0b66f | Expense / caution |
| Danger | #f07f89 | Error state |

## Shape and elevation
- Small radius: 10px
- Standard radius: 16px
- Large radius: 22px
- Card elevation: soft black shadow plus subtle top highlight.
- Accent glow is reserved for the primary balance card and selected primary actions.

## Motion system
- Fast: 160ms for small state changes.
- Base: 260ms for hover, press, and component transitions.
- Slow: 520ms for page entrance and larger staged reveals.
- Ease-out: cubic-bezier(.16, 1, .3, 1).
- Spring-like emphasis: cubic-bezier(.2, .9, .25, 1.18).
- Avoid animating large layout dimensions or continuously moving financial data.
- Honor `prefers-reduced-motion` globally.

## Typography
- Arabic: IBM Plex Sans Arabic.
- Latin numerals and labels: DM Sans.
- Use tabular numerals for aligned financial values where practical.
- Keep secondary metadata quieter than amounts and labels.

## Library responsibilities
- **Motion:** component and page transitions; use restrained spring behavior.
- **Radix UI:** accessible primitives for dialogs, menus, and tabs.
- **shadcn/ui conventions:** composable component APIs and consistent variants.
- **Magic UI / React Bits:** optional inspiration for isolated effects; do not add decorative effects indiscriminately.
- **Lucide React:** consistent iconography.
- **Google Fonts:** IBM Plex Sans Arabic and DM Sans.
- **Zod + React Hook Form:** validated forms.
- **TanStack Table:** transaction table sorting/filtering when implemented.
- **Recharts:** cash-flow visualization.

## Implementation
- `src/styles.css` contains the original prototype component layout.
- `src/design-system.css` is loaded after it and provides the Midnight token layer, visual overrides, interaction states, and reduced-motion behavior.
- Keep new components aligned with these tokens. Prefer reusable CSS variables over new hard-coded colors.

## Current prototype boundary
The dashboard still uses local in-memory demonstration data. It does not read or write real user financial records, connect to a bank, or persist newly added transactions. Do not present prototype values as verified balances.

## Next stages
1. Extract reusable Button, Surface/Card, Input, Badge, and Dialog primitives.
2. Add Storybook or a component showcase page for token and state review.
3. Refine responsive typography, spacing, and RTL behavior across all sections.
4. Connect authenticated API data and replace demo values only after backend validation.
5. Add visual regression, accessibility, and production-build checks.
