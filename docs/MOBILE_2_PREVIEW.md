# DINARO+ Mobile 2.0 — Safari design preview

## What this branch implements
A separate React mobile UI with five working screens: Home, Analytics, Goals, Academy and Preferences. Official DINARO+ logo, 1.8-second skippable splash screen, mobile navigation, dark/light theme, adjustable glass effects, hide/show amounts, simulated goal progress and short educational puzzles.

The public demo **does not load the local finance server, credentials, database, user profiles or real money**. It contains only invented sample entries and data kept in React memory. When you refresh the page, temporary changes disappear. It is not a banking app.

## Files
- Entry: mobile-preview.html
- App: src/mobile-preview/MobilePreview.tsx
- Styles: src/mobile-preview/mobile.css
- Demo-only money calculation: src/mobile-preview/data.ts
- Unit tests: src/mobile-preview/data.test.mjs
- Vite isolated config: vite.mobile-preview.config.ts
- Static site builder: scripts/finalize-mobile-preview.mjs
- Deployment: .github/workflows/mobile-preview.yml

## Local commands (Node.js 22)
1. npm install
2. npm run dev:mobile
3. Open http://localhost:5173/mobile-preview.html
4. npm run test:mobile
5. npm run build:mobile

The preview build outputs dist-mobile/index.html, with a GitHub Pages base of /dinaro/.

## Publishing to Safari
GitHub Pages is the proposed free HTTPS host. Because repository Pages may not be enabled yet, the repository owner must go to:

Repository -> Settings -> Pages -> Build and deployment -> Source -> GitHub Actions.

Then open the Actions tab and select the "DINARO Mobile 2.0 static preview" workflow. The owner can manually run the workflow from the feat/dinaro-mobile-2 branch (or push a new commit).

The intended public URL after a **confirmed successful deployment** is:
https://ashrefkadi-svg.github.io/dinaro/

Do not share the URL as live until GitHub reports a successful Pages deployment and an external request confirms that the site loads. GitHub Pages is public; **do not add customer credentials or real financial data to the static preview**.

## Manual review / next work
- Test iPhone Safari at 375px and 390px, including Dynamic Island and home indicator safe areas
- Check onboarding skip, tap targets, tab flows, modal, accessibility labels and reduce motion
- Validate light-theme contrast and screen-reader order
- Obtain user approval for splash duration, typography, glass and color tokens
- Add proper preview-specific manifest (current icon works in tab/apple-touch icon; installability is not claimed)
- Integrate polished screen designs into production app only after review and authorization/security hardening
