# THE WORLD OF DINARO — Playable Starting Village 1.0

**Status:** first playable RPG vertical slice in a draft development branch. Not the entire kingdom, not a production-ready game.

## What's implemented

A real top-down, deterministic tile-based game inside the existing optional DINARO+ World screen and standalone mobile demo. This replaces the previous assumption that a goal-progress slider is the whole game. The original NPC atlas and curated dialogue remain available alongside the new gameplay.

- Village: 24×18 grid with grass, stone boundaries, trees, walkways, water, four buildings and Ashraf near town square.
- Player movement: Arrow keys / WASD, phone-screen D-pad, four facings and viewport scroll-follow.
- Tile collisions: houses, trees, boundaries, water, bookshelves and NPC; doors allow changing rooms.
- Real interiors: player can enter the Adventurer House, Library and Workshop, then leave back to the village.
- Interaction: E / Space / touch action near Ashraf, dialogue box, alternate spoken variants.
- Quest: talk to Ashraf → enter library → locate the Light Seed → return to Ashraf → receive an **entirely fictional, nonmonetary** collectible badge.
- Auto-persistence: position, room, discoveries, quest, fictional time/weather, step count and last game message stored in this device's browser localStorage. Schema checked before restoring; safe invalid-save fallback.
- Environment: day/night tint and clear/rain state toggles, without real weather or external calls.
- No backend, money-moving action, bank connection, in-game payments, gambling or punishment for changes to savings.

## How to play

```bash
npm install
npm run dev:mobile
```

Open the local mobile-preview URL, select **الأهداف**, then scroll to **قرية البدايات**. On desktop you can run `npm run dev` and navigate to **عالم دينارو**.

Keys: WASD / arrows move, E or Space interacts, on-screen buttons on touch devices. Doors are golden tiles and enter automatically when walked over. Ashraf is next to the center path. Use the on-screen weather and time controls to change the local world atmosphere.

## Boundaries and scope

This is a **playable vertical slice**, not the fully interconnected world previously discussed. Expanding it to the Dream Forest, Saving Valley, Progress Bridge, Achievement Castle, Future Horizon and Secret Islands requires authored maps, crossing/transition gates, new quest graphs, resident daily schedules, pathfinding and richer handcrafted character and environment art.

The current player avatar is a simple controllable pixel prototype, not the final customizable RPG character. The existing NPC portraits, animated atlases and branching scripts remain part of the world experience. Interior building and outdoor scene artwork are functional tile graphics, not final handpainted game-environment assets. No actual bank records are used. The save uses localStorage only in this browser (not cloud sync or encryption).

## Verification

`npm run check && npm run test:mobile && npm run build:mobile`.

`village-engine.test.mjs` validates all map dimensions and collisions, an automated BFS walk through **the entire quest**, transitions into/out of each building, environment toggles, pure transitions and saved-data schema validation.

All future RPG work should preserve: read-only financial progress adapter, no forced savings, repeatable discovery and accessible already-earned achievements.
