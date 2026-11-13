# DINARO Mobile World 3.0 — NPC integration

**Status:** working code on a draft feature branch, not yet released to a live Safari URL.

## What is actually integrated

The fictional-goals screen in the standalone mobile preview now mounts `MobileWorld.tsx` instead of its old abstract rectangle avatar. It uses the same NPC PNG art atlas and the same author-written dialogue engine as the desktop Journey Demo.

- Six NPC identities with the approved names أشرف and ريمو plus ليلى، سليم، الأستاذ دينارو and ميرا.
- Six kingdom regions plus secret islands, navigable without financial requirements.
- Dynamic region residents based on `NPC_VISUALS`; visiting secret islands presents ميرا.
- 4-frame sprite cycles from the shared transparent PNG atlases; protagonist appears on the landscape and moves according to the **fictional slider**.
- Portraits with calm, joy, thinking and surprise; speech and animation state derived from the shared narrative engine, with alternate responses to **اشرح لي أكثر / نستكشف المكان / خليني نفكر**.
- Progress change selects a context using the immutable `sceneFromProgress` logic, including gentle response to decreased progress. At 100% the mock character celebrates.
- Respects CSS `prefers-reduced-motion`, preserves charcoal/emerald/ice styling, and uses touch-friendly controls.

## Public preview safety

- `build:mobile` now generates both brand icons and NPC sprite PNG atlases before building the **isolated** web entry.
- No authentication or finance API is in this viewer; only fictional static records are provided.
- NPC conversations and session data live only in React memory. Closing or refreshing the page clears them.
- `test:mobile` validates content integration and generated PNG signatures.
- `.github/workflows/ci.yml` additionally executes `test:mobile` and `build:mobile`, checks the static bundle and inspects for sensitive server references.

## Local instructions

On Node 22:

```bash
npm install
npm run dev:mobile
# Browse http://localhost:5173/mobile-preview.html
npm run check
npm run test:mobile
npm run build:mobile
```

Open the goals tab, choose a region, change progress 0–100%, select a region resident, and try different dialogue options. To reach islands, tap **الجزر السرية** in the region scroller.

## Release notes and caveats

- The current art is a **procedurally authored pixel-art atlas**, not yet the final high-detail hand-painted sprites from the concept sheets. Visual fidelity/animation registration, contrast and touch QA on real iPhone Safari remain to be approved.
- The previous Pages deployment failed due to GitHub Pages not being enabled for the repository. **No public URL is claimed as live**; a maintainer must enable GitHub Pages and successfully deploy the isolated preview first.
- PR is stacked on earlier draft NPC art PR; branches must be reviewed and merged in dependency order before deploying a production web/mobile app.
