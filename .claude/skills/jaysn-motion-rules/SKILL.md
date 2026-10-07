---
name: jaysn-motion-rules
description: Use whenever you add or change any animation, transition, GSAP timeline, ScrollTrigger, Lenis behaviour, WebGL animation uniform, cursor or pointer effect, hover state or reduced motion handling in the Jaysn Agro site. Defines the only allowed easings and durations and what is forbidden.
---

# Jaysn motion rules

Source of truth: `/lib/motion.ts` (JS) and the motion tokens in `/styles/tokens.css` (CSS).

## Easing (one family)

| Name | GSAP | CSS token | Use |
| --- | --- | --- | --- |
| entrance | `expo.out` | `--ease-out` | Anything appearing, reveals, hovers |
| scrub | `power3.inOut` | `--ease-in-out` | Scroll scrubbed values, camera moves, layout morphs |
| exit | `expo.in` | `--ease-in` | Only for covering transitions before a route change |

## Durations (nothing else)

| Name | Seconds | CSS token |
| --- | --- | --- |
| micro | 0.3 | `--dur-micro` |
| standard | 0.8 | `--dur-standard` |
| large | 1.2 | `--dur-large` |
| xlarge | 1.6 | `--dur-xlarge` |

Line stagger for text reveals is `STAGGER.line` (0.06s). Lists use `STAGGER.item` (0.08s).
The page transition cover and reveal are 0.9s each (brief exception, logged in decisions).

## Scroll

- Lenis is the only scroll engine. It drives `gsap.ticker`; ScrollTrigger reads Lenis scroll.
- Scroll is the storyteller: camera rail, background theme, the gold loop line.
- Pin only where it improves the story (process timeline). Never pin more than 2 sections a page.
- After a route change: reset scroll to top while covered, then `ScrollTrigger.refresh()`.

## Pointer

- Subtle and physical. Particles are pushed with falloff and spring back. Plates tilt 2 to 4
  degrees. Magnetic buttons move about 8px.
- Cursor ring follows with inertia but clicks never lag more than about 80ms.
- Nothing depends on hover alone. Touch devices get tap equivalents.

## Reduced motion

- Triggered by `prefers-reduced-motion` or the in page "Reduce motion" toggle
  (`html[data-motion="reduce"]`, store `reducedMotion`).
- Removes camera moves, particle motion, page sweeps, smooth scroll, parallax and sound.
- Keeps design: static composition, simple 0.3s opacity fades.

## Forbidden

- Bouncy, elastic or back easings. Springs that overshoot visibly.
- Random parallax. Motion on every element. Animations that fire twice.
- Animating width, height, top or left on large elements (use transforms and clip-path).
- Durations outside the table above (log a justification in `/docs/decisions.md` if needed).
