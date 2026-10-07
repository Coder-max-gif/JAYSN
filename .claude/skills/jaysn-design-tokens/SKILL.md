---
name: jaysn-design-tokens
description: Use whenever you write or change CSS, CSS Modules, inline styles, SVG colours, canvas or shader colours, spacing, type sizes or layout in the Jaysn Agro site. Lists every design token (colour, type scale, spacing, grid, z-index) and forbids hard coded values.
---

# Jaysn design tokens

Source of truth: `/styles/tokens.css`. JS mirror for WebGL and canvas colours: `/lib/palette.ts`.
**Never hard code a hex value, font size, spacing value, easing or duration that a token covers.**
If you need a value that does not exist, add a token, use it, and log it in `/docs/decisions.md`.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--soil` | #0C0F0B | Main background |
| `--loam` | #171C13 | Raised surface, placeholder plates |
| `--moss` | #3C4A2A | Secondary green |
| `--grain` | #C9A24B | Gold. Lines, small labels, key numbers only |
| `--bone` | #EDE8DA | Text on dark |
| `--clay` | #8A5A3B | Stock chapter warmth |
| `--sea` | #10303D | Trade chapter |

Semantic aliases (use these in components): `--bg`, `--surface`, `--text`, `--text-dim`,
`--text-faint`, `--line`, `--line-strong`, `--accent`, `--focus`.
Chapter themes set `data-theme` on `<html>`: `soil`, `clay`, `sea`. `--bg` and `--accent`
transition over `--dur-large`.

## Type scale (fluid, clamp based)

| Token | Use |
| --- | --- |
| `--fs-display-xl` | Hero words, product names, up to about 14vw |
| `--fs-display-l` | Chapter headlines |
| `--fs-display-m` | Section headlines |
| `--fs-heading` | Small headings, table titles |
| `--fs-body-l` | Lead paragraphs |
| `--fs-body` | Body |
| `--fs-label` | Mono labels, 11 to 12px, uppercase, `--track-label` 0.14em |
| `--fs-caption` | Captions |

Families: `--font-display` (Instrument Serif), `--font-body` (Hanken Grotesk),
`--font-mono` (JetBrains Mono). Display line height `--lh-display`, body `--lh-body`.

## Spacing (8px unit)

`--space-1` 4px, `--space-2` 8px, `--space-3` 16px, `--space-4` 24px, `--space-5` 32px,
`--space-6` 48px, `--space-7` 64px, `--space-8` 96px, `--space-9` 128px.
Sections: `--section-s`, `--section-m`, `--section-l` (fluid).

## Grid

12 columns. `--gutter` 24px desktop, 16px mobile. `--margin` scales with the viewport.
Use the `.grid` class from `global.css` and `grid-column` spans. Toggle the overlay with `g`.

## Shape

Radius is `0` everywhere. Borders are hairlines: `1px solid var(--line)`.
No box shadows. Depth comes from light and layering, not drop shadows.

## Layers

`--z-canvas` 0, `--z-content` 1, `--z-loop` 2, `--z-header` 40, `--z-menu` 50, `--z-profile` 60,
`--z-transition` 80, `--z-preloader` 90, `--z-cursor` 95, `--z-grain` 99.
