import { cn } from "@/lib/cn";

/** Page width container: 16px gutter on phones, 1360px max. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}
