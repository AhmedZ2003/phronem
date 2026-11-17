import { CurrencyCircleDollar, LockKey, ProhibitInset, Scales } from "@phosphor-icons/react/dist/ssr";
import { audiences, ctas, expertsBand } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PanelConstellation } from "@/components/visuals/PanelConstellation";

const pointIcons = [Scales, LockKey, ProhibitInset, CurrencyCircleDollar];

/**
 * "Become an expert" (IDR's homepage band, GLG's For Experts, Guidepoint's expert page teaser),
 * styled as a warm glowing panel with a gradient edge and its own fine specks.
 *   left    two-tone headline, the pitch, the four promises as icon tiles, the two ways in
 *   right   the panel as a live constellation (role chips in orbit, light flowing into the core)
 * Motion: headline by character, text by line, tiles one after another, constellation
 * scales in from the centre and keeps looping.
 */
export function ExpertsBand() {
  const points = audiences.experts.points;
  const [line1, line2] = expertsBand.titleLines;

  return (
    <section id="experts" aria-labelledby="experts-title" className="scroll-mt-24 py-24 md:py-32">
      <Container>
        {/* Glowing gradient edge */}
        <div className="rounded-[30px] p-px" style={{ background: "linear-gradient(135deg, rgb(var(--accent-rgb) / 0.7), rgb(var(--violet-rgb) / 0.25) 35%, rgb(var(--fg-rgb) / 0.06) 60%, rgb(var(--nebula-pink-rgb) / 0.45))" }}>
          <div
            className="xp-stars relative overflow-hidden rounded-[29px] p-6 sm:p-10 lg:p-14"
            style={{
              background:
                "radial-gradient(55% 60% at 85% 20%, rgb(var(--violet-rgb) / 0.4), transparent 70%), radial-gradient(45% 50% at 0% 100%, rgb(var(--nebula-pink-rgb) / 0.14), transparent 70%), radial-gradient(40% 40% at 50% 50%, rgb(var(--deep-rgb) / 0.5), transparent 80%), var(--color-ink-2)",
            }}
          >
            <div className="relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
              <div>
                <h2 id="experts-title" aria-label={expertsBand.title} className="text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
                  <span aria-hidden data-split="from-right-blur" data-split-stagger="0.025" className="block">
                    {line1}
                  </span>
                  <span aria-hidden data-split="from-right-blur" data-split-stagger="0.025" className="block pb-1 font-medium italic text-fg-3">
                    {line2}
                  </span>
                </h2>
                <p data-split="from-down-blur" className="mt-6 max-w-[46ch] text-lg text-fg-2 font-medium">
                  {expertsBand.body}
                </p>

                <ul data-view-list className="mt-10 grid gap-3 sm:grid-cols-2">
                  {points.map((p, i) => {
                    const Icon = pointIcons[i];
                    return (
                      <li key={p.name} data-view="rise" className="flex gap-3.5 rounded-[18px] border border-line bg-ink/45 p-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full p-px" style={{ background: "linear-gradient(140deg, var(--color-signal), transparent 75%)" }}>
                          <span className="grid size-full place-items-center rounded-full bg-ink-3 text-signal">
                            <Icon aria-hidden weight="light" className="size-[18px]" />
                          </span>
                        </span>
                        <span>
                          <span className="block text-[15px] font-medium text-fg">{p.name}</span>
                          <span className="mt-0.5 block text-[13.5px] leading-snug text-fg-2">{p.text}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Button href={ctas.joinPanel.href}>{ctas.joinPanel.label}</Button>
                  <Button href={expertsBand.more.href} variant="ghost">
                    {expertsBand.more.label}
                  </Button>
                </div>
              </div>

              <div data-view="from-center">
                <PanelConstellation />
              </div>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
