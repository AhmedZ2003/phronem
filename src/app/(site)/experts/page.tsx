import type { Metadata } from "next";
import { CalendarCheck, CurrencyCircleDollar, EyeSlash, LockKey } from "@phosphor-icons/react/dist/ssr";
import { EXPERTISE_AREAS, expertsPage } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ConvergeGlyph } from "@/components/visuals/Glyphs";

export const metadata: Metadata = {
  title: "For experts | Phronem",
  description: expertsPage.lede,
};

const benefitIcons = [CurrencyCircleDollar, CalendarCheck, EyeSlash, LockKey];

/**
 * The expert page, in the order the networks use (IDR /expert-community, GLG /for-experts,
 * Guidepoint /experts, Silverlight "Apply as an Expert"): the pitch, how it works, what we ask,
 * who it's for, the questions experts ask, and the way to apply.
 */
export default function ExpertsPage() {
  const p = expertsPage;
  return (
    <>
      <PageHero title={p.title} lede={p.lede}>
        <Button href={p.cta.href}>{p.cta.label}</Button>
        <Button href="#how" variant="ghost">
          {p.stepsTitle}
        </Button>
      </PageHero>

      {/* Benefits */}
      <section aria-label="Why experts work with Phronem" className="pb-20 md:pb-28">
        <Container>
          <ul data-view-list className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.benefits.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <li key={b.name} data-inertia="20">
                  <div
                    data-view="from-center"
                    className="h-full rounded-[var(--radius-panel)] border border-line p-6"
                    style={{ background: i % 2 === 0 ? "linear-gradient(126deg, rgb(var(--accent-rgb) / 0.3), var(--color-ink-3) 55%)" : "var(--color-ink-2)" }}
                  >
                    <Icon aria-hidden weight="light" className="size-8 text-signal" />
                    <h2 className="mt-8 text-lg font-medium text-fg">{b.name}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{b.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-24 border-y border-line bg-ink/50 py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <h2 id="how-title" className="text-[clamp(2.25rem,4.6vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.045em]">
              <span data-split="from-right-blur" data-split-stagger="0.03" className="block">
                {p.stepsTitle}
              </span>
            </h2>
            <div className="mt-10 hidden size-48 text-fg/70 lg:block" aria-hidden>
              <ConvergeGlyph />
            </div>
          </div>
          <ol data-view-list className="grid gap-3">
            {p.steps.map((s, i) => (
              <li key={s.name} data-view="rise" className="grid grid-cols-[auto_1fr] gap-5 rounded-[var(--radius-panel)] border border-line bg-ink-2 p-5">
                <span className="grid size-10 place-items-center rounded-full border border-signal/50 font-mono text-sm text-signal">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-medium text-fg">{s.name}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-fg-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* What we ask + who it's for */}
      <section aria-labelledby="ask-title" className="py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="ask-title" data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              {p.askTitle}
            </h2>
            <dl data-view-list className="mt-8 divide-y divide-line border-t border-line">
              {p.ask.map((a) => (
                <div key={a.name} data-view="rise" className="grid gap-1 py-5 sm:grid-cols-[0.7fr_1.3fr] sm:gap-6">
                  <dt className="font-medium text-fg">{a.name}</dt>
                  <dd className="text-[15px] leading-relaxed text-fg-2">{a.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              {p.whoTitle}
            </h2>
            <p data-split="from-down-blur" className="mt-6 text-lg leading-relaxed text-fg-2 font-medium">
              {p.who}
            </p>
            <p className="mt-10 text-[13px] text-fg-3">Areas we recruit for</p>
            <ul data-view-list data-view-step="50" className="mt-3 flex flex-wrap gap-2">
              {EXPERTISE_AREAS.map((a) => (
                <li key={a.slug} data-view="from-center" className="rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] text-fg">
                  {a.label}
                </li>
              ))}
              <li data-view="from-center" className="rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] text-fg">
                UK healthcare professionals
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 pb-20 md:pb-28">
        <Container className="max-w-[920px]">
          <h2 id="faq-title" data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
            {p.faqTitle}
          </h2>
          <div data-view-list className="mt-8 grid gap-3">
            {p.faq.map((f) => (
              <details key={f.q} data-view="rise" className="group rounded-[var(--radius-panel)] border border-line bg-ink-2 open:border-line-strong">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-lg text-fg [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-signal transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-relaxed text-fg-2">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Apply */}
      <section aria-labelledby="apply-title" className="pb-24 md:pb-32">
        <Container>
          <div
            data-view="from-center"
            className="rounded-[var(--radius-panel)] border border-line px-6 py-14 text-center sm:px-10 md:py-20"
            style={{ background: "radial-gradient(60% 80% at 50% 100%, rgb(var(--violet-rgb) / 0.5), transparent 70%), var(--color-ink-2)" }}
          >
            <h2 id="apply-title" className="text-[clamp(2.25rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.05em]">
              <span data-split="from-right-blur" data-split-stagger="0.03" className="block">
                Join the panel
              </span>
            </h2>
            <p data-split="from-down-blur" className="mx-auto mt-6 max-w-[46ch] text-lg text-fg-2 font-medium">
              Send a short note about your experience and the areas you know first-hand.
            </p>
            <div className="mt-9 flex justify-center">
              <Button href={p.cta.href}>{p.cta.label}</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
