"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export type Mode = "dark" | "light";
export const MODE_KEY = "phronem-mode";

/** The mode is the data-mode attribute on <html>; React follows it as an external store. */
const subscribe = (onChange: () => void) => {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
  return () => mo.disconnect();
};
const getMode = (): Mode => (document.documentElement.dataset.mode === "light" ? "light" : "dark");
const getServerMode = (): Mode => "dark";

/**
 * Light / dark switch, floating in the bottom-right corner of every page (mounted in the root
 * layout). The boot script in the root layout applies the visitor's saved choice before the first
 * paint, so there is no flash. Dark is the default. Shows the icon of the mode it switches to.
 *
 * Inside the operator desk the switch lives in the desk's top bar instead (`inline`), so the
 * floating one hides there.
 */
export function ModeToggle({ className, inline = false }: { className?: string; inline?: boolean }) {
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);
  const pathname = usePathname();
  if (!inline && pathname.startsWith("/operators") && pathname !== "/operators/sign-in") return null;

  const toggle = () => {
    const next: Mode = mode === "light" ? "dark" : "light";
    document.documentElement.dataset.mode = next;
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* storage unavailable: the choice lasts for this page view */
    }
  };

  const label = mode === "light" ? "Switch to dark mode" : "Switch to light mode";
  if (inline) {
    return (
      <button type="button" onClick={toggle} aria-label={label} title={label} className={cn("desk-icon-btn", className)}>
        {mode === "light" ? <Moon aria-hidden weight="bold" className="size-[18px]" /> : <Sun aria-hidden weight="bold" className="size-[18px]" />}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "glass fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] grid size-11 place-items-center rounded-full text-fg transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6",
        className,
      )}
      style={{ zIndex: "var(--z-header)" }}
    >
      {mode === "light" ? <Moon aria-hidden weight="bold" className="size-5" /> : <Sun aria-hidden weight="bold" className="size-5" />}
    </button>
  );
}
