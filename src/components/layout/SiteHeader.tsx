"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { audiences, ctas, nav, site } from "@/content/site";
import { serviceGroups, serviceHref, services } from "@/content/services";
import { LogoMark } from "@/components/ui/Logo";
import { RollText } from "@/components/motion/RollText";
import { cn } from "@/lib/cn";
import { cos, sin } from "@/lib/trig";

type Menu = "services" | "clients" | null;

/** "For boards and strategy teams" → "Boards and strategy teams" */
const clientLinks = [audiences.organizations, audiences.investors, audiences.agencies, audiences.legal].map((a) => {
  const type = a.label.replace(/^For /, "");
  return { href: `/#${a.id}`, label: type.charAt(0).toUpperCase() + type.slice(1) };
});

/**
 * Centered glass pill (reference layout) carrying the navigation every expert-network site uses:
 * Services ▾ · Clients ▾ · Experts · Compliance, then a solid Contact Us button to /contact.
 * Dropdowns open on hover, focus or click; Escape closes. Phones get a full-screen menu.
 * Motion: the panel-dot ring turns with scroll, link labels roll on hover.
 */
export function SiteHeader() {
  const [menu, setMenu] = useState<Menu>(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setMobile(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  return (
    <header
      ref={ref}
      className="pointer-events-none fixed inset-x-0 top-4 flex flex-col items-center px-4"
      style={{ zIndex: "var(--z-header)" }}
      onMouseLeave={() => setMenu(null)}
    >
      <nav aria-label="Main" className="glass pointer-events-auto flex h-12 items-center gap-1 rounded-[var(--radius-control)] pl-1.5 pr-1.5">
        <a href="/" className="relative mr-1 grid size-10 place-items-center rounded-full" aria-label={`${site.name}, home`}>
          <svg data-nav-ring viewBox="-20 -20 40 40" className="absolute inset-0 size-10" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2;
              return <circle key={i} cx={cos(a) * 18} cy={sin(a) * 18} r={i === 0 ? 1.6 : 1.1} fill="var(--color-signal)" opacity={i === 0 ? 1 : 0.6} />;
            })}
          </svg>
          <LogoMark className="size-7" />
        </a>

        <ul className="hidden items-center md:flex">
          {nav.map((item) =>
            "menu" in item ? (
              <li key={item.href} onMouseEnter={() => setMenu(item.menu)}>
                <button
                  type="button"
                  aria-expanded={menu === item.menu}
                  aria-controls={`menu-${item.menu}`}
                  onClick={() => setMenu(menu === item.menu ? null : item.menu)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold text-fg transition-colors hover:bg-glass",
                    menu === item.menu && "bg-glass",
                  )}
                >
                  {item.label}
                  <CaretDown aria-hidden weight="bold" className={cn("size-3 transition-transform", menu === item.menu && "rotate-180")} />
                </button>
              </li>
            ) : (
              <li key={item.href} onMouseEnter={() => setMenu(null)}>
                <a href={item.href} data-roll className="block rounded-full px-3.5 py-1.5 text-sm font-semibold text-fg transition-colors hover:bg-glass">
                  <RollText>{item.label}</RollText>
                </a>
              </li>
            ),
          )}
        </ul>

        {/* The one button in the bar: solid white, unlike the text links */}
        <a
          href={ctas.contact.href}
          onMouseEnter={() => setMenu(null)}
          className="ml-1 rounded-[10px] bg-button px-4 py-2 text-sm font-semibold text-ink shadow-[0_6px_20px_-8px_rgb(var(--violet-rgb)/0.9)] transition-colors hover:bg-fg/85"
        >
          {ctas.contact.label}
        </a>

        <button
          type="button"
          onClick={() => setMobile(true)}
          className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold text-fg md:hidden"
          aria-expanded={mobile}
          aria-controls="mobile-menu"
        >
          <List aria-hidden className="size-4" />
          Menu
        </button>
      </nav>

      {/* Desktop dropdowns */}
      <div className={cn("pointer-events-auto mt-2 hidden w-full max-w-[560px] md:block", !menu && "pointer-events-none")}>
        <div
          id="menu-services"
          hidden={menu !== "services"}
          className="glass rounded-[var(--radius-panel)] !bg-ink-2/95 p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            {serviceGroups.map((g) => (
              <div key={g.id} className="rounded-[calc(var(--radius-panel)-8px)] p-3">
                <p className="text-sm font-medium text-signal">{g.title}</p>
                <ul className="mt-2 grid gap-0.5">
                  {services
                    .filter((s) => s.group === g.id)
                    .map((s) => (
                      <li key={s.slug}>
                        <a href={serviceHref(s)} className="block rounded-[var(--radius-chip)] px-3 py-2 text-[15px] text-fg transition-colors hover:bg-glass">
                          {s.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div id="menu-clients" hidden={menu !== "clients"} className="glass rounded-[var(--radius-panel)] !bg-ink-2/95 p-3">
          <ul className="grid grid-cols-2 gap-1">
            {clientLinks.map((c) => (
              <li key={c.href}>
                <a href={c.href} onClick={() => setMenu(null)} className="block rounded-[var(--radius-chip)] px-4 py-3 text-[15px] text-fg transition-colors hover:bg-glass">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Phone menu */}
      {mobile && (
        <div id="mobile-menu" className="pointer-events-auto fixed inset-0 overflow-y-auto bg-ink/95 px-4 pb-10 pt-6 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between">
            <LogoMark className="size-9" />
            <button type="button" onClick={() => setMobile(false)} className="grid size-11 place-items-center rounded-full border border-line" aria-label="Close menu">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="mt-8 grid gap-8" onClick={(e) => (e.target as Element).closest("a") && setMobile(false)}>
            {serviceGroups.map((g) => (
              <div key={g.id}>
                <p className="text-sm font-medium text-signal">{g.title}</p>
                <ul className="mt-2 grid gap-1">
                  {services
                    .filter((s) => s.group === g.id)
                    .map((s) => (
                      <li key={s.slug}>
                        <a href={serviceHref(s)} className="block py-1.5 text-lg text-fg">
                          {s.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-sm font-medium text-signal">Clients</p>
              <ul className="mt-2 grid gap-1">
                {clientLinks.map((c) => (
                  <li key={c.href}>
                    <a href={c.href} className="block py-1.5 text-lg text-fg">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="grid gap-1 border-t border-line pt-6">
              <li>
                <a href="/experts" className="block py-1.5 text-lg text-fg">
                  Experts
                </a>
              </li>
              <li>
                <a href="/compliance" className="block py-1.5 text-lg text-fg">
                  Compliance
                </a>
              </li>
            </ul>
            <a href={ctas.contact.href} className="rounded-[var(--radius-control)] bg-button px-5 py-3 text-center font-semibold text-ink">
              {ctas.contact.label}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
