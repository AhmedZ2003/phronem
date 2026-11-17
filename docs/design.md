# Design notes

## Design read

B2B landing page for research agencies, strategy leads and experts. Dark, cinematic structure
taken from the Superconscious template, with Phronem's own deep marine (#1C3D5A) replacing the
template's violet. Dials (taste skill): variance 7, motion 6, density 3.

Skills used: `design-taste-frontend` (Vantora `.agents/skills`) and `ui-ux-pro-max` (plugin).
The latter's generated system (neumorphism, cyan) did not fit the brief. Only its warnings
were kept: no AI-purple, trust-first.

## Hero object

The template shows a phone. Phronem's hero shows **the method**: a turning sphere of experts
(the vetted network). Nine of them are lit (one panel), and each sends its judgment separately
into a single core, which is where the record forms. In front floats a real, readable
Decision Confidence Record (the illustrative Nordic example), tilted like the template's
phone and following the pointer. Canvas 2D, pauses off-screen, still frame under reduced motion.

## Section map (template → Phronem)

| Template | Phronem |
|---|---|
| Hero: wordmark, phone, waitlist pill | Hero: wordmark, tagline, expert sphere + expert shortlist card |
| Pinned word-by-word statement | Manifesto: "Better strategic decisions. Built on evidence, not intuition." |
| Floating step cards over a giant headline | How it works: Frame, Elicit, Test, Score, Revisit |
| Feature list | Framework: five equal rings + dimension tabs (weights never shown) |
| For individuals / For business | Sticky stack: organizations, research agencies, experts |
| Giant wordmark ticker | Omitted (the expertise marquee was removed) |
| (added) | Standards: honest stage, what's in writing before fieldwork, codes |
| Closing CTA, two-tier footer | Same |

## Tokens

**Themes.** The active theme is set in `src/theme.ts` (one word). Two are defined in
`src/app/globals.css`:

- **Nebula** (`"nebula"`): the palette below, violet and lavender from the reference. The original.
- **Ember** (`"ember"`): warm orange. Accent #ff9a4d, highlight #ffc89a, glow #e8622c, deep rust
  #9a2b0c, amber / orange / peach / red icon hues, a fire-coloured footer light and a warm bevel.

Both keep the same background and text colours. Everything coloured reads the theme variables,
including the hero sphere canvas, the footer light and the wordmark bevel. The favicon
(`src/app/icon.svg`) is a static file and stays violet.

**"Color Bends" background.** React Bits' ColorBends shader (three.js) runs as an extra
full-page layer behind everything, under the star field / net, at 50% opacity in dark mode and
35% in light. Colours follow the theme: Nebula lilac #ddb5fc, lavender #b9a3ff, violet
#8f69e0, indigo #4700d6 (Ember: peach, orange, burnt orange, rust). Switch it off with
`COLOR_BENDS` in `src/theme.ts`; that comment lists the files to delete to remove it entirely.

**Light mode.** A round sun / moon button fixed in the bottom-right corner sets `data-mode="light"` on `<html>`; the choice is
saved in localStorage (`phronem-mode`) and applied before paint. Dark is the default. Light mode
works with either theme: a light lavender-white page (#f5f3fa), espresso-violet text (#1b1626),
accents darkened for contrast (Nebula #6a4bd8, Ember #c2410c), pastel footer light, translucent
white card bodies with a faint edge so cards blend in, and a full-width band, a touch darker than the
page, behind each group of cards (`.card-panel`). The backdrop canvas swaps live: dark mode keeps the white star field; light mode draws a fine
dot grid and a slowly drifting network of violet points joined by thin lines (linking to the
pointer). The hero sphere re-colours live.

Reference palette (2026-11-13, replacing the warm light and galaxy themes). Every value was
measured from the reference template's computed styles (superconscious-app.webflow.io). Defined
once in `src/app/globals.css` (`@theme` plus `*-rgb` channel variables in `:root`). Page theme is
locked dark.

| Token | Value | Reference source |
|---|---|---|
| ink → ink-4 | #0c0b0c, #0f0d10, #1a1a1a, #2c2c2c | page, stack card, how-work card, card icon |
| fg, fg-2, fg-3 | #ffffff, #9e9d9e (white 60%), #807f81 | headings, secondary text, quiet labels |
| marine / marine-2 | #4700d6 / #8f69e0 | gradient indigo / hero-top-blur violet |
| signal / signal-2 | #b9a3ff / #ddb5fc | tag lavender / card-edge lilac |
| button | #ffffff, ink label, 14px corners | main-button |
| glass | white 10%, blur 12.96px, no edge | nav-container, hero-download-app |
| icon hues | #b9a3ff, #8f69e0, #edc5fc, #e73825 | standards icons only |

Hero light: `.hero-top-blur`, a #8f69e0 block 70vw × 20vw at -13vw, blurred 11vw (as measured).
Footer light: `.footer-glow`, the reference footer's background image rebuilt as CSS gradients
from sampled pixels (lilac core #d7a9f4 → violet #6722e1 → indigo, blue lobe #2120ac on the right).
Backdrop: white star particles drifting and fading on a fixed canvas (`StarParticles.tsx`), as the
reference's particles.js field. Radius rule: buttons and nav 14px, panels and cards 22px, chips
10px. Fonts: Wix Madefor Display (the reference's typeface; the "What Phronem does" paragraph in bold
italic) + JetBrains Mono for record labels.

## Content rules

- No client names, metrics, logos, advisors or testimonials.
- The five weights are never published.
- External review is planned, not under way. Recalibration after about 200 outcomes.
- Nothing is described as obtained (training, membership, certification) until it is.
- No em dashes. US English.

## Open items for the founder

1. Review every string marked `NEW` in `src/content/site.ts`.
2. **Where we operate.** PREREQUISITES.md says to be open about being new and where the team
   is based. The page says Phronem is new but does not state a location. Add it once decided.
3. CTAs are `mailto:` links to ibraheem@phronem.com, so the site collects no personal data. If a
   form is added, a privacy notice must be published first.
4. No privacy or terms pages exist on this site yet.
5. Photography: none is used. If wanted, generate section imagery (for example, the agencies
   panel) and add it under `public/`.
