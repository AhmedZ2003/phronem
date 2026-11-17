import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle, Quotes } from "@phosphor-icons/react/dist/ssr";
import { audiences, ctas } from "@/content/site";
import { getService, serviceGroups, serviceHref, serviceImages, services, servicesPage } from "@/content/services";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlowCard } from "@/components/ui/GlowCard";
import { PageHero } from "@/components/ui/PageHero";
import { Slideshow } from "@/components/ui/Slideshow";
import { Framework } from "@/components/sections/Framework";
import { RecordCard } from "@/components/visuals/RecordCard";
import { serviceIcons } from "@/components/visuals/serviceIcons";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return { title: `${service.name} | Phronem`, description: service.short };
}

/** The call to action that fits a service, where there is one: briefs for agencies, matters for counsel. */
function ctaFor(slug: string) {
  if (slug === "healthcare-professional-recruitment") return ctas.agencyBrief;
  if (slug === "expert-witness") return audiences.legal.cta;
  return null;
}

/** A chip in the top-right corner of a GlowCard, as on the homepage services slideshow. */
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="absolute right-[24px] top-[30px] rounded-full border border-line px-2.5 py-1 text-[12px] text-fg-2">{children}</span>;
}

/**
 * One page per service, with what expert-network service pages carry (IDR, GLG, Third Bridge):
 * what it is, what's included, how it works, what you receive, typical uses and an example.
 * Cards use the homepage services design (GlowCard) and have no hover motion; the steps run as
 * the same slideshow. Each page has a placeholder photo (serviceImages), also used on the
 * "More in …" cards. The example is illustrative and labelled fictional. The record's page also
 * shows the sample record and the five-dimension framework.
 */
export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const group = serviceGroups.find((g) => g.id === service.group);
  const cta = ctaFor(service.slug);
  const Icon = serviceIcons[service.slug];
  const image = serviceImages[service.slug];
  const related = services.filter((s) => s.group === service.group && s.slug !== service.slug);
  const isRecord = service.slug === "decision-confidence-records";

  return (
    <>
      <PageHero back={{ href: "/#services", label: "All services" }} title={service.name} lede={service.lede}>
        {cta && <Button href={cta.href}>{cta.label}</Button>}
      </PageHero>

      {/* Banner photo (placeholder) */}
      {image && (
        <section aria-label={`${service.name}, photo`} className="pb-20 md:pb-28">
          <Container>
            <div data-view="from-center" className="rounded-[25px] p-[1.3px]" style={{ background: "linear-gradient(126deg, var(--card-edge), var(--card-edge-end) 50%)" }}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-ink-3 sm:aspect-[16/7]">
                <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1360px) 1280px, 94vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(var(--shadow-rgb)/0.55))]" />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Included + receive */}
      <section aria-label="What the service includes" className="pb-20 md:pb-28">
        <Container className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div>
            <h2 data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              What&apos;s included
            </h2>
            <ul data-view-list className="mt-8 grid gap-3">
              {service.included.map((item) => (
                <li key={item} data-view="rise" className="flex gap-4 rounded-[var(--radius-chip)] border border-line bg-ink-3 px-5 py-4">
                  <CheckCircle aria-hidden weight="fill" className="mt-0.5 size-5 shrink-0 text-signal" />
                  <span className="text-[15px] leading-relaxed text-fg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div data-view="from-center" className="h-fit lg:sticky lg:top-28">
            <GlowCard icon={Icon ? <Icon aria-hidden weight="light" className="size-[22px]" /> : null}>
              <h2 className="relative mt-[22px] text-[19px] font-medium leading-[1.2] tracking-[-0.01em] text-fg">What you receive</h2>
              <ul className="relative mt-4 grid gap-3">
                {service.receive.map((r) => (
                  <li key={r} className="border-l-2 border-signal/50 pl-4 text-[14.3px] leading-[1.5] text-fg/80">
                    {r}
                  </li>
                ))}
              </ul>
            </GlowCard>
          </div>
        </Container>
      </section>

      {/* How it works: the homepage services slideshow */}
      <section aria-labelledby="steps-title" className="border-y border-line py-20 md:py-28">
        <Container>
          <h2 id="steps-title" data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
            How it works
          </h2>
        </Container>
        <div data-view="rise" className="card-panel mt-10 py-8 sm:py-10">
          <Slideshow label="How it works" slideClassName="w-[min(82vw,340px)]">
            {service.steps.map((step, i) => (
              <GlowCard key={step.name} className="h-full" icon={<span className="font-mono text-sm">{String(i + 1).padStart(2, "0")}</span>}>
                <Chip>Step {i + 1}</Chip>
                <h3 className="relative mt-[22px] text-[19px] font-medium leading-[1.2] tracking-[-0.01em] text-fg">{step.name}</h3>
                <p className="relative mt-3 flex-1 text-[14.3px] leading-[1.5] text-fg/80">{step.text}</p>
              </GlowCard>
            ))}
          </Slideshow>
        </div>
      </section>

      {isRecord && (
        <section id="record" aria-label="Illustrative record" className="scroll-mt-24 py-20 md:py-28">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
                What a record looks like
              </h2>
              <p data-split="from-down-blur" className="mt-5 max-w-[48ch] text-lg text-fg-2 font-medium">
                {audiences.organizations.body}
              </p>
            </div>
            <div data-view="from-center" className="mx-auto w-full max-w-[420px]">
              <RecordCard />
            </div>
          </Container>
        </section>
      )}
      {isRecord && <Framework />}

      {/* Uses + example */}
      <section aria-label="Typical uses and an example" className="py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              Typical uses
            </h2>
            <ul data-view-list className="mt-8 flex flex-wrap gap-2.5">
              {service.useCases.map((u) => (
                <li key={u} data-view="from-center" className="rounded-full border border-line-strong px-4 py-2 text-[15px] text-fg">
                  {u}
                </li>
              ))}
            </ul>
            {service.draws.length > 0 && (
              <>
                <p className="mt-10 text-[13px] text-fg-3">Draws mainly on</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {service.draws.map((d) => (
                    <li key={d} className="rounded-full bg-marine/60 px-3.5 py-1.5 text-[13px] text-fg">
                      {d}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <figure data-view="rise">
            <GlowCard icon={<Quotes aria-hidden weight="fill" className="size-[20px]" />}>
              <Chip>Illustrative example</Chip>
              <blockquote className="relative mt-[22px] text-xl leading-relaxed tracking-[-0.01em] text-fg">{service.example}</blockquote>
              <figcaption className="relative mt-6 text-xs text-fg-3">Fictional, not client work.</figcaption>
            </GlowCard>
          </figure>
        </Container>
        {service.note && (
          <Container className="mt-12">
            <p className="max-w-[70ch] border-l-2 border-signal/50 pl-5 text-[15px] leading-relaxed text-fg-2 font-medium">
              {service.note.text}{" "}
              {service.note.href && service.note.label && (
                <a href={service.note.href} className="text-signal underline-offset-4 hover:underline">
                  {service.note.label}
                </a>
              )}
            </p>
          </Container>
        )}
      </section>

      {/* Related: photo cards in the services card design, no hover motion */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="pb-20 md:pb-28">
          <Container>
            <h2 id="related-title" data-split="from-down-blur" className="text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              More in {group?.title}
            </h2>
          </Container>

          <div className="card-panel mt-10 py-8 sm:py-10">
            <Container>
              <ul data-view-list className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((s) => {
                  const RelIcon = serviceIcons[s.slug];
                  const img = serviceImages[s.slug];
                  return (
                    <li key={s.slug} data-view="from-center">
                      <a href={serviceHref(s)} className="block h-full rounded-[25px]">
                        <GlowCard
                          className="h-full"
                          icon={RelIcon ? <RelIcon aria-hidden weight="light" className="size-[22px]" /> : null}
                          media={img ? <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 420px, (min-width: 640px) 46vw, 94vw" className="object-cover" /> : undefined}
                        >
                          <h3 className="relative mt-[22px] text-[19px] font-medium leading-[1.2] tracking-[-0.01em] text-fg">{s.name}</h3>
                          <p className="relative mt-3 flex-1 text-[14.3px] leading-[1.5] text-fg/80">{s.short}</p>
                          <span className="relative mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-signal">
                            Learn more
                            <ArrowUpRight aria-hidden weight="bold" className="size-3.5" />
                          </span>
                        </GlowCard>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Container>
          </div>
        </section>
      )}

      {/* Closing */}
      <section aria-labelledby="service-cta" className="pb-24 md:pb-32">
        <Container>
          <div
            data-view="from-center"
            className="rounded-[var(--radius-panel)] border border-line px-6 py-14 text-center sm:px-10 md:py-20"
            style={{ background: "radial-gradient(60% 80% at 50% 100%, rgb(var(--violet-rgb) / 0.5), transparent 70%), var(--color-ink-2)" }}
          >
            <h2 id="service-cta" className="text-[clamp(2.25rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.05em]">
              <span data-split="from-right-blur" data-split-stagger="0.03" className="block">
                {service.cta?.title ?? servicesPage.ctaTitle}
              </span>
            </h2>
            <p data-split="from-down-blur" className="mx-auto mt-6 max-w-[48ch] text-lg text-fg-2 font-medium">
              {service.cta?.text ?? servicesPage.ctaText}
            </p>
            {cta && (
              <div className="mt-9 flex justify-center">
                <Button href={cta.href}>{cta.label}</Button>
              </div>
            )}
            <p className="mx-auto mt-10 max-w-[64ch] text-[13px] text-fg-3">{servicesPage.availability}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
