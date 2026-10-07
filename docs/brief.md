# Creative brief: Ground to Globe

## 1. Company

**JAYSN AGRO INDIA PRIVATE LIMITED**, based in Maharashtra, India.

- International trade: import and export.
- Manufacturing of two products: **fertilizer** and **cattle feed**.

Name rules: write `JAYSN AGRO INDIA PRIVATE LIMITED` in full, or `JAYSN AGRO` as the short
wordmark. No other variants.

## 2. Audience and the 20 second test

B2B buyers, importers, distributors, dealers, large farms and partner companies abroad.

After 20 seconds on the site a buyer should think: *this company is real, solid and operates at
scale.* Every decision is tested against that sentence. Spectacle that does not support it goes.

## 3. Site map

| Route | Purpose |
| --- | --- |
| `/` | Immersive scroll story through five chapters |
| `/services` | Import and Export, process, buyer questions |
| `/products` | Typographic index of the two products |
| `/products/fertilizer` | Detail page with macro 3D, bag, specs |
| `/products/cattle-feed` | Detail page with macro 3D, bag, specs |
| `/team` | Editorial team list, hover portraits, full screen profiles |
| `/contact` | Quote request that really sends, WhatsApp route |
| `/privacy`, `/terms` | Placeholder legal pages |

## 4. Concept: Ground to Globe

The site is **one continuous world**, not separate pages. A single persistent WebGL canvas sits
behind all content. The camera travels through the real business:

1. **Soil.** Macro view of fertilizer granules settling into farmland furrows.
2. **Stock.** Warm barn light, cattle feed pellets and grain, the animals the product feeds.
3. **Trade.** Bagged goods, stacked containers, a port at dusk. The camera rises to a dotted globe
   with animated trade routes from Maharashtra to the world.
4. **People.** The team who run it.
5. **Quote.** The invitation to start an order.

Routes are chapters of this world. Moving between pages is a camera move plus a shader
transition. Never a hard cut.

### The farm loop

Fertilizer feeds soil. Soil grows feed. Feed raises cattle. Cattle return to soil.
JAYSN AGRO supplies both ends of the loop and moves it across borders.

This idea appears in copy and in **one recurring visual motif**: a thin gold loop line that
draws itself as the user scrolls.

## 5. Visual system

### Colour (CSS variables only, never hard code hex elsewhere)

| Token | Hex | Use |
| --- | --- | --- |
| `--soil` | `#0C0F0B` | Main background |
| `--loam` | `#171C13` | Raised surface |
| `--moss` | `#3C4A2A` | Secondary green |
| `--grain` | `#C9A24B` | Brand gold. Lines, small labels, key numbers |
| `--bone` | `#EDE8DA` | Text on dark |
| `--clay` | `#8A5A3B` | Warm, Stock chapter |
| `--sea` | `#10303D` | Deep blue, Trade chapter |

The background tweens between chapters: soil, then clay tinted, then deep sea, then back to soil.
Text is mostly bone. Gold is used sparingly.

### Typography

- **Display:** Instrument Serif. Large, tight, italics for emphasis words.
- **Body:** Hanken Grotesk.
- **Labels and numbers:** JetBrains Mono, uppercase, small, wide tracking.

### Layout language

Strict 12 column grid. Very large type. Lots of dark space. Hairline gold rules. Index numbers
like (01). Small mono captions. Asymmetric placement. Imagery in plates with hard edges.
No rounded corner card grids.

## 6. Motion principles

- One easing family: `expo.out` for entrances, `power3.inOut` for scrubbed scroll. Defined once.
- Durations: micro 0.3s, standard 0.8s, large 1.2s to 1.6s. Nothing else.
- Smooth scroll with Lenis. Scroll is the main storyteller.
- Everything has weight and purpose. If a motion does not explain or guide, remove it.
- Pointer interaction is subtle and physical: particles move away, plates tilt a few degrees.
- `prefers-reduced-motion` gets a calm fallback that still looks designed.

## 7. Anti AI look checklist

Each item is a hard fail.

1. Purple or blue gradient blobs.
2. Glassmorphism, frosted card grids.
3. Emoji anywhere, icons inside coloured circles.
4. Hero with a centred headline plus three equal feature cards.
5. Lorem ipsum. Use believable placeholder copy, flagged as placeholder.
6. Generic stock photo look. Image slots are built for real client photography and keep exact
   aspect ratios.
7. Default fonts, default shadows, default borders. Every value comes from tokens.
8. Bouncy easing, random parallax, motion on every element.
9. Rounded pill buttons, soft drop shadows, rounded boxed inputs.
10. Centred everything. Prefer asymmetric placement on the grid.
11. Generated human faces or stock people.
12. Dashes used as sentence separators. Banned words (see content rules).

## 8. Tech direction

Next.js (App Router, TypeScript), React Three Fiber with drei and postprocessing, GSAP with
ScrollTrigger and SplitText, Lenis, Zustand, CSS Modules plus CSS variables. One persistent
Canvas in the root layout, dynamically imported. Mobile gets a reduced scene through quality
tiers.

## 9. Definition of done

- Builds with zero type and lint errors, zero console errors.
- Verified at 1440x900 and 390x844 with screenshots.
- 60 fps on a mid range laptop for the desktop scene, no layout shift, keyboard accessible.
- Passes the anti AI checklist and the content rules.

## 10. Chapter colour and light reference

| Chapter | Background | Light | Accent |
| --- | --- | --- | --- |
| Hero | soil | low warm sun from the right | grain |
| 01 Soil | soil | raking sun across furrows | grain |
| 02 Stock | soil mixed toward clay | warm barn window shaft | grain |
| 03 Trade | sea | dusk horizon | grain, bone for inbound |
| 04 People | soil | calm, low contrast | grain |
| 05 Quote | soil | globe at rest | grain |
