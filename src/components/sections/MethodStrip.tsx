import { methodFacts } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { DimensionsGraphic, ExpertiseGraphic, ServicesGraphic } from "@/components/visuals/StatGraphics";

const graphics = [ServicesGraphic, ExpertiseGraphic, DimensionsGraphic];

/**
 * The stats strip every expert network puts under its hero (IDR, Guidepoint, Third Bridge,
 * Silverlight). Phronem has no client or network metrics to show, so it states facts about the
 * method and the offer. No cards: an open band between two glowing hairlines, three columns split
 * by fading vertical rules. Each fact: a large number counting up in a white-to-lilac gradient,
 * its looping graphic beside it, and the label beneath. Columns rise in turn.
 */
export function MethodStrip() {
  return (
    <section aria-label="Phronem in numbers" className="relative py-9 md:py-10">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--accent-rgb)/0.5),transparent)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--accent-rgb)/0.5),transparent)]" />
      <Container>
        <ul data-view-list className="grid gap-7 md:grid-cols-3 md:gap-0">
          {methodFacts.map((f, i) => {
            const Graphic = graphics[i];
            return (
              <li
                key={f.label}
                data-view="rise"
                className="relative md:px-8 md:first:pl-0 md:last:pr-0 md:[&+&]:before:absolute md:[&+&]:before:inset-y-2 md:[&+&]:before:left-0 md:[&+&]:before:w-px md:[&+&]:before:bg-[linear-gradient(180deg,transparent,rgb(var(--fg-rgb)/0.16),transparent)] md:[&+&]:before:content-['']"
              >
                <span className="sr-only">
                  {f.value} {f.label}
                </span>
                <div aria-hidden className="flex items-center gap-3.5">
                  <CountUp
                    value={Number(f.value)}
                    className="inline-block bg-[linear-gradient(180deg,var(--color-fg)_30%,var(--color-signal-2))] bg-clip-text pb-1 font-mono text-[clamp(2.25rem,3.6vw,3rem)] leading-none tracking-[-0.05em] text-transparent drop-shadow-[0_6px_18px_rgb(var(--violet-rgb)/0.45)]"
                  />
                  <Graphic className="w-[40px] shrink-0" />
                </div>
                <p aria-hidden className="mt-2.5 max-w-[28ch] text-[14px] leading-snug text-fg-2">
                  {f.label}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
