# THE WORLD OF DINARO — NPC Dialogue System 1.0

Implementation draft, 13 November 2026. **Scripted, contextual dialogue — not generative AI.**

## Character cast

| ID | Name | Voice | Role |
|---|---|---|---|
| ashraf | أشرف | Warm, adventurous, conversational Algerian Arabic | Journey companion |
| layla | ليلى | Calm, poetic, attentive | Dream forest keeper |
| rimo | ريمو | Practical, playful, plant-and-build metaphors | Prosperity engineer |
| salim | سليم | Analytical, careful and optional puzzle guide | Bridge guardian |
| professor | الأستاذ دينارو | Wise, patient, educational | Castle sage |
| mira | ميرا | Mysterious but helpful, loves islands and maps | Secret islands explorer |

Earlier draft character names آدم and نورة were replaced with **أشرف** and **ريمو** by the project owner.

## Content coverage

- Six NPCs × eight situations × three phrasing variants = **144 scenario lines**.
- Six NPCs × three player intents × three variants = **54 choice follow-up lines**.
- **198 unique authored utterances** total. Variation rotates without immediate repetition.

Situations: welcome, early (0–24%), growing (25–99%), milestone (exactly 25/50/75%), slowdown, setback, victory (100%) and discovery. The player can ask for an explanation, choose exploration or say they wish to think. Progress-based scene selection is deterministic and read-only.

## Code

- src/features/world/npc-dialogues.ts: NPC text and typed pure functions sceneFromProgress and chooseDialogue.
- src/features/world/NpcDialoguePanel.tsx: six portraits represented by Lucide emblems, choice buttons, scrollable transcript, progress context and replay.
- src/features/world/npc.css: responsive presentation using DINARO Design System tokens and reduced-motion.
- src/features/world/npc-dialogues.test.mjs: content counts, rotation, personalized reactions, ethics and invalid inputs.
- src/features/goals/JourneyDemo.tsx: mounts the interactive panel in the optional World of DINARO route.

The engine does **not** access accounts, bank statements, personal data, external AI or microphones. All choices and recent dialogue exist only in React memory. No actual history is persisted; it is an interactive sample, not a production NPC or real AI connection.

## Ethical boundaries

Never shame or pressure users for lower balances, pausing savings or withdrawing money for necessary expenses. NPC speech never initiates transfers or modifies amounts. Islands remain optional, and educational guidance is not licensed financial advice. Narrative reflects financial state only when explicitly linked to authorized data in a future backend.

## Validation

Node 22: npm install && npm run test && npm run build.
Automated coverage validates exact count of authored variants, six names, branching, repeat-avoidance and progress-driven scenes. Device and screen-reader QA is pending.

## Next improvements

Approved original character sprites, facial emotions and frame-limited animations; richer story graphs and optional side quests; voiced dialogue only if user enables it; future AI only with explicit consent, grounding, privacy controls and a reliable fallback to authored text.
