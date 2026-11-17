# Phronem Revamped

A new landing page for Phronem, built separately from the existing site in `../phronem`
(nothing there was changed). Layout follows the Superconscious Webflow template; copy merges
Phronem's decision-support content with the healthcare-recruitment business described in
PREREQUISITES.md.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Motion · Phosphor icons.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
pnpm lint
pnpm typecheck
```

## Layout

```
docs/information-architecture.md  What the six expert networks put where, and Phronem's version
docs/design.md            Design read, tokens, section map, content rules, open items
docs/motion.md            Every animation, read from the reference, and where Phronem uses it
src/
  app/                    root layout (fonts, boot script, preloader, starfield, motion runtime,
                          dialog), globals.css (tokens + motion states), icon, robots, sitemap, 404
    (site)/               shared header + footer layout, and the pages:
                          / · /services/[slug] (8, static) · /experts · /compliance
  content/site.ts         Every visible string, each tagged PHRONEM / PREREQ / NEW
  content/services.ts     The eight services (menu, homepage grid, service pages, footer, sitemap)
  content/expertise.ts    The twelve expertise areas
  lib/gsap.ts             GSAP + SplitText + ScrollTrigger + InertiaPlugin, registered once
  components/
    layout/               SiteHeader, SiteFooter, Preloader
    sections/             Homepage sections, in page order: Hero, MethodStrip, MarkSection,
                          Manifesto, ServicesSection, HowItWorks, WhyPhronem, Audiences,
                          ExpertsBand, Standards, ClosingRoutes;
                          Framework (used on the record's service page)
    motion/               MotionRuntime (mounted once) and runtime/: smooth scroll (Lenis),
                          split reveals, view-item observer, inertia hover, text roll, nav ring;
                          RollText
    visuals/              ExpertSphere, Emblem, Glyphs (word-tile icons), StarParticles,
                          RecordCard, StepIcons, HowWidgets, FeatureWidgets, PanelConstellation
    ui/                   Button, Container, Logo, PageHero (inner pages)
  lib/cn.ts               className helper
```

### Adding motion to new markup

No JavaScript needed per component; use attributes:

| Attribute | Effect |
|---|---|
| `data-split="from-right-blur"` | characters slide in from the right, de-blurring (big headlines) |
| `data-split="from-down-blur"` | lines rise and de-blur (body, small headings) |
| `data-view="from-center"` / `"from-down"` / `"rise"` | element scales or rises in when 20% visible |
| `data-view-list` | its `data-view` children enter 100ms apart |
| `data-inertia="20"` | thrown by the mouse on hover, springs back (desktop) |
| `data-roll` + `<RollText>` | label rolls on hover |

All of it is skipped under reduced motion.

To change copy, edit `src/content/` only. To add a service, add an entry to `services.ts`: the menu,
the homepage grid, its page, the footer and the sitemap all follow.

## Contact form

`/contact` posts to `src/app/api/contact/route.ts`, which validates the message (rules shared with
the form in `src/lib/contact.ts`) and delivers it by the method set in the environment. Copy
`.env.example` to `.env.local` and set either `CONTACT_WEBHOOK_URL` or the three `RESEND_*`
/ `CONTACT_*_EMAIL` variables. Without either, development logs submissions to the console and
production answers 503, so a message is never reported as sent when it went nowhere.

## Operator desk (/operators)

An internal expert qualification desk for Phronem's operators: a register of expert files with
screening, verification, a pass/fail compliance gate, a 100-point scorecard, four sign-offs, project
matching, post-call performance and a milestone audit trail. Each operator has their own account.

Set `OPERATOR_SESSION_SECRET` and the `SEED_OPERATOR_*` variables in `.env.local` (see
`.env.example`), start the site, and sign in at `/operators/sign-in`. Manage accounts with
`pnpm operators`. Records and accounts live in `.data/`, which is git-ignored. Rules are tested
with `pnpm test`. Full guide: [docs/operators.md](docs/operators.md).
