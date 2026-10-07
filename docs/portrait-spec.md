# Team portrait specification

Give this page to the photographer. Every portrait must match so the team page reads as one set.

## Frame

- **Ratio 4:5, portrait orientation.** Minimum 2000 x 2500 px. Shoot RAW or highest quality JPEG.
- **Waist up.** Top of the head about 10 percent below the top edge. Eyes on the upper third line.
- Person centred, shoulders slightly turned (about 15 degrees), face toward the camera.
- Leave space on both sides; the site crops a little on small screens.

## Background

- Plain, dark and even: charcoal or deep olive (close to `#171C13`). Matte, no texture, no logo wall.
- At least 1.5 m between the person and the background so it falls off softly.

## Light

- One large soft key light from the person's left at about 45 degrees, slightly above eye level.
- Gentle fill from the right, about two stops under the key. No hard shadows on the background.
- Same light, same camera height and same lens for every person. 85 mm equivalent is ideal.
- Fixed white balance around 5000 K. No filters or heavy retouching.

## People

- Natural expression. Work clothes in solid colours, no large logos.
- Glasses are fine; angle them to avoid reflections.

## Delivery

- File names: `firstname-lastname.jpg` (lowercase), for example `sneha-kulkarni.jpg`.
- Put originals in `/public/raw/team/`. Run `npm run assets`, then set `portrait` in
  `/content/team.ts` to `/media/team/firstname-lastname-1280.webp`.
- Written permission to publish from each person. Set `verified: true` on their entries only after that.

## Alt text

Generated as "Name, Role" from the content file. Keep names and roles exactly as they should appear.
