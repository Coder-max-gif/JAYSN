# Launch readiness

Status on 2026-10-07.

## Passed

- Type check, lint and production build clean. 28 routes prerender as static HTML.
- No console errors on any route (desktop and mobile) in a production build.
- Page transitions, back and forward, rapid clicks, menu, team deep links, form validation tested.
- No memory growth across 21 route changes.
- Copy check (`npm run check:copy`) passes: no dashes as separators, no banned words, name spelled right.
- SEO: unique titles and descriptions, canonical URLs, Open Graph image per page, sitemap.xml,
  robots.txt, JSON-LD (Organization with verified details only, WebSite, Service, Product without
  prices or ratings, breadcrumbs), branded 404.
- Security headers, immutable media caching, www to bare domain redirect, dev routes blocked in production.

## Blocked on the client (nothing goes live until these are done)

`npm run check:content` lists every one. `npm run build:production` refuses to build until they are
verified.

1. Contact details: email, phone, WhatsApp, hours, address, reply time.
2. Company facts: year established, history paragraph, GSTIN and IEC (if shown), port, tagline.
3. Products: real grades, specifications, bag sizes, container loading figures, feeding guides,
   and the signed specification PDFs (`/docs/specs`).
4. Trade: real destination and origin countries and ports, payment terms, documents, lead times,
   minimum order.
5. Home figures: capacity, protein percentage, countries served, headcount.
6. Team: real names, roles, bios, quotes, portraits (see `portrait-spec.md`) and permission to publish.
7. Photography and video for every image plate (see file 13 of the prompt pack).
8. Social profile links (hidden until supplied).
9. Legal review of the privacy and terms pages.

## Needs real hardware

- Lighthouse mobile and desktop per route, frame rates on a laptop and a mid range Android phone,
  Safari and Firefox checks. See `performance.md`.
- Screen reader passes. See `accessibility.md`.

## Needs configuration

- Resend account, verified domain, `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM`. Send a test enquiry.
- Optional analytics: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
