# Motion system

Read from the live reference (superconscious-app.webflow.io) on 2026-11-13: its inline GSAP
scripts, the Webflow IX2 store (`Webflow.require('ix2').store`), and computed styles.
Reference stack: GSAP 3.15.0 + SplitText + ScrollTrigger + InertiaPlugin, Lenis, Lottie, particles.js.

## What the reference does, and where Phronem uses it

| # | Reference effect (exact values) | Phronem |
|---|---|---|
| 1 | **Preloader**, logo Lottie, fades after load (`autoAlpha 0`, 1s), once per session | `Preloader`: the emblem draws itself, then the wordmark. 2.2s, once per session, CSS only |
| 2 | **Lenis** smooth scroll | `runtime/smoothScroll.ts`, synced to ScrollTrigger |
| 3 | **particles.js** starfield across the page | `StarParticles`, fixed canvas: white stars drifting slowly and fading in and out |
| 4 | `data-split="from-right-blur"`: SplitText **chars**, from `x 6rem, blur .6rem, scale 1.2, opacity 0`, `back.out(1.2)`, 1.5s, stagger .05, trigger `top 80%`, once | Hero wordmark, section headlines, marquee, footer wordmark |
| 5 | `data-split="from-down-blur"`: SplitText **lines**, from `y 50%, blur .2rem, opacity 0`, `power2.out`, 1.5s, stagger .2 | Taglines, ledes, small headings, body paragraphs |
| 6 | `view-item="from-center"`: `scale .6, opacity 0` → `1`, transform 2s `cubic-bezier(.19,1,.22,1)`, opacity .2s, IntersectionObserver 20% | Record card, CTA panel, step cards, rings, audience panels, closing card |
| 7 | `view-item="from-down"`: same plus `translateY 50%` | Closing record, ledger rows |
| 8 | `view-list`: children get `.view` 100ms apart | Step cards, expert commitments, ledger, codes |
| 9 | **Inline icon tiles** (`view-item="about-tag"`): pills inside the headline grow from `0×0` to `11.5rem × 8rem`, margins `.5rem → 2rem`, 2s expo-out; inside, a looping line-art Lottie; gradient 2px border | Manifesto: three tiles inside "Strategic [orbit] decisions / built not on [rings] intuition / but on [converge] evidence", each with an animated geometric icon (panel orbit, five rings, judgments converging) |
| 10 | **Pinned About**: words `x -20rem, blur .6rem, opacity 0`, stagger .1, scrubbed 5%→40%; last word `y -24rem` 25%→70%; paragraph words un-blur line by line, scrubbed 30%→65% | Manifesto, same timings. "evidence." is the word that stays |
| 11 | **Logo scroll** (IX2 a-2): Lottie logo draws 20%→55%, ellipses fade, then rotate 0→360° and scale 1→1.4 by 100%; violet glow fades to .25 | `MarkSection`: the Phronem emblem (five rings, nine panel nodes) draws, then rotates and scales |
| 12 | **How it works** (a-18, re-measured with Claude in Chrome): headline `y 10% → 240%` of its own height; front layer items in **rem, where 1rem = 1vw** on that site: ring `20 → -50`, accent `50 → -100`, card 1 `20 → -40`, card 3 `50 → -50`, right photo `60 → -80`, bottom photo `20 → -40`, chart `20 → -10`; card line art rotates `0 → 360°`; smoothing 50. Cards: 1.3px gradient edge (accent → #1a1a1a at 50%), 25px radius, blurred glow, 50px icon badge, line art centred on the bottom-right corner. Widgets are looping Lottie files | "From question to record": the same values in vw, a spring for the smoothing, five step cards with line-art icons (`StepIcons.tsx`) and four looping SVG/CSS widgets (`HowWidgets.tsx`): ring counter, accent tile, record-version chart with a dot riding the line, expert profile described by role |
| 13 | **Inertia hover** (`data-hw-trigger`, ≥992px): on mouseenter the card is thrown by mouse velocity ×20, springs back, wobbles ±10° | Step cards and widgets |
| 14 | **Button inertia** (`data-hover-button`): same with velocity ×10, ±5° | Every `Button` (its background layer) |
| 15 | **Stack scroll** (a-4): card 2 starts `scale .8, y 10px, opacity .28`; 34%→65% it reaches 1; card 1 moves `y -100px` | Audience panels |
| 17 | **Text roll hover** (`text-hover-trigger`): chars `yPercent -100, blur .2rem` out, clone chars in from `yPercent 100`, `back.inOut(1.7)`, stagger .02 | Nav links, footer links |
| 18 | **Nav logo rotate** (a-21): logo turns 0→720° across the whole page | A ring of nine panel dots around the P monogram turns 720° (the letter itself stays upright) |

Not copied, on purpose: the custom ring cursor (accessibility and taste-skill ban), a 4s preloader
(shortened), and the purple palette.

## Rules

- Everything collapses to static under `prefers-reduced-motion` (no Lenis, no splits, no pinning).
- `html.js-motion` is set by an inline script before paint, so hidden start states never flash. A
  4s failsafe removes it if the runtime never starts, so content can never stay hidden.
- Only `transform`, `opacity` and `filter` animate (plus the tile size in #9, as the reference does).
