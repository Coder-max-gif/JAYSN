# Content rules

## Voice

- Sentences are short, concrete and specific. Write like a trade company that ships real cargo.
- Prefer units, ports, packaging sizes and plain verbs over adjectives.
- Say what happens, who does it and when. "We load at Nhava Sheva." beats "We offer logistics."
- Read every line aloud. If it sounds like a brochure, rewrite it more plainly.

## Punctuation

- Do not use em dashes, en dashes or hyphens as separators inside sentences.
  Use full stops or commas.
- Hyphens inside compound words and numbers are allowed: 20-foot, 40-foot, 25 kg, 50-kg bag,
  cross-border.

## Banned words and phrases

unleash, elevate, seamless, cutting-edge, state-of-the-art, game-changer, revolutionize,
"in today's fast-paced world", "we are passionate about", world-class, one-stop solution,
journey (unless it is about the camera).

`npm run check:copy` enforces this list.

## Company name

Always `JAYSN AGRO INDIA PRIVATE LIMITED` in full, or `JAYSN AGRO` as the short wordmark.

## Facts and verification

- All company facts (certifications, years, tonnage, countries, names, addresses, phone, email,
  specifications, lead times) live in `/content/*.ts` as `{ value, verified }`.
- **Nothing marked `verified: false` may be presented as fact.**
- In development, unverified values render with a small gold `TBC` marker and dotted underline so
  everyone can see what still needs confirming.
- `npm run check:content` lists every unverified fact. With `STRICT_CONTENT=1` (used by
  `npm run build:production`) it fails the build, so nothing unverified ships to the live site.
- Contact details from the client template: email `info@jaysnagro.com`, phone and WhatsApp
  `+91 98765 43210`. Both are `verified: false` until confirmed.

## Placeholders

- No lorem ipsum. Placeholder copy must be believable and specific, and flagged.
- Image placeholders name what the real photo should be, for example
  "Photo: warehouse loading, to be supplied".
- Team placeholders use believable Indian names and roles, flagged unverified.
  Never generate fake faces.
