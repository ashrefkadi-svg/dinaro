# DINARO+ Official Brand Mark 1.0

**User-selected identity:** first emblem option, without any words inside the symbol.

## Design
- Three ascending emerald financial-growth bars
- Curving forward-motion orbit
- Emerald plus glyph integrated as a shape
- No “DINARO+” text embedded inside the icon itself
- Dark charcoal rounded-square app background; scalable transparent SVG mark

**Source:** `public/brand/dinaro-mark.svg`
**App-icon master:** `public/brand/dinaro-app-icon.svg`
**Component:** `src/ui/brand/BrandMark.tsx`

This production-minded vector recreation preserves the accepted motif and is optimized for small sizes. The original concept was a rendered reference, not an editable source vector, so minor gradient/contour differences can occur. Wordmark text adjacent to the icon is separate HTML and can be hidden or localized without changing the symbol.

## Integration
- Desktop sidebar brand mark
- Compact navigation rail
- Mobile topbar brand mark
- Browser favicon
- Web app manifest and iOS home-screen PNG icon

## Build
Run `npm install` then `npm run dev` or `npm run build`. The `predev` and `prebuild` scripts rasterize `dinaro-app-icon.svg` to PNG at 180/192/512px through @resvg/resvg-js and Vite includes the assets. Assets are generated, not committed, to keep the SVG as source of truth.

No offline functionality, native iOS/Android binary, bank service, or publishing is implied. Real-device home-screen icon verification is still pending.
