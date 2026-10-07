# Performance

## What is in place

- **WebGL after first paint.** The canvas bundle is a dynamic import (ssr false) started on
  `requestIdleCallback`. All text is server rendered HTML, readable without WebGL or JavaScript.
- **Quality tiers** (`/lib/quality.ts`): particles 60k / 25k / 8k, instance counts, DPR caps
  1.5 / 1.25 / 1.25, post effects off on low. drei `PerformanceMonitor` lowers DPR and then the tier
  when frame time rises.
- **Only what is needed is mounted.** Home stations outside the window around the scroll position
  unmount; every scene disposes geometries, materials and textures on unmount.
- **Render loop pauses** while the tab is hidden.
- **Assets:** globe data is a 44 KB binary; there are no model or texture downloads (all procedural).
  Client photos go through `npm run assets` (AVIF and WebP, 640 to 2560 wide, tiny blurred placeholder).
- **Fonts:** next/font, self hosted, `display: swap`, automatic fallback metrics.
- **Cache:** `/media/*` served with a one year immutable header. Every page prerenders as static HTML.

## Measured here (2026-10-07)

Headless Chrome on the build machine, 1440 x 900, production build (`next start`):

| Check | Result |
| --- | --- |
| JS heap after 7, 14 and 21 route changes | 31 MB, 29 MB, 32 MB. No growth. |
| Console errors on all routes | None. Remaining notices: a three.js `Clock` deprecation warning raised inside React Three Fiber, and Next.js CSS preload notices. |
| Build | Passes, 28 static pages |

## Still to measure on real hardware

The build machine renders headless WebGL in software, so its frame rates mean nothing.

| Target | How to measure |
| --- | --- |
| 60 fps hero, high tier, mid range laptop | Press `d` on a dev build, or the DevTools Performance panel |
| 30 fps or better, low tier, mid range Android | Remote debugging on the phone |
| Mobile LCP under 2.5s, CLS under 0.05 | Lighthouse mobile on every route; keep reports in `/docs/lighthouse/` |
| Desktop Lighthouse performance above 85 | Lighthouse desktop |

## Known trade off

The brief delays the hero headline until the granules release (about 3.5s after the preloader), so
on a first visit the headline is a late LCP candidate. If mobile LCP fails, show the headline at
once on the low tier: in `HomeHero.tsx`, treat `quality === "low"` like reduced motion.
