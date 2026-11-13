# THE WORLD OF DINARO — NPC Art Polish 4.0

**Status:** integrated into the actual GitHub development branch; CI validated. Not merged to main or approved as final game art.

## Implemented art refinements

All six named characters keep their individual palette, equipment and regional assignments: **أشرف، ليلى، ريمو، سليم، الأستاذ دينارو، ميرا**. The standalone Mobile World and the main Journey Demo share the same animated PNG atlas component.

- **Four-direction 2D sprites:** front, back, left and right. Every direction contains idle, walk, talk and celebrate with four slots each (64 animation cells per character, 384 total).
- **Talk mouth:** the authored atlas renderer now creates distinct partially open mouth frames during speech motion, rather than substituting a constant smile.
- **Blinking:** idle sprite cells include a closed-eye pose; all four portrait expressions also have a second closed-eye row. CSS gives a periodic short portrait blink with reduced-motion opt-out.
- **Detail:** added pixel embroidery, asymmetric seams, decorative clasp, boots and small celebration glints to the character frame renderer.
- **Portrait atlas:** upgraded from 512 × 160 to **512 × 320**, with open/closed-eye versions for the four expressions. All dimensions recorded in the atlas manifest.
- **Mobile fix:** `NpcAtlasCharacter.tsx` imports `npc-art.css` directly so animation definitions are present in the isolated Safari preview as well as the desktop app. Individual motion cycle durations vary.
- **Accessibility:** animations disable when the device requests Reduce Motion; art spans provide descriptions. Data remains fictional and read-only, and NPC dialogue changes no funds.

## Building and testing

Using Node.js 22:

```bash
npm install
npm run test
npm run test:mobile
npm run test:api
npm run build
npm run build:mobile
```

The generator runs automatically before tests and builds; or invoke `node scripts/generate-npc-atlases.mjs`. PNGs and SVG editables are produced under `public/world/npc/`.

`npm run test:npc-art` verifies 6 unique sprite PNGs at 320 × 1792, 6 unique portrait PNGs at 512 × 320, valid transparency-capable PNG, eight portrait rows/expressions and no remote financial access.

## Full project ZIP

The branch includes `.github/workflows/full-project-zip.yml`. On a push to this branch the CI workflow executes tests/builds and uploads the archive **DINARO-PLUS-complete-project**.

It contains the complete tracked repository source (including server modules, React app, docs, unit tests, UI components), built `dist` and `dist-mobile` demos, the generated SVG/PNG art assets and branded icons. Excludes `node_modules`, .git, local database records, logs and credentials. `START-HERE.txt` explains how to run it.

**Important:** the ZIP is a full **current development snapshot**, not a finished or certified banking solution. Authentication, security, legal obligations and advanced goals/world content remain development work. A draft PR is not proof of deployment.

## Art QA still outstanding

The pixel shapes are code-authored art studies with real frame animation. They are not direct crops of the larger manually directed character illustrations. Before final artistic approval: hand-correct anatomy and costumes, retouch lighting and colors frame by frame, smooth directional walk cycles, check texture edges on real iPhone Safari, test screen readers and medium-tier devices.
