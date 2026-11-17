import { footer, site } from "@/content/site";
import { serviceHref, services } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/Logo";
import { RollText } from "@/components/motion/RollText";

/**
 * The footer every expert network uses: Services · Clients · Experts · Company, then the
 * fine print. Two tiers, as in the reference, with the giant wordmark between them.
 * Links roll their labels on hover; the wordmark slides in by character.
 */
export function SiteFooter() {
  const columns = [
    { title: "Services", links: services.map((s) => ({ label: s.name, href: serviceHref(s) })) },
    { title: "Clients", links: footer.clients },
    { title: "Experts", links: footer.experts },
    { title: "Company", links: [...footer.company, { label: site.email, href: `mailto:${site.email}` }] },
  ];

  return (
    <footer className="relative isolate overflow-hidden border-t border-line pt-16">
      {/* The reference footer's violet-and-indigo light, rising behind the wordmark */}
      <div aria-hidden className="footer-glow" />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_2.6fr]">
          <div className="flex items-start gap-4">
            <LogoMark className="size-10 shrink-0" />
            <p data-split="from-down-blur" className="max-w-[30ch] text-lg text-fg-2 font-medium">
              {site.footerLine}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <nav key={col.title} aria-label={`Footer: ${col.title}`}>
                <p className="text-sm text-fg-3">{col.title}</p>
                <ul className="mt-4 grid gap-2.5 text-[15px]">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} data-roll className="text-fg-2 transition-colors hover:text-fg">
                        <RollText>{l.label}</RollText>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </Container>

      <p
        aria-hidden
        className="wordmark-depth mt-16 select-none whitespace-nowrap text-center text-[23vw] font-medium leading-[0.8] tracking-[-0.075em] text-fg"
      >
        <span data-split="from-right-blur" data-split-start="top 95%" className="block">
          {site.wordmark}
        </span>
      </p>

      <Container className="relative mt-[7vw] flex flex-wrap items-center justify-between gap-3 pb-20 sm:pb-24 text-sm text-fg-2">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <p>{site.tagline}</p>
      </Container>
    </footer>
  );
}
