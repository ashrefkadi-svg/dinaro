# DINARO+ Design System — Midnight / Advanced

## Direction
- **Theme:** Midnight — deep navy foundations, cool blue-black surfaces, emerald as the primary action and financial-positive accent.
- **Motion:** Advanced but purposeful. Motion communicates hierarchy, state changes, and feedback; it must never delay financial tasks.
- **Scope:** Shared design tokens, surface treatments, interaction states, responsive behavior, and motion rules.

## Foundations
| Token | Value | Use |
|---|---|---|
| Background | `#070b14` | App canvas |
| Surface | `#0d1421` | Main panels |
| Elevated surface | `#111c2b` | Cards and dialogs |
| Emerald | `#36ddb0` | Primary actions and positive states |
| Text | `#edf5fb` | Primary content |
| Muted | `#8b9bad` | Secondary content |
| Border | `rgba(151,178,196,.13)` | Dividers and outlines |

## Typography
- Arabic: IBM Plex Sans Arabic.
- Latin / numeric: DM Sans.
- Financial values use tabular-friendly numeric presentation and remain visually dominant.
- Keep labels concise; never use low contrast for balances or transaction amounts.

## Shape, depth, and surfaces
- Standard card radius: 18px desktop, 15px mobile.
- Use layered navy gradients, restrained glass blur, and subtle inset highlights.
- Emerald glow is reserved for primary balance, active navigation, and key actions.
- Avoid excessive neon, thick borders, and decorative gradients that compete with data.

## Motion system
- Entry: opacity + 12–22px vertical offset, 450–650ms, ease-out.
- Hover: 2–5px lift, 180–280ms.
- Press: subtle scale to 0.97.
- Progress: slow shimmer only while visible.
- Ambient glow: 8s low-amplitude drift.
- Respect `prefers-reduced-motion`; no essential information may depend on animation.

## Component states
- Buttons: default, hover, active, focus-visible, disabled.
- Navigation: default, hover, active.
- Inputs: default, focus-visible, invalid.
- Cards: default and hover; avoid hover-only information.
- Dialogs: blurred scrim, clear focus outline, short enter/exit transition.

## Responsive rules
- Desktop: fixed navigation rail and multi-column dashboard.
- Tablet: collapsible navigation and two-column KPI layout.
- Mobile: single-column content, compact top bar, full-width primary actions.
- Maintain RTL flow and avoid horizontal scrolling at 320px.

## Accessibility and product integrity
- Keyboard focus must remain visible.
- Respect reduced-motion settings.
- Color is never the only indicator of income/expense state.
- Prototype values must remain identified as demonstration data; this visual update does not add persistence or bank connectivity.

## Implementation
- React + Motion for stateful transitions.
- CSS custom properties in `src/styles.css` for shared visual tokens.
- Recharts for financial visualization.
