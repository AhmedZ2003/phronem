import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { clientCards, clientsSection } from "@/content/site";
import { getService, serviceHref } from "@/content/services";
import { Container } from "@/components/ui/Container";

/**
 * "Clients we support" (IDR's "Clients we support", Third Bridge's "Our clients"): four cards, each
 * a photo, the kind of client, one line on what Phronem does for them, and the service that fits.
 * Motion: the heading slides in by character; cards scale in one after another (view-list). On hover
 * a card stays where it is: a light sheen sweeps across it diagonally, the photo eases in slightly
 * and the edge brightens.
 * Each card keeps its anchor id, so the Clients menu and footer links land on it.
 */
export function Audiences() {
  return (
    <section id="clients" aria-labelledby="clients-title" className="relative scroll-mt-24 py-24 md:py-32">
      <Container>
        <h2 id="clients-title" className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-medium leading-[1] tracking-[-0.05em]">
          <span data-split="from-right-blur" data-split-stagger="0.03" className="block">
            {clientsSection.title}
          </span>
        </h2>
      </Container>

      <div className="card-panel mt-12 py-8 sm:py-10">
        <Container>
          <ul data-view-list className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clientCards.map((c) => {
              const service = getService(c.service);
              return (
                <li key={c.id} id={c.id} className="scroll-mt-28">
                  <article
                    data-view="from-center"
                    className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-line bg-ink-2 transition-colors hover:border-line-strong"
                  >
                    {/* Diagonal sheen: sweeps from the top-left corner to the bottom-right on hover */}
                    <span aria-hidden className="card-sheen" />
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={c.image.src}
                        alt={c.image.alt}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                      />
                      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,var(--color-ink-2))]" />
                    </div>
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
                      <h3 className="text-lg font-medium tracking-[-0.02em] text-fg">{c.label}</h3>
                      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-fg-2">{c.text}</p>
                      {service && (
                        <a href={serviceHref(service)} className="mt-5 text-sm font-medium text-signal">
                          {service.name.split(" ").slice(0, -1).join(" ")}{" "}
                          {/* The last word and the arrow never separate, so the arrow can't strand on its own line */}
                          <span className="whitespace-nowrap">
                            {service.name.split(" ").slice(-1)}
                            <ArrowUpRight aria-hidden weight="bold" className="ml-1.5 inline size-3.5 align-[-2px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </span>
                        </a>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </Container>
      </div>
    </section>
  );
}
