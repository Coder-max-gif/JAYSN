---
name: jaysn-copy-voice
description: Use whenever you write or edit any user facing text for the Jaysn Agro site, including content files in /content, headings, buttons, form messages, alt text, metadata and JSON-LD. Defines voice, banned words, the dash rule and the fact verification rule.
---

# Jaysn copy voice

## Voice

- A trade company that ships real cargo. Short, concrete, specific sentences.
- Units, ports, bag sizes, container sizes, plain verbs. Few adjectives.
- Confident, not loud. No exclamation marks.
- Read it aloud. If it sounds like a brochure, rewrite it more plainly.

## The dash rule

No em dashes, en dashes or spaced hyphens used to separate parts of a sentence.
Use full stops or commas. Compound words and numbers keep their hyphen: 20-foot, 25-kg.

## Banned

unleash, elevate, seamless, cutting-edge, state-of-the-art, game-changer, revolutionize,
"in today's fast-paced world", "we are passionate about", world-class, one-stop solution,
journey (unless it is about the camera), lorem ipsum.

## Name

`JAYSN AGRO INDIA PRIVATE LIMITED` in full or `JAYSN AGRO` as the wordmark. Nothing else.

## Facts

- Never invent a company fact. Facts live in `/content/*.ts` as `{ value, verified }`.
- New facts start `verified: false`. Only the client can make them true.
- Render facts through `<Fact>` or `factText()` so unverified ones are visibly marked in
  development and blocked by `npm run build:production`.
- Run `npm run check:copy` and `npm run check:content` after editing copy.
