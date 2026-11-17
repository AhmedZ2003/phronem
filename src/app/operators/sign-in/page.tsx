import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { site } from "@/content/site";
import { LogoMark } from "@/components/ui/Logo";
import { SignInForm } from "@/components/desk/SignInForm";
import { getOperator } from "@/lib/desk/session";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string }> };

/**
 * Operator sign-in. The site's own signature carried over: the bevelled "phronem" wordmark and the
 * footer's nebula arc rising behind it, with the form on a glass panel to the right.
 */
export default async function SignInPage({ searchParams }: Props) {
  if (await getOperator()) redirect("/operators/dashboard");
  const { next } = await searchParams;

  return (
    <main id="main" className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden">
      <div aria-hidden className="hero-top-blur -z-10 opacity-70" />
      <div aria-hidden className="signin-arc -z-10" />

      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 pt-6 sm:px-8">
        <a href="/" className="flex items-center gap-2.5 rounded-[var(--radius-control)] text-[15px] font-semibold tracking-[-0.02em]">
          <LogoMark className="size-8" />
          {site.wordmark}
        </a>
        <a href="/" className="desk-link text-[14px]">
          Back to the site
        </a>
      </header>

      <div className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-12 px-5 pb-24 pt-12 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-20 lg:pb-32">
        <div className="min-w-0">
          <p className="wordmark-depth select-none text-[clamp(4rem,13vw,10rem)] font-medium leading-[0.95] tracking-[-0.065em] text-fg">
            {site.wordmark}
          </p>
          <h1 className="mt-6 max-w-[26ch] text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.25] tracking-[-0.03em] text-fg">
            The expert qualification desk.
          </h1>
          <p className="mt-3 max-w-[48ch] text-[15.5px] leading-relaxed text-fg-2">
            Register, verify, clear and score experts. Every decision is signed with your name.
          </p>
        </div>

        <div className="desk-panel desk-panel--edge w-full backdrop-blur-xl max-w-[440px] justify-self-center p-7 sm:p-9 lg:justify-self-end">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Operator sign in</h2>
          <p className="mt-1.5 text-[14px] text-fg-2">Use the account issued to you. Accounts are personal; don&apos;t share them.</p>
          <SignInForm next={next ?? ""} />
        </div>
      </div>
    </main>
  );
}
