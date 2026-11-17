import type { Metadata } from "next";
import { Briefcase, Buildings, Check, HourglassMedium, ListChecks, LockKey, Scales, Stethoscope, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { compliancePage, ctas } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlowCard } from "@/components/ui/GlowCard";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Compliance | Phronem",
  description: compliancePage.lede,
};

const sectionIcons = { experts: UserCircle, clients: Buildings, employers: Briefcase, healthcare: Stethoscope, data: LockKey } as const;

const icon = (Icon: typeof Check) => <Icon aria-hidden weight="light" className="size-[22px]" />;

const titleClass = "relative mt-[22px] text-[22px] font-medium leading-[1.2] tracking-[-0.015em] text-fg";

/**
 * The compliance page, structured like Silverlight's and IDR's (For experts / For clients /
 * For employers) with Guidepoint's and Third Bridge's data-protection detail, plus Phronem's
 * healthcare-research rules from PREREQUISITES.md. Every block uses the homepage services card
 * (GlowCard: lilac edge, icon badge). Everything is stated as a commitment; policies
 * that are not written yet are listed as in preparation, never as held. Questions go to /contact.
 */
export default function CompliancePage() {
  const c = compliancePage;
  return (
    <>
      <PageHero title={c.title} lede={c.lede}>
        <Button href={ctas.contact.href} variant="ghost">
          Ask a compliance question
        </Button>
      </PageHero>

      {/* Section index + sections */}
      <section aria-label="Compliance commitments" className="card-panel mb-20 py-12 md:mb-28 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.6fr_2fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="sticky top-28 grid gap-1 text-[15px]">
              {[...c.sections.map((s) => ({ id: s.id, title: s.title })), { id: "codes", title: c.codes.heading }, { id: c.methodology.id, title: c.methodology.title }, { id: "preparing", title: c.preparing.title }].map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-full px-4 py-2 text-fg-2 transition-colors hover:bg-glass hover:text-fg">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-6">
            {c.sections.map((s) => (
              <article key={s.id} id={s.id} data-view="rise" className="scroll-mt-28">
                <GlowCard icon={icon(sectionIcons[s.id as keyof typeof sectionIcons] ?? Check)}>
                  <h2 className={titleClass}>{s.title}</h2>
                  <ul className="relative mt-5 grid gap-3">
                    {s.items.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-[1.55] text-fg/80">
                        <Check aria-hidden weight="bold" className="mt-1 size-4 shrink-0 text-signal" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlowCard>
              </article>
            ))}

            <article id="codes" data-view="rise" className="scroll-mt-28">
              <GlowCard icon={icon(ListChecks)}>
                <h2 className={titleClass}>{c.codes.heading}</h2>
                <ul className="relative mt-5 flex flex-wrap gap-2.5">
                  {c.codes.items.map((code) => (
                    <li key={code} className="rounded-full border border-line-strong bg-ink-2/60 px-4 py-2 text-[15px] text-fg">
                      {code}
                    </li>
                  ))}
                </ul>
                <p className="relative mt-6 max-w-[64ch] text-[14.3px] leading-[1.55] text-fg-3">{c.codes.note}</p>
              </GlowCard>
            </article>

            <article id={c.methodology.id} data-view="rise" className="scroll-mt-28">
              <GlowCard icon={icon(Scales)}>
                <h2 className={titleClass}>{c.methodology.title}</h2>
                <p className="relative mt-4 max-w-[64ch] text-[15px] leading-[1.55] text-fg/80">{c.methodology.intro}</p>
                <p className="relative mt-6 text-[13px] text-fg-3">Current priorities</p>
                <ul className="relative mt-3 grid gap-2 sm:grid-cols-2">
                  {c.methodology.priorities.map((p) => (
                    <li key={p} className="rounded-[var(--radius-chip)] border border-line bg-ink-2/60 px-4 py-3 text-[15px] text-fg">
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="relative mt-6 max-w-[64ch] text-[15px] leading-[1.55] text-fg/80">
                  {c.methodology.review.before}
                  <strong className="font-medium text-fg">{c.methodology.review.strong}</strong>
                  {c.methodology.review.after}
                </p>
              </GlowCard>
            </article>

            <article id="preparing" data-view="rise" className="scroll-mt-28">
              <GlowCard icon={icon(HourglassMedium)}>
                <h2 className={titleClass}>{c.preparing.title}</h2>
                <p className="relative mt-4 max-w-[64ch] text-[15px] leading-[1.55] text-fg/80">{c.preparing.text}</p>
                <ul className="relative mt-6 grid gap-2 sm:grid-cols-2">
                  {c.preparing.items.map((p) => (
                    <li key={p} className="rounded-[var(--radius-chip)] border border-dashed border-line-strong px-4 py-3 text-[15px] text-fg-2">
                      {p}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </article>
          </div>
        </Container>
      </section>
    </>
  );
}
