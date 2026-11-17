"use client";

import { CheckCircle, Prohibit, ArrowCounterClockwise } from "@phosphor-icons/react";
import { addRow, decide, removeRow, setExpertField } from "@/app/operators/actions";
import {
  CHECK_OPTIONS,
  QUESTIONS,
  SCORECARD,
  SIGN_STAGES,
  VERIFICATION_STATUSES,
  cannotApprove,
  complianceState,
  complianceTone,
  requirementsFor,
  screened,
  signOf,
  tier,
  total,
} from "@/lib/desk/rules";
import { Chip, RuleNote, Section, fmtDate } from "../ui";
import { useFile } from "./context";
import { Card, ScoreRow, SelectField, TextField, grid } from "./fields";

function useSet() {
  const { bundle, run } = useFile();
  const id = bundle.expert.id;
  return (path: string[], value: unknown) => run(() => setExpertField(id, path, value));
}

export function ScreeningPane() {
  const { bundle, who } = useFile();
  const set = useSet();
  const s = bundle.expert.scr ?? {};
  const answered = QUESTIONS.filter((_, i) => (s.a?.[`q${i + 1}`] ?? "").trim()).length;

  return (
    <>
      <Section
        title="Screening interview"
        intro="A 20 to 30 minute assessment. Record what was said; ticking it as done isn't enough."
        aside={<Chip tone={screened(bundle.expert) ? "good" : "mute"}>{answered} of 12 answered</Chip>}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Interview date" type="date" value={s.date} onCommit={(v) => set(["scr", "date"], v)} />
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-fg-2">Interviewer</span>
            <p className="py-2 text-[14.5px]">{s.by ? who(s.by) : <span className="text-fg-3">Recorded when the date is entered</span>}</p>
          </div>
        </div>
        <ol className="flex flex-col">
          {QUESTIONS.map(([q, assesses], i) => (
            <li key={i} className="grid gap-x-5 gap-y-3 border-t border-line py-5 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
              <span className="font-mono text-[13px] text-fg-3 sm:pt-0.5">{i + 1}</span>
              <div className="flex min-w-0 flex-col gap-3">
                <div>
                  <p className="text-[15px] font-semibold leading-snug">{q}</p>
                  <p className="mt-1 text-[13px] text-fg-3">Assesses {assesses.toLowerCase()}</p>
                </div>
                <TextField multiline rows={3} label={`Answer to question ${i + 1}`} value={s.a?.[`q${i + 1}`]} onCommit={(v) => set(["scr", "a", `q${i + 1}`], v)} />
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Recruiter's written assessment">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField multiline label="Strongest areas" value={s.strengths} onCommit={(v) => set(["scr", "strengths"], v)} />
          <TextField multiline label="Limitations" value={s.limits} onCommit={(v) => set(["scr", "limits"], v)} />
          <TextField multiline label="Claims needing further verification" value={s.toVerify} onCommit={(v) => set(["scr", "toVerify"], v)} />
        </div>
      </Section>
    </>
  );
}

const claimTone = (s?: string) =>
  s === "Verified" ? "good" : s === "Partially verified" ? "warn" : s === "Disputed" || s === "Expired" ? "bad" : "mute";

export function VerificationPane() {
  const { bundle, run, who } = useFile();
  const set = useSet();
  const e = bundle.expert;

  return (
    <Section
      title="Verification register"
      intro="Every material claim gets a status, a source and a date. A well-known employer never turns a self-declared claim into a verified one."
    >
      {(e.claims ?? []).map((c, i) => (
        <Card key={i} onRemove={() => run(() => removeRow(e.id, "claims", i))} removeLabel="Remove this claim">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Chip tone={claimTone(c.status)}>{c.status || "Self-declared"}</Chip>
            {c.by && (
              <span className="text-[12.5px] text-fg-3">
                Status set by <span className="font-semibold text-fg-2">{who(c.by)}</span>, {fmtDate(c.at)}
              </span>
            )}
          </div>
          <div className={grid}>
            <TextField label="Claim" value={c.claim} onCommit={(v) => set(["claims", String(i), "claim"], v)} className="sm:col-span-2 lg:col-span-3" />
            <SelectField label="Status" value={c.status || "Self-declared"} options={VERIFICATION_STATUSES} onCommit={(v) => set(["claims", String(i), "status"], v)} />
            <TextField label="Date checked" type="date" value={c.date} onCommit={(v) => set(["claims", String(i), "date"], v)} />
            <TextField label="Source" placeholder="Registry, employer reference, publication" value={c.source} onCommit={(v) => set(["claims", String(i), "source"], v)} />
          </div>
        </Card>
      ))}
      <div>
        <button type="button" className="desk-btn desk-btn--quiet" onClick={() => run(() => addRow(e.id, "claims"))}>
          Add a claim
        </button>
      </div>
      <RuleNote>A disputed claim blocks approval until it is resolved, whatever the score.</RuleNote>
    </Section>
  );
}

export function CompliancePane() {
  const { bundle, who } = useFile();
  const set = useSet();
  const e = bundle.expert;
  const c = complianceState(e);
  const groups = requirementsFor(e).reduce<Record<string, ReturnType<typeof requirementsFor>>>((acc, r) => {
    const g = r.detail === "Healthcare screening" ? "Healthcare screening" : r.detail === "Financial services screening" ? "Financial services screening" : "Core requirements";
    (acc[g] ??= []).push(r);
    return acc;
  }, {});

  return (
    <Section
      title="Compliance gate"
      intro="Pass or fail, kept apart from the 100-point score. One failed requirement makes the expert ineligible at any score."
      aside={<Chip tone={complianceTone(c)}>{c === "cleared" ? "Cleared" : c === "failed" ? "Failed" : "Incomplete"}</Chip>}
    >
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <h3 className="mb-1 text-[14px] font-semibold text-fg-2">{group}</h3>
          <ul>
            {items.map((r) => {
              const v = e.comp?.[r.key] ?? { s: "", n: "" };
              const opts = r.naAllowed ? [...CHECK_OPTIONS, ["na", "Not applicable"] as [string, string]] : CHECK_OPTIONS;
              return (
                <li key={r.key} className="grid gap-3 border-t border-line py-4 md:grid-cols-[minmax(0,1.2fr)_170px_minmax(0,1fr)] md:items-start">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{r.label}</p>
                    <p className="text-[13px] text-fg-3">{r.detail}</p>
                    {v.by && (
                      <p className="mt-1 text-[12.5px] text-fg-3">
                        Checked by <span className="font-semibold text-fg-2">{who(v.by)}</span>, {fmtDate(v.at)}
                      </p>
                    )}
                  </div>
                  <SelectField label="Result" value={v.s} options={opts} onCommit={(x) => set(["comp", r.key, "s"], x)} />
                  <TextField label="Evidence or note" value={v.n} onCommit={(x) => set(["comp", r.key, "n"], x)} />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <RuleNote>
        Onboarding clearance does not clear a project. Run a fresh conflict check under Project match for every assignment. A signed
        declaration alone is not a compliance program; have counsel review the declarations behind these checks.
      </RuleNote>
    </Section>
  );
}

export function ScorecardPane() {
  const { bundle, operator, run, who } = useFile();
  const set = useSet();
  const e = bundle.expert;
  const tt = total(e);
  const [tierName, tierLabel] = tier(tt.t);
  const q = signOf(e, "quality");

  return (
    <>
      <Section
        title="Expert quality score"
        intro="An internal assessment against fixed anchors. Never show this number to a client as an objective measure."
        aside={
          tt.full ? <Chip tone={tt.t >= 70 ? "good" : tt.t >= 60 ? "warn" : "bad"}>{`${tierName}: ${tierLabel}`}</Chip> : <Chip tone="mute">Tier set when all 8 are scored</Chip>
        }
      >
        <div>
          {SCORECARD.map((d) => (
            <ScoreRow key={d.key} dim={d} value={e.score?.[d.key]} stamp={e.scoreBy?.[d.key]} onCommit={(v) => set(["score", d.key], v)} />
          ))}
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-5">
          <p>
            <span className="score-figure">{tt.t}</span>
            <span className="ml-2 text-[15px] text-fg-2">/ 100{tt.full ? "" : `, ${tt.n} of 8 scored`}</span>
          </p>
        </div>
      </Section>

      <Section title="Approvals" intro="Four separate decisions, each recorded with the operator who made it and when.">
        {q?.d === "approve" && typeof q.total === "number" && q.total !== tt.t && (
          <RuleNote>
            The score has changed from {q.total} to {tt.t} since Quality approved it. Reopen the Quality sign-off and approve again.
          </RuleNote>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {SIGN_STAGES.map(([k, label]) => {
            const s = signOf(e, k);
            const why = cannotApprove(e, k, operator.username);
            return (
              <div key={k} className="flex flex-col gap-3 rounded-[18px] border border-line bg-[rgb(var(--fg-rgb)/0.02)] p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[16px] font-semibold">{label} sign-off</h3>
                  <Chip tone={s?.d === "approve" ? "good" : s?.d === "reject" ? "bad" : "mute"}>
                    {s?.d === "approve" ? "Approved" : s?.d === "reject" ? "Rejected" : "Open"}
                  </Chip>
                </div>
                {s?.d ? (
                  <p className="text-[13.5px] text-fg-2">
                    {s.d === "approve" ? "Approved" : "Rejected"} by <span className="font-semibold text-fg">{who(s.by)}</span> on {fmtDate(s.at)}
                    {typeof s.total === "number" ? ` at a score of ${s.total}` : ""}.
                  </p>
                ) : why ? (
                  <p className="text-[13.5px] text-fg-3">{why}</p>
                ) : (
                  <p className="text-[13.5px] text-fg-2">Ready for your decision.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {s?.d ? (
                    <button type="button" className="desk-btn desk-btn--quiet" onClick={() => run(() => decide(e.id, k, ""))}>
                      <ArrowCounterClockwise aria-hidden weight="bold" className="size-4" />
                      Reopen
                    </button>
                  ) : (
                    <>
                      <button type="button" className="desk-btn desk-btn--primary" disabled={!!why} onClick={() => run(() => decide(e.id, k, "approve"))}>
                        <CheckCircle aria-hidden weight="bold" className="size-4" />
                        Approve
                      </button>
                      <button type="button" className="desk-btn desk-btn--danger" onClick={() => run(() => decide(e.id, k, "reject"))}>
                        <Prohibit aria-hidden weight="bold" className="size-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
                {s?.d && <TextField label="Decision note" value={s.note} onCommit={(v) => set(["signs", k, "note"], v)} />}
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
