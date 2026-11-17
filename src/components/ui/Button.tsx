import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
};

/**
 * Link-button. As in the reference (`data-hover-button`), the background is its own layer
 * that gets thrown by the mouse's velocity on hover and springs back (runtime/inertiaHover.ts),
 * while the label stays put. Solid = white fill with ink text; ghost = glass with an edge. Corners are the reference's 14px.
 */
export function Button({ href, children, variant = "solid", className }: Props) {
  return (
    <a
      href={href}
      className={cn(
        "group relative isolate inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] px-5 py-3 text-[15px] font-medium",
        "transition-transform duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98]",
        variant === "solid" ? "text-ink" : "text-fg",
        className,
      )}
    >
      <span
        aria-hidden
        data-inertia="10"
        className={cn(
          "absolute inset-0 -z-10 rounded-[var(--radius-control)] transition-colors duration-300",
          variant === "solid" && "bg-button group-hover:bg-fg/85",
          variant === "ghost" && "border border-line-strong bg-glass group-hover:border-fg-3",
        )}
      />
      {children}
      <ArrowUpRight
        aria-hidden
        weight="bold"
        className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  );
}
