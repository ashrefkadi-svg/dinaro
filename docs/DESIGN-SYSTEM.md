# DINARO Design System 1.0 — first code implementation

**Approved direction:** calm global banking UI, charcoal + emerald + ice blue; reserved gold for achievements. Financial dashboard is not Pixel Art. Lucide React only. Detailed dashboard default.
**Not finally approved:** exact HEX, radii, font sizes and glass strength.

## Proposed editable tokens (src/design-system/tokens.css)
| Design token | Dark | Light |
|---|---|---|
| canvas | #0e1216 | #f1f5f7 |
| surface | #192228 | #ffffff |
| text | #f0f6f8 | #14252d |
| muted | #a3b4bc | #536b78 |
| border | #34464f | #ccdce3 |
| emerald | #30d4a2 | #087c5c |
| ice | #9ed8f2 | #126c92 |
| gold | #d5af69 | #9b681d |

## What actually works
DesignSettings contains live dark/light switch, spacing density toggle and glass slider. Preferences are locally persisted with bounded validation, never as financial data. DSButton, DSCard, DSField offer initial shared controls. Arabic RTL and reduced-motion handling are integrated.

## Current limitations
Legacy CSS still contains hard-coded colors; theme overrides cover major surfaces and controls, but a complete contrast audit and migration remain. French/English translation, real ledger and production security are not implemented. Current money data is explicitly demo-only.

## Verification
npm run test; npm run build. GitHub Actions checks every push and PR.
