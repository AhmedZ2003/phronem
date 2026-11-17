"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowSquareOut, List, Plus, SignOut, SquaresFour, UsersThree, X } from "@phosphor-icons/react";
import { createExpert, signOut } from "@/app/operators/actions";
import { site } from "@/content/site";
import { LogoMark } from "@/components/ui/Logo";
import { ModeToggle } from "@/components/layout/ModeToggle";
import type { Operator } from "@/lib/desk/types";
import { cn } from "@/lib/cn";

/* The sidebar can be folded to an icon rail on desktop; the choice is kept per browser. */
const RAIL_KEY = "phronem-desk-rail";
const railListeners = new Set<() => void>();
const readRail = () => {
  try {
    return localStorage.getItem(RAIL_KEY) === "1";
  } catch {
    return false;
  }
};
const setRail = (on: boolean) => {
  try {
    localStorage.setItem(RAIL_KEY, on ? "1" : "0");
  } catch {
    /* storage unavailable: lasts for this page view */
  }
  railListeners.forEach((l) => l());
};
const subscribeRail = (l: () => void) => {
  railListeners.add(l);
  return () => railListeners.delete(l);
};

const NAV = [
  { href: "/operators/dashboard", label: "Dashboard", Icon: SquaresFour, match: (p: string) => p.startsWith("/operators/dashboard") },
  { href: "/operators", label: "Expert register", Icon: UsersThree, match: (p: string) => p === "/operators" || p.startsWith("/operators/experts") },
];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export function Monogram({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-[12px] text-[13px] font-bold tracking-[-0.02em] text-white", className)}
      style={{ background: "linear-gradient(140deg, var(--color-marine-2), var(--color-marine))" }}
    >
      {initials(name)}
    </span>
  );
}

/**
 * The operator desk's frame, after the reference dashboard: a left sidebar (brand, the two desk
 * views, a New expert button, the public site and sign out at the foot) and a slim top bar with
 * the menu button, the light / dark switch and who is signed in. On phones the sidebar is a drawer.
 */
export function DeskShell({ operator, children }: { operator: Operator; children: React.ReactNode }) {
  const path = usePathname();
  const rail = useSyncExternalStore(subscribeRail, readRail, () => false);
  const [drawer, setDrawer] = useState(false);
  const [lastPath, setLastPath] = useState(path);

  // Close the drawer after moving to another page
  if (path !== lastPath) {
    setLastPath(path);
    setDrawer(false);
  }

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const compact = rail && !drawer;

  const renderSidebar = (where: "side" | "drawer") => (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 shrink-0 items-center gap-2.5", compact ? "justify-center px-0" : "px-5")}>
        <Link href="/operators/dashboard" className="flex min-w-0 items-center gap-2.5 rounded-[var(--radius-control)]" aria-label="Phronem qualification desk">
          <LogoMark className="size-9 shrink-0" gradientId={`logo-desk-${where}`} />
          {!compact && (
            <span className="min-w-0 leading-tight">
              <span className="block text-[16px] font-semibold tracking-[-0.02em]">{site.wordmark}</span>
              <span className="block text-[12.5px] text-fg-3">Qualification desk</span>
            </span>
          )}
        </Link>
        {drawer && (
          <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="desk-icon-btn ml-auto lg:hidden">
            <X aria-hidden weight="bold" className="size-[18px]" />
          </button>
        )}
      </div>

      <nav aria-label="Desk" className={cn("mt-6 flex flex-col gap-1", compact ? "px-3" : "px-4")}>
        {NAV.map(({ href, label, Icon, match }) => {
          const active = match(path);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={compact ? label : undefined}
              className={cn("desk-nav-item", active && "desk-nav-item--active", compact && "justify-center px-0")}
            >
              <Icon aria-hidden weight={active ? "fill" : "regular"} className="size-[20px] shrink-0" />
              {!compact && <span>{label}</span>}
              {compact && <span className="sr-only">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <form action={createExpert} className={cn("mt-5", compact ? "px-3" : "px-4")}>
        <button type="submit" className={cn("desk-btn desk-btn--primary w-full", compact && "px-0")} title={compact ? "New expert" : undefined}>
          <Plus aria-hidden weight="bold" className="size-[17px]" />
          {compact ? <span className="sr-only">New expert</span> : "New expert"}
        </button>
      </form>

      <div className={cn("mt-auto flex flex-col gap-1 border-t border-line py-4", compact ? "px-3" : "px-4")}>
        <a href="/" className={cn("desk-nav-item", compact && "justify-center px-0")} title={compact ? "Public site" : undefined}>
          <ArrowSquareOut aria-hidden className="size-[20px] shrink-0" />
          {compact ? <span className="sr-only">Public site</span> : <span>Public site</span>}
        </a>
        <form action={signOut}>
          <button type="submit" className={cn("desk-nav-item w-full", compact && "justify-center px-0")} title={compact ? "Sign out" : undefined}>
            <SignOut aria-hidden className="size-[20px] shrink-0" />
            {compact ? <span className="sr-only">Sign out</span> : <span>Sign out</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="lg:flex">
      {/* Desktop sidebar */}
      <aside className={cn("desk-sidebar sticky top-0 hidden h-[100dvh] shrink-0 border-r border-line lg:block", rail ? "w-[84px]" : "w-[256px]")}>
        {renderSidebar("side")}
      </aside>

      {/* Phone and tablet drawer */}
      {drawer && (
        <div className="fixed inset-0 lg:hidden" style={{ zIndex: "var(--z-skip)" }}>
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-[rgb(0_0_0/0.5)]" onClick={() => setDrawer(false)} />
          <aside className="desk-sidebar desk-drawer relative h-full w-[280px] max-w-[85vw] border-r border-line">{renderSidebar("drawer")}</aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="desk-bar sticky top-0 border-b border-line" style={{ zIndex: "var(--z-header)" }}>
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="desk-icon-btn"
              aria-label={drawer ? "Close menu" : "Open menu"}
              aria-expanded={drawer}
              onClick={() => {
                if (window.matchMedia("(min-width: 1024px)").matches) setRail(!rail);
                else setDrawer(true);
              }}
            >
              <List aria-hidden weight="bold" className="size-[18px]" />
            </button>
            <Link href="/operators/dashboard" className="flex items-center gap-2 lg:hidden">
              <LogoMark className="size-8" gradientId="logo-desk-bar" />
              <span className="text-[15px] font-semibold tracking-[-0.02em]">{site.wordmark}</span>
            </Link>

            <div className="ml-auto flex items-center gap-3">
              <ModeToggle inline />
              <span aria-hidden className="hidden h-7 w-px bg-line sm:block" />
              <div className="flex items-center gap-3">
                <span className="hidden text-right leading-tight sm:block">
                  <span className="block text-[14px] font-semibold">{operator.name}</span>
                  <span className="block font-mono text-[11.5px] text-fg-3">{operator.username}</span>
                </span>
                <Monogram name={operator.name} className="size-10" />
              </div>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
