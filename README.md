# JAYSN AGRO INDIA PRIVATE LIMITED: website

"Ground to Globe". An immersive site for a Maharashtra company that makes fertilizer and cattle feed
and runs import and export. One persistent WebGL world sits behind every page: granules form the
wordmark and pour into farmland, feed fills a trough, the camera rises from a port at dusk to a
globe of trade routes.

Built with Next.js 16, React Three Fiber, GSAP and Lenis. See `CLAUDE.md` for the rules and
`docs/brief.md` for the creative brief.

## Run it

You need Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

In development: press `d` for frame stats, `g` for the 12 column grid. `/styleguide` shows every
token and component. `/dev` shows a canvas test.

## Pages

| URL | What it is |
| --- | --- |
| `/` | The scroll story: Soil, Stock, Trade, People, Quote |
| `/services` | Import and Export, specifications, process, buyer questions |
| `/products`, `/products/fertilizer`, `/products/cattle-feed` | Product index and details |
| `/team` | Team list, portraits, full screen profiles (`/team?member=slug`) |
| `/contact` | Quote form, WhatsApp, location |

## Edit the words (no coding needed)

All text and company facts live in `/content`:

| File | What it holds |
| --- | --- |
| `content/company.ts` | Name, region, tagline, year, port, GST and IEC, social links |
| `content/contact.ts` | Email, phone, WhatsApp, address, hours, form options |
| `content/home.ts` | Home hero and the five chapters |
| `content/services.ts` | Import and export text, specs, destination and origin ports, process, FAQ |
| `content/products.ts` | Both products: specs, grades, uses, packing, process |
| `content/team.ts` | Team members and the team page text |

A fact looks like `fact("12,000", false)`. The second value is **verified**. Change it to `true` only
when the client has confirmed it in writing. Unverified facts show a small gold **TBC** on the site.

Write like a trade company: short sentences, no dashes between phrases, none of the banned words in
`docs/content-rules.md`. Then run:

```bash
npm run check:copy       # dashes, banned words, company name
npm run check:content    # lists every fact still to confirm
```

## Add photos, video and portraits

1. Put originals in `/public/raw/<folder>` (`fertilizer`, `cattle-feed`, `warehouse`,
   `port-and-containers`, `quality`, `team`, `video`, `logo`).
2. Run `npm run assets`. Images become AVIF and WebP in `/public/media`. For videos it prints the
   ffmpeg commands to run.
3. Point the image plate at the file. Each `ImagePlate` takes `src` (image) or `video`, and keeps its
   aspect ratio. Team portraits: set `portrait` in `content/team.ts`. Follow `docs/portrait-spec.md`.

## Build

```bash
npm run typecheck && npm run lint
npm run build              # preview build, TBC markers allowed
npm run build:production   # live build: fails while any fact is unverified or copy breaks the rules
npm run shots              # screenshots of every route into /screenshots (needs the site running)
```

## Deploy (Vercel recommended)

1. Push this folder to a private GitHub repository.
2. In Vercel: New Project, import the repository. Framework preset: Next.js.
3. Build command: `npm run build:production` (use `npm run build` for preview deployments).
4. Environment variables (Project, Settings, Environment Variables), see `env.example`:
   - `RESEND_API_KEY` (required): from resend.com after verifying the domain.
   - `ENQUIRY_TO` (required): where quote requests go, for example `info@jaysnagro.com`.
   - `ENQUIRY_FROM` (required): sender on the verified domain, for example
     `JAYSN AGRO website <website@jaysnagro.com>`.
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional): `jaysnagro.com` to enable cookie free analytics.
5. Domains: add `jaysnagro.com` and `www.jaysnagro.com`. At the domain registrar set the A record of
   `jaysnagro.com` to `76.76.21.21` and a CNAME for `www` to `cname.vercel-dns.com` (Vercel shows the
   exact values). HTTPS is issued automatically. The app redirects `www` to the bare domain.
6. Security headers, caching and compression are configured in `next.config.ts`.

Another host works too: any Node 20 server can run `npm run build:production && npm start`.

## Launch checklist

1. Replace every placeholder photo, video and portrait with real client material.
2. Confirm every fact with the client and set `verified: true` (`npm run check:content` shows zero).
3. Have the privacy and terms pages reviewed.
4. Set the email variables and send a real test enquiry from the live site. Confirm it arrives and
   that replying goes to the buyer.
5. Click the WhatsApp buttons on a phone.
6. Run Lighthouse on every page (mobile and desktop) and test on a real mid range Android phone.
7. Submit `https://jaysnagro.com/sitemap.xml` in Google Search Console.
8. Create or update the Google Business Profile with the verified address, phone and hours.
9. Back up the repository (a second remote or a downloaded archive) and tag the release.

## Documentation

`docs/brief.md`, `docs/content-rules.md`, `docs/decisions.md`, `docs/performance.md`,
`docs/accessibility.md`, `docs/launch-readiness.md`, `docs/portrait-spec.md`.
Project skills for Claude Code live in `.claude/skills`, the reviewer subagent in `.claude/agents`.
