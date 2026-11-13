# THE WORLD OF DINARO — NPC Runtime Pack 1

**Development branch:** `feat/dinaro-npc-runtime-pack1`  
**Status:** running first-pass SVG pixel characters integrated into the existing Journey demo; **not final production sprite sheets**.

## Implemented in code

- Six defined NPCs with distinct palettes, silhouettes, region assignments and signature accessories:
  - أشرف — Starting Village (travel companion, can visit other main kingdom zones)
  - ليلى — Dream Forest
  - ريمو — Saving Valley / prosperity engineer
  - سليم — Progress Bridge
  - الأستاذ دينارو — Achievement Castle
  - ميرا — Future Horizon, Secret Islands
- `NpcCharacter.tsx` renders original hand-coded SVG pixel-style visual study sprites directly in the app. The shapes are scalable, transparent and differentiated but **not exports of the previously generated highly detailed illustration concept sheets**. Production-grade hand-finished PNG spritesheets are a separate asset milestone.
- Four facial-expression states: joy, thinking, surprise, calm.
- Four CSS-driven motion states: idle, walk, talk, celebrate. These are functional *prototype movement cycles*, not frame-by-frame hand-drawn game art.
- Four orientation choices: front, back, left, right. Front and back are basic SVG variants; left uses mirroring. The final turnaround animation art still needs separate hand-drawn directional frames.
- `NpcDialogueBubble.tsx` displays the same character and expression as the selected speaker.
- `npc-definitions.ts` contains the world/region and presentation data; `npc-state.ts` maps story situation to facial expression/motion without modifying finances; `useNpcState.ts` is the React adapter.
- `NpcDialoguePanel.tsx` now supports region switching (including secret islands), current-region NPC list, live expressive sprite preview, scene-derived reactions and manual animation/direction controls. Remains inside existing `JourneyDemo.tsx`.
- Reuses the earlier deterministic, non-generative 198-line NPC scripted dialogue pack.

## Verify

With Node 22 run:

```bash
npm install
npm run test
npm run build
npm run dev
```

Open the **عالم دينارو** route, choose a region and NPC, click one of the three dialogue options or one of the scene contexts, then try motion and direction buttons.

## Boundaries and next steps

- No real bank access, generative AI, microphone or production financial capabilities.
- The numeric journey progress in the demo is fictional and never changed by the dialogue system.
- Reduced-motion disables infinite animation cycles.
- Actual crop-safe art assets, pixel-perfect palettes, animated frame sheets, true 4-direction walk cycles and professionally hand-finished facial portraits **remain to be implemented**. Concept-image sheets cannot be treated as engine-ready sprites.
- Need visual QA on iPhone, performance/contrast and accessibility testing and user acceptance before marking art complete.

## Quality gates

Automated unit tests cover all 6 definitions, region residency order, transition mapping and no financial effects. GitHub Actions provides the repository's full test/build feedback. No feature is claimed fully production-ready based solely on CI.
