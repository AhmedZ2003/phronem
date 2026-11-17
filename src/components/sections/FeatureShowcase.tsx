import { features } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { CurrentWidget, JudgmentWidget, MeasuredWidget, OpposingWidget } from "@/components/visuals/FeatureWidgets";
import { cn } from "@/lib/cn";

/**
 * The four-feature showcase: a one-to-one rebuild of the reference's section after
 * "Upgrade Your Reality" ("Hyper-Personalized Imagination Sessions", read with Claude in Chrome).
 *
 * What it's for: "what you get". The product's core features, each paired with a small looping
 * UI demo, and no section heading. For Phronem: the four things an engagement delivers.
 *
 * Layout (1148px list, 492px tall, 1px white/20 dividers), exactly as the reference:
 *   column 1   visual on top, text below, centred
 *   column 2   text on top, visual below, centred
 *   column 3   two rows split by a horizontal divider; each row visual left, text right
 * Each visual sits on a soft accent glow (blur 78px, 14%). Motion: headings and text rise line by
 * line (from-down-blur), visuals scale in from 0.6 (view-item), and every visual loops.
 * Below 1024px the four stack, each visual above its text, divided by horizontal lines.
 */
const widgets = { judgment: JudgmentWidget, opposing: OpposingWidget, measured: MeasuredWidget, current: CurrentWidget };

export function FeatureShowcase() {
  const [f1, f2, f3, f4] = features;
  return (
    <section aria-label="What an engagement delivers" className="relative py-20 md:py-24 lg:py-[81px]">
      <Container className="max-w-[1240px]">
        {/* 1024px and up: the reference grid */}
        <div className="mx-auto hidden h-[492px] max-w-[1148px] grid-cols-[1fr_1px_1fr_1px_1.5fr] lg:grid">
          <div className="flex flex-col items-center px-6 pt-16">
            <Visual id={f1.id} />
            <Text title={f1.title} text={f1.text} className="mt-auto pb-2 text-center" />
          </div>
          <Divider />
          <div className="flex flex-col items-center px-6 pt-[61px]">
            <Text title={f2.title} text={f2.text} className="text-center" />
            <div className="mt-auto pb-[60px]">
              <Visual id={f2.id} />
            </div>
          </div>
          <Divider />
          <div className="grid grid-rows-[271px_1px_1fr]">
            <div className="flex items-center gap-4 pl-3 pr-2">
              <Visual id={f3.id} />
              <Text title={f3.title} text={f3.text} className="max-w-[200px]" />
            </div>
            <div className="ml-8 bg-fg/15" aria-hidden />
            <div className="flex items-center gap-10 pl-14 pr-2">
              <Visual id={f4.id} />
              <Text title={f4.title} text={f4.text} className="max-w-[190px]" />
            </div>
          </div>
        </div>

        {/* Below 1024px: stacked */}
        <ul className="grid divide-y divide-white/20 sm:mx-auto sm:max-w-[520px] lg:hidden">
          {features.map((f) => (
            <li key={f.id} className="flex flex-col items-center gap-8 py-12 text-center first:pt-0 last:pb-0">
              <Visual id={f.id} />
              <Text title={f.title} text={f.text} className="text-center" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Divider() {
  return <div aria-hidden className="bg-fg/15" />;
}

function Visual({ id }: { id: keyof typeof widgets }) {
  const W = widgets[id];
  return (
    <div className="relative shrink-0" aria-hidden>
      <div className="absolute left-1/2 top-1/2 size-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal opacity-[0.14]" style={{ filter: "blur(78px)" }} />
      <div data-view="from-center" className="relative">
        <W />
      </div>
    </div>
  );
}

function Text({ title, text, className }: { title: string; text: string; className?: string }) {
  return (
    <div className={cn("max-w-[260px]", className)}>
      <h3 data-split="from-down-blur" className="text-[23.3px] font-medium leading-[1.2] tracking-[-0.02em] text-fg">
        {title}
      </h3>
      <p data-split="from-down-blur" data-split-delay="0.15" className="mx-auto mt-3 max-w-[200px] text-[14.3px] leading-[1.5] text-fg/80">
        {text}
      </p>
    </div>
  );
}
