# DINARO+ — NPC Art Atlas 2.0

Status: **implemented as a working sprite-sheet pipeline on a draft branch**. Not a final hand-painted art approval, not merged to main.

## Art direction

Six original Detailed Pixel RPG-inspired characters, each with distinct palette, equipment and silhouette. The reference concept sheets guided the creative motifs, but this renderer does not reuse or extract their raster pixels. It creates new, predictable, transparent and editable pixel illustrations.

| NPC | Symbol | Origin | Extra appearances |
|---|---|---|---|
| أشرف / Ashraf | Travel pack and compass | Starting Village | Forest, Valley, Bridge, Castle, Horizon |
| ليلى / Layla | Lantern and pale blue long hair | Dream Forest | Horizon |
| ريمو / Rimo | Tool pouch and sprout | Saving Valley | Village |
| سليم / Salim | Goggles and blueprint | Progress Bridge | — |
| الأستاذ دينارو | Book, grey hair and beard | Achievement Castle | — |
| ميرا / Mira | Sky hat and telescope | Future Horizon | Secret Islands |

The former working names Adam and Noura are replaced by Ashraf and Rimo.

## Generated files

Run \`node scripts/generate-npc-atlases.mjs\`. For each character in \`public/world/npc/\` this yields:

- \`<id>-sprites.png\` and \`<id>-sprites.svg\`: transparent 320 × 1792 sheet
- \`<id>-portraits.png\` and \`<id>-portraits.svg\`: transparent 512 × 160 sheet

Frames:
- 4 columns (four frames per animation)
- 16 rows (directions front, back, left, right × motions idle, walk, talk, celebrate)
- 80 × 112 px cells; 64 frames per NPC, **384 animation frames** in six atlases
- Four portrait expressions in each 128 × 160 px cell: calm, joy, thinking and surprise; **24 portrait poses** total
- An editable machine-readable \`manifest.json\` accompanies the atlases

Generated PNG/SVG files are intentionally ignored by Git. The generator is the version-controlled source of truth; predev, prebuild and pretest regenerate them on Node 22 through @resvg/resvg-js.

## App integration

- \`NpcCharacter.tsx\` re-exports the atlas-backed renderer from \`NpcAtlasCharacter.tsx\`.
- Existing \`NpcDialoguePanel.tsx\` and \`NpcDialogueBubble.tsx\` immediately show the generated portraits and scene sprites. Dialogue scenes/choices select emotions and motions.
- \`JourneyDemo.tsx\` now places the appropriate regional NPC sprite into the world scene instead of the old placeholder blocks.
- The slider moves the character along the progress path. Pointer/keyboard engagement triggers walking; at 100% the NPC celebrates.
- Stage atmospheres vary by region; manual region selection and secret-island Mira remain available.
- CSS uses four-step animation, nearest-neighbor pixel presentation, respects reduced-motion and works with responsive layout.

## Technical validation

\`npm install && npm run check\` — tests existing finance, academy, goals, NPC variants, NPC state, generated atlas PNG signatures/dimensions and local API security; strict TypeScript and Vite build.

The art build is **offline**. No browser network calls are needed to generate sprites. The game component doesn't access balances or alter financial data.

## Remaining artistic work

The assets are *real, functioning and distinct sprite atlases*, but still **code-authored pixel study art**, not final frame-by-frame hand-painted characters from the approved high-detail concept illustrations. The original concept sheets contain ornate details that cannot be automatically translated to 80 × 112 sprites with perfect fidelity. These require an art pass to refine anatomy, layering, costume embroidery, shadows, facial micro-expressions, turnaround silhouettes and animation timing.

Additional QA needed: check visual registration for every frame, inspect transparent edges against day/night backgrounds, test touch/animation on mid-range phones, verify screen readers and safe-area positioning, then solicit owner art approval.

No external world artwork license or AI image copyright claim is implied.
