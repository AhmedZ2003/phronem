import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { serviceGroups, serviceHref, services, servicesPage } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { GlowCard } from "@/components/ui/GlowCard";
import { Slideshow } from "@/components/ui/Slideshow";
import { serviceIcons } from "@/components/visuals/serviceIcons";

const groupTitle = Object.fromEntries(serviceGroups.map((g) => [g.id, g.title]));

/**
 * The services every expert network leads with (IDR's six cards, GLG's "How we help",
 * Third Bridge's "Our services"), as a slideshow: one card per service, in the same card design
 * as "From question to record" (GlowCard), each linking to its own page. Auto-advances while on
 * screen; arrows, drag and swipe move it by hand.
 */
export function ServicesSection() {
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-24 py-24 md:py-32">
      <Container>
        <div className="max-w-[60ch]">
          <h2 id="services-title" className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-medium leading-[1] tracking-[-0.05em]">
            <span data-split="from-right-blur" data-split-stagger="0.03" className="block">
              {servicesPage.title}
            </span>
          </h2>
          <p data-split="from-down-blur" className="mt-6 text-lg text-fg-2 font-medium">
            {servicesPage.lede}
          </p>
        </div>
      </Container>

      <div data-view="rise" className="card-panel mt-14 py-8 sm:py-10">
        <Slideshow label="Services" slideClassName="w-[min(82vw,360px)]">
          {services.map((s) => {
            const Icon = serviceIcons[s.slug];
            return (
              <a key={s.slug} href={serviceHref(s)} draggable={false} className="group block h-full rounded-[25px]">
                <GlowCard className="h-full" icon={Icon ? <Icon aria-hidden weight="light" className="size-[22px]" /> : null}>
                  <span className="absolute right-[24px] top-[30px] rounded-full border border-line px-2.5 py-1 text-[12px] text-fg-2">
                    {groupTitle[s.group]}
                  </span>
                  <h3 className="relative mt-[22px] text-[19px] font-medium leading-[1.2] tracking-[-0.01em] text-fg">{s.name}</h3>
                  <p className="relative mt-3 flex-1 text-[14.3px] leading-[1.5] text-fg/80">{s.short}</p>
                  <span className="relative mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-signal">
                    Learn more
                    <ArrowUpRight aria-hidden weight="bold" className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </GlowCard>
              </a>
            );
          })}
        </Slideshow>
      </div>

      <Container>
        <p data-view="rise" className="mt-14 max-w-[70ch] border-l-2 border-signal/50 pl-5 text-[15px] leading-relaxed text-fg-3 font-medium">
          {servicesPage.availability}
        </p>
      </Container>
    </section>
  );
}
