import { ArrowUpRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { standards } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { GlowCard } from "@/components/ui/GlowCard";
import { Slideshow } from "@/components/ui/Slideshow";
import { AssuranceIcon, type AssuranceIconName } from "@/components/visuals/AssuranceIcons";

/**
 * "Rigorous about method. Honest about stage." What an agency's compliance team checks first
 * (PREREQUISITES.md stages 1-4), stated as commitments, never as credentials Phronem does not hold.
 *
 *   header      two-tone headline
 *   slideshow   the services layout and card (GlowCard): the four things in writing before any
 *               fieldwork, each icon in its own hue (lavender, violet, orchid, ember), then the
 *               Compliance card with a Learn More link to /compliance
 *
 * Motion: headline by character, text by line, the slideshow rises in and advances on its own.
 */
export function Standards() {
  const s = standards;
  const [first, second] = s.title.split(". ");
  const c = s.complianceCard;

  return (
    <section id="standards" aria-labelledby="standards-title" className="scroll-mt-20 py-24 md:py-32">
      <Container>
        <h2 id="standards-title" aria-label={s.title} className="text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
          <span aria-hidden data-split="from-right-blur" data-split-stagger="0.025" className="block">
            {first}.
          </span>
          <span aria-hidden data-split="from-right-blur" data-split-stagger="0.025" className="block pb-1 font-medium italic text-fg-3">
            {second}
          </span>
        </h2>
      </Container>

      <div data-view="rise" className="card-panel mt-14 py-8 sm:py-10">
        <Slideshow label={s.engagement.heading} slideClassName="w-[min(82vw,360px)]">
          {[
            ...s.engagement.items.map((item) => (
              <GlowCard
                key={item.name}
                className="h-full"
                icon={
                  <span className="grid size-full place-items-center" style={{ color: `rgb(var(--icon-${item.hue}-rgb))` }}>
                    <AssuranceIcon name={item.icon as AssuranceIconName} className="size-[24px]" />
                  </span>
                }
              >
                <span className="absolute right-[24px] top-[30px] rounded-full border border-line px-2.5 py-1 text-[12px] text-fg-2">In writing</span>
                <h3 className="relative mt-[22px] text-[19px] font-medium leading-[1.2] tracking-[-0.01em] text-fg">{item.name}</h3>
                <p className="relative mt-3 flex-1 text-[14.3px] leading-[1.5] text-fg/80">{item.text}</p>
                <p className="relative mt-8 text-sm text-fg-3">Before any fieldwork</p>
              </GlowCard>
            )),
            <a key="compliance" href={c.cta.href} draggable={false} className="group block h-full rounded-[25px]">
              <GlowCard className="h-full" icon={<ShieldCheck aria-hidden weight="light" className="size-[22px]" />}>
                <span className="absolute right-[24px] top-[30px] rounded-full border border-line px-2.5 py-1 text-[12px] text-fg-2">Compliance</span>
                <h3 className="relative mt-[22px] text-[19px] font-medium leading-[1.2] tracking-[-0.01em] text-fg">{c.title}</h3>
                <p className="relative mt-3 flex-1 text-[14.3px] leading-[1.5] text-fg/80">{c.text}</p>
                <span className="relative mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-signal">
                  {c.cta.label}
                  <ArrowUpRight aria-hidden weight="bold" className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </GlowCard>
            </a>,
          ]}
        </Slideshow>
      </div>
    </section>
  );
}
