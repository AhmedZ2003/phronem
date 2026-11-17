import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { Emblem } from "@/components/visuals/Emblem";

type Props = {
  back?: { href: string; label: string };
  title: string;
  lede: string;
  children?: React.ReactNode;
};

/**
 * Hero for inner pages (services, experts, compliance): marine glow, a faint turning emblem,
 * headline split by character, lede rising by line, then the page's calls to action.
 */
export function PageHero({ back, title, lede, children }: Props) {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 70% at 80% 0%, rgb(var(--violet-rgb) / 0.5), transparent 70%), radial-gradient(40% 50% at 10% 100%, rgb(var(--deep-rgb) / 0.35), transparent 70%)" }}
      />
      <div aria-hidden className="spin-slow pointer-events-none absolute -right-40 -top-24 -z-10 hidden w-[620px] text-fg/[0.12] lg:block" style={{ animationDuration: "60s" }}>
        <Emblem className="w-full" />
      </div>
      <Container>
        {back && (
          <a href={back.href} className="inline-flex items-center gap-2 text-sm text-fg-2 transition-colors hover:text-fg">
            <ArrowLeft aria-hidden className="size-4" />
            {back.label}
          </a>
        )}
        <h1 className="mt-6 max-w-[18ch] text-[clamp(2.75rem,6.5vw,5.75rem)] font-medium leading-[1] tracking-[-0.055em]">
          <span data-split="from-right-blur" data-split-stagger="0.025" className="block">
            {title}
          </span>
        </h1>
        <p data-split="from-down-blur" className="mt-7 max-w-[60ch] text-lg leading-relaxed text-fg-2 md:text-xl font-medium">
          {lede}
        </p>
        {children && <div className="mt-10 flex flex-wrap gap-3">{children}</div>}
      </Container>
    </section>
  );
}
