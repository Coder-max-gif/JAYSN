@AGENTS.md

# Jaysn Agro web: rules for every session

Website for **JAYSN AGRO INDIA PRIVATE LIMITED** (Maharashtra, India). Import and export, plus
manufacturing of fertilizer and cattle feed. Concept: **Ground to Globe**.

## Before you touch anything

1. Read `/docs/brief.md` (creative brief) and `/docs/content-rules.md` (copy rules).
2. Skim `/docs/decisions.md` so you do not undo an earlier decision.
3. Use the project skills in `/.claude/skills`: `jaysn-design-tokens`, `jaysn-motion-rules`,
   `jaysn-copy-voice`. They are the source of truth for values, motion and voice.
4. If something is unclear, make the best call, log it in `/docs/decisions.md`, keep going.

## Name

- Always `JAYSN AGRO INDIA PRIVATE LIMITED` in full, or `JAYSN AGRO` as the short wordmark.
- Never "Jaysn Agro Pvt Ltd", "JAYSN", "Jaysn Agro India" or any other variant.

## Stack

- Next.js 16 App Router, TypeScript strict. `cacheComponents` is on: wrap any client component
  that reads `useSearchParams` in `<Suspense>`. Read `node_modules/next/dist/docs` before using
  an API you are not sure about.
- React Three Fiber, drei, @react-three/postprocessing. GSAP (ScrollTrigger, SplitText, Flip).
  Lenis smooth scroll. Zustand store. zod and react-hook-form for forms.
- CSS Modules plus CSS variables. No utility class framework. No inline hex values.

## Architecture

- One persistent R3F `<Canvas>` lives in the root layout (`/gl/Canvas.tsx`, dynamic, ssr false).
  It is never unmounted on navigation. DOM content scrolls above it.
- `/gl/SceneManager.tsx` mounts scene groups by route and by active chapter. Only the active
  chapter and its neighbours are mounted. Scenes animate in and out, they never pop.
- All WebGL code lives in `/gl`. Shaders in `/gl/shaders/*.glsl.ts` (exported strings).
- Lenis is created once in `/components/layout/ScrollProvider.tsx` and drives the GSAP ticker.
- Global state in `/store/useStore.ts`. Quality tiers in `/lib/quality.ts`.
- Motion constants in `/lib/motion.ts`, mirrored as CSS variables in `/styles/tokens.css`.
- Content in `/content/*.ts`. Every company fact is `{ value, verified }`.
- Page transitions go through `/components/layout/TransitionManager.tsx`. Use `<TLink>` or plain
  `<a href>`/`<Link>`; internal clicks are intercepted globally.

## Design rules (short version, full list in the brief)

- Tokens only: colours, type sizes, spacing, easing, durations. Never hard code a value that a
  token covers.
- 12 column grid, very large display type, dark space, hairline gold rules, mono index labels
  like (01), asymmetric placement, hard edged image plates.
- Gold (`--grain`) is rare: lines, small labels, key numbers.
- Forbidden: gradient blobs, glass cards, emoji, icons in coloured circles, rounded card grids,
  three equal feature cards, centred hero plus cards, default shadows, lorem ipsum, stock look,
  generated human faces.

## Motion rules (short version)

- Entrances: `expo.out`. Scrubbed scroll: `power3.inOut`. Nothing bouncy.
- Durations: micro 0.3s, standard 0.8s, large 1.2s to 1.6s. Text line stagger 0.06s.
- Every motion must explain, guide or add weight. Otherwise delete it.
- `prefers-reduced-motion` and the in page "Reduce motion" toggle give a calm, designed fallback.

## Copy rules (short version)

- Short, concrete sentences. Write like a trade company that ships real cargo.
- No em dashes, en dashes or spaced hyphens as separators. Compound words (20-foot) are fine.
- Banned: unleash, elevate, seamless, cutting-edge, state-of-the-art, game-changer, revolutionize,
  "in today's fast-paced world", "we are passionate about", world-class, one-stop solution,
  journey (unless about the camera).
- **Never invent company facts.** New facts go in `/content` with `verified: false`.
- Run `npm run check:copy` after writing copy.

## Commands

- `npm run dev` local dev. Keys: `d` FPS overlay, `g` grid overlay (dev only).
- `npm run typecheck`, `npm run lint`, `npm run build`.
- `npm run check:content` lists unverified facts. `STRICT_CONTENT=1` makes it fail.
- `npm run check:copy` scans copy for dashes, banned words and lorem ipsum.
- `npm run build:production` runs both checks in strict mode, then builds. Use for the live site.
- `npm run assets` optimises `/public/raw` into `/public/media`.
- `npm run geo` regenerates globe land points and the world map SVG path.
- `npm run shots` takes Playwright screenshots of every route into `/screenshots`.

## Definition of done

- Zero type errors, zero lint errors, zero console errors or hydration warnings.
- Verified with screenshots at 1440x900 and 390x844.
- 60 fps on a mid range laptop at the high tier, no layout shift, fully keyboard accessible.
- Passes the anti AI checklist in the brief and the content rules.

## Working habits

- Log every non obvious decision in `/docs/decisions.md` (date, decision, why).
- Commit after each finished step with a clear message.
- Dispose geometries, materials and textures on unmount. Check for memory growth.
- Real photos and video will replace placeholders. Keep image slots at exact aspect ratios.
