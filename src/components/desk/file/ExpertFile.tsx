"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, CircleNotch, WarningCircle, X } from "@phosphor-icons/react";
import type { ActionResult } from "@/app/operators/actions";
import { SIGN_STAGES, complianceState, complianceTone, displayName, signOf, status, tier, total } from "@/lib/desk/rules";
import type { ExpertBundle, Operator, SignKey } from "@/lib/desk/types";
import { cn } from "@/lib/cn";
import { Chip, fmtDate } from "../ui";
import { FileContext, type FileCtx } from "./context";
import { ExpertisePane, ProfilePane } from "./ProfilePanes";
import { CompliancePane, ScorecardPane, ScreeningPane, VerificationPane } from "./AssessPanes";
import { MatchPane, PerformancePane, UpkeepPane } from "./WorkPanes";

export const SECTIONS = [
  { key: "profile", label: "Profile", Pane: ProfilePane },
  { key: "expertise", label: "Expertise", Pane: ExpertisePane },
  { key: "screening", label: "Screening", Pane: ScreeningPane },
  { key: "verification", label: "Verification", Pane: VerificationPane },
  { key: "compliance", label: "Compliance", Pane: CompliancePane },
  { key: "scorecard", label: "Scorecard", Pane: ScorecardPane },
  { key: "projects", label: "Project match", Pane: MatchPane },
  { key: "performance", label: "Performance", Pane: PerformancePane },
  { key: "upkeep", label: "Reviews and audit", Pane: UpkeepPane },
] as const;

type Save = { state: "idle" | "saving" | "saved" | "error"; message?: string };

/**
 * One expert's qualification file. The left spine carries the verdict: status, score, compliance,
 * what still blocks approval, the four sign-off stamps, and the section list. The right side shows
 * one section at a time. Every edit saves through a server action, which returns the updated file.
 */
export function ExpertFile({ initial, operator, initialSection }: { initial: ExpertBundle; operator: Operator; initialSection?: string }) {
  const [bundle, setBundle] = useState(initial);
  const [section, setSection] = useState(SECTIONS.some((s) => s.key === initialSection) ? initialSection! : "profile");
  const [save, setSave] = useState<Save>({ state: "idle" });
  const [inked, setInked] = useState<SignKey | null>(null);

  const run = useCallback(
    async (action: () => Promise<ActionResult>) => {
      setSave({ state: "saving" });
      try {
        const res = await action();
        if (!res.ok) {
          setSave({ state: "error", message: res.error });
          return false;
        }
        // A decision that was just made gets the stamp animation.
        const before = bundle.expert.signs;
        const changed = SIGN_STAGES.find(([k]) => res.bundle.expert.signs?.[k]?.d && res.bundle.expert.signs?.[k]?.at !== before?.[k]?.at);
        if (changed) setInked(changed[0]);
        setBundle(res.bundle);
        setSave({ state: "saved" });
        return true;
      } catch {
        setSave({ state: "error", message: "The desk couldn't be reached. Check your connection and make the change again." });
        return false;
      }
    },
    [bundle],
  );

  const ctx: FileCtx = useMemo(
    () => ({ bundle, operator, run, who: (u?: string) => (u ? (bundle.names[u] ?? u) : "Not recorded") }),
    [bundle, operator, run],
  );

  const e = bundle.expert;
  const st = status(e);
  const tt = total(e);
  const comp = complianceState(e);
  const Pane = SECTIONS.find((s) => s.key === section)!.Pane;

  const choose = (key: string) => {
    setSection(key);
    const url = new URL(window.location.href);
    url.searchParams.set("section", key);
    window.history.replaceState(null, "", url);
  };

  return (
    <FileContext.Provider value={ctx}>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        {/* Stays in view while the section scrolls, on screens tall enough to show it whole */}
        <aside className="flex min-w-0 flex-col gap-4 lg:self-start [@media(min-width:1024px)_and_(min-height:900px)]:sticky [@media(min-width:1024px)_and_(min-height:900px)]:top-24">
          <Link href="/operators" className="inline-flex w-fit items-center gap-2 text-[14px] font-semibold text-fg-2 hover:text-fg">
            <ArrowLeft aria-hidden weight="bold" className="size-4" />
            Expert register
          </Link>

          <div className="desk-panel desk-panel--edge flex flex-col gap-5 p-5">
            <div className="min-w-0">
              <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.035em] [overflow-wrap:anywhere]">{displayName(e)}</h1>
              <p className="mt-1 font-mono text-[12.5px] text-fg-3">
                {e.id}
                {e.sample && <span className="ml-2 font-sans">sample record</span>}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip tone={st.tone}>{st.label}</Chip>
              <Chip tone={complianceTone(comp)}>{`Compliance ${comp}`}</Chip>
            </div>

            <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
              <p className="leading-none">
                <span className="score-figure">{tt.t}</span>
                <span className="ml-1.5 text-[14px] text-fg-2">/ 100</span>
              </p>
              <p className="pb-1 text-right text-[13px] leading-snug text-fg-2">
                {tt.full ? (
                  <>
                    <span className="block font-semibold text-fg">{tier(tt.t)[0]}</span>
                    {tier(tt.t)[1]}
                  </>
                ) : (
                  `${tt.n} of 8 scored`
                )}
              </p>
            </div>

            {st.reasons.length > 0 && (
              <ul className="flex flex-col gap-1.5 border-t border-line pt-4 text-[13.5px]">
                {st.reasons.map((r) => (
                  <li key={r} className={cn("flex gap-2", st.tone === "bad" ? "tone-bad" : "tone-warn")}>
                    <WarningCircle aria-hidden weight="bold" className="mt-0.5 size-4 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            )}

            <div className="grid grid-cols-2 gap-2.5 border-t border-line pt-4">
              {SIGN_STAGES.map(([k, label]) => {
                const s = signOf(e, k);
                return (
                  <div
                    key={k}
                    className={cn("stamp", s?.d === "approve" && "stamp--approve", s?.d === "reject" && "stamp--reject", inked === k && "stamp--inked")}
                  >
                    <span className="stamp__stage">{label}</span>
                    <span className="stamp__word">{s?.d === "approve" ? "Approved" : s?.d === "reject" ? "Rejected" : "Open"}</span>
                    <span className="stamp__who">{s?.d ? `${ctx.who(s.by)}, ${fmtDate(s.at)}` : "Not signed"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <nav aria-label="File sections" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <ul className="flex gap-1.5 lg:flex-col lg:gap-0.5">
              {SECTIONS.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => choose(s.key)}
                    aria-current={section === s.key ? "true" : undefined}
                    className={cn(
                      "w-full whitespace-nowrap rounded-[12px] px-3.5 py-2 text-left text-[14.5px] font-semibold transition-colors",
                      section === s.key ? "bg-[rgb(var(--fg-rgb)/0.09)] text-fg" : "text-fg-2 hover:bg-[rgb(var(--fg-rgb)/0.04)] hover:text-fg",
                    )}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <p aria-live="polite" className="hidden min-h-5 items-center gap-2 px-1 text-[13px] text-fg-3 lg:flex">
            <SaveLine save={save} />
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {save.state === "error" && (
            <div role="alert" className="chip chip--bad flex w-full items-start justify-between gap-3 whitespace-normal px-4 py-3 text-[14px]">
              <span className="flex gap-2">
                <WarningCircle aria-hidden weight="bold" className="mt-0.5 size-4 shrink-0" />
                {save.message}
              </span>
              <button type="button" aria-label="Dismiss" onClick={() => setSave({ state: "idle" })} className="shrink-0 rounded-md p-0.5 hover:opacity-80">
                <X aria-hidden weight="bold" className="size-4" />
              </button>
            </div>
          )}
          <div key={section} className="pane-in flex flex-col gap-6">
            <Pane />
          </div>
        </div>
      </div>

      {/* Phones and tablets: the save state sits above the light / dark button */}
      <p
        aria-hidden
        className="glass fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] text-fg-2 lg:hidden"
        style={{ zIndex: "var(--z-header)", visibility: save.state === "idle" ? "hidden" : "visible" }}
      >
        <SaveLine save={save} />
      </p>
    </FileContext.Provider>
  );
}

function SaveLine({ save }: { save: Save }) {
  if (save.state === "saving")
    return (
      <>
        <CircleNotch aria-hidden weight="bold" className="size-4 animate-spin motion-reduce:animate-none" /> Saving
      </>
    );
  if (save.state === "saved")
    return (
      <>
        <CheckCircle aria-hidden weight="bold" className="size-4 tone-good" /> Saved
      </>
    );
  if (save.state === "error")
    return (
      <>
        <WarningCircle aria-hidden weight="bold" className="size-4 tone-bad" /> Not saved
      </>
    );
  return <>All changes saved</>;
}
