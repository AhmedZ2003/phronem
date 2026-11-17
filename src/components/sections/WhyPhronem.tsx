import { IdentificationCard, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { whyPhronem } from "@/content/site";
import { Container } from "@/components/ui/Container";

const icons = [MagnifyingGlass, IdentificationCard, ShieldCheck];

/**
 * The "why us" pillars (IDR's "The IDR Difference", GLG's "Why leading companies choose GLG",
 * Guidepoint's "Why clients trust Guidepoint"). The heading on the page, then three tiles on the
 * full-width card band used by the other card sections; the tiles rise in turn.
 */
export function WhyPhronem() {
  return (
    <section aria-labelledby="why-title" className="py-24 md:py-32">
      <Container>
        <h2 id="why-title" data-split="from-down-blur" className="max-w-[16ch] text-[clamp(2.25rem,4.6vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.045em]">
          {whyPhronem.title}
        </h2>
      </Container>

      <div className="card-panel mt-12 py-8 sm:py-10">
        <Container>
          <ul data-view-list className="grid gap-4 md:grid-cols-3">
            {whyPhronem.items.map((item, i) => {
              const Icon = icons[i];
              return (
                <li key={item.name} data-view="rise" className="rounded-[var(--radius-panel)] border border-line bg-[var(--card-body)] p-6">
                  <Icon aria-hidden weight="light" className="size-7 text-signal" />
                  <h3 className="mt-8 text-lg font-medium text-fg">{item.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </div>
    </section>
  );
}
