# Accessibility (target WCAG 2.2 AA)

## Built in

- Semantic landmarks: header, nav (main, footer, chapters, menu), main, footer. One h1 per page.
- Skip link to `#main`. Focus moves to `#main` after every page transition.
- Visible focus: hairline gold outline everywhere, underline focus on form fields.
- Menu overlay and team profile are `role="dialog"` with `aria-modal`, focus trap, Esc to close,
  focus returned to the opener. Body scroll is stopped while open.
- Accordion: real buttons, `aria-expanded`, `aria-controls`, panels `role="region"` and `inert` when closed.
- Form: visible labels on every field, `aria-invalid` and `aria-describedby` on errors, the first
  invalid field receives focus, `aria-live` regions for errors and status. Country is an ARIA
  combobox with a listbox (arrow keys, Enter, Esc). Honeypot hidden from assistive tech.
- All WebGL canvases are `aria-hidden`; the same content exists as real text (route lists, product
  data, team names). Canvas wordmark is decorative; the h1 is real text.
- Unverified facts carry a "to be confirmed" label for screen readers next to the TBC marker.
- Reduced motion: honours `prefers-reduced-motion` and adds a visible "Reduce motion" toggle
  (remembered). It removes camera moves, particle motion, page sweeps, smooth scroll, pinning,
  parallax, grain animation and sound. Text appears without line reveals.
- Text over WebGL sits on soft radial scrims so particles never cut contrast. Body text is bone on
  near black (about 15:1); dimmed text is 72 percent bone (above 9:1); faint captions are 50 percent
  (about 6:1). Gold `#C9A24B` on soil is about 8:1.
- Bag viewer is focusable, labelled, and turns with the arrow keys. Touch targets are at least 44px.
- No JavaScript: all text renders; reveal hidden states are only applied when JS runs.

## Checked here

- Keyboard: menu open, focus lands on the first link, Esc closes. Team deep link opens the profile,
  arrow keys step through people, Esc closes and restores the URL. Empty form submit focuses the
  name field and shows plain errors. (Automated with Playwright, 2026-10-07.)

## Manual checks still to do

- Screen reader pass with NVDA (Windows) and VoiceOver (iOS and macOS) on every page.
- axe DevTools on every route; record results here.
- 200 percent browser zoom on every page.
- Windows High Contrast mode on the form.
