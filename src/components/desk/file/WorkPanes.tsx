"use client";

import { useState } from "react";
import {
  addEvaluation,
  addMatch,
  deleteExpert,
  liftSuspension,
  markReviewed,
  removeRecord,
  setEvalField,
  setMatchField,
  suspend,
} from "@/app/operators/actions";
import { FLAGS, MATCH_DIMS, PERF_DIMS, REVIEWS, addMonths, evalTotal, matchTotal, matchVerdict, perfClass } from "@/lib/desk/rules";
import { Chip, RuleNote, Section, fmtDate, fmtDateTime } from "../ui";
import { useFile } from "./context";
import { Card, CheckField, ScoreRow, SelectField, TextField } from "./fields";

export function MatchPane() {
  const { bundle, run, who } = useFile();
  const e = bundle.expert;
  const set = (id: string, path: string[], v: unknown) => run(() => setMatchField(e.id, id, path, v));

  return (
    <Section title="Project match" intro="A separate score for one client brief. A high network score doesn't make someone right for this assignment.">
      {bundle.matches.map((m) => {
        const t = matchTotal(m);
        const [verdict, tone] = matchVerdict(m, e);
        return (
          <Card key={m.id} onRemove={() => run(() => removeRecord(e.id, "matches", m.id))} removeLabel="Remove this match">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Chip tone={tone}>{verdict}</Chip>
              <span className="text-[12.5px] text-fg-3">
                Started by <span className="font-semibold text-fg-2">{who(m.by)}</span>, {fmtDate(m.at)}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Project or brief" value={m.project} onCommit={(v) => set(m.id, ["project"], v)} />
              <TextField label="What the client needs to learn" value={m.need} onCommit={(v) => set(m.id, ["need"], v)} />
            </div>
            <div className="mt-2">
              {MATCH_DIMS.map((d) => (
                <ScoreRow key={d.key} dim={d} value={m.d?.[d.key]} stamp={m.dBy?.[d.key]} onCommit={(v) => set(m.id, ["d", d.key], v)} />
              ))}
            </div>
            <div className="mt-2 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <SelectField
                label="Fresh conflict and eligibility check"
                value={m.conflict}
                options={[
                  ["", "Not checked"],
                  ["pass", "Pass"],
                  ["fail", "Fail"],
                ]}
                onCommit={(v) => set(m.id, ["conflict"], v)}
              />
              <TextField label="Conflict check note" value={m.note} onCommit={(v) => set(m.id, ["note"], v)} />
            </div>
            {m.conflictBy && (
              <p className="mt-2 text-[12.5px] text-fg-3">
                Conflict check set by <span className="font-semibold text-fg-2">{who(m.conflictBy.by)}</span>, {fmtDate(m.conflictBy.at)}
              </p>
            )}
            <div className="mt-4">
              <CheckField label="Client has accepted adjacent expertise (allows 70 to 79)" checked={m.adjacent} onCommit={(v) => set(m.id, ["adjacent"], v)} />
            </div>
            <p className="mt-4 border-t border-line pt-4">
              <span className="text-[30px] font-semibold tracking-[-0.04em] tabular-nums">{t.t}</span>
              <span className="ml-2 text-[14px] text-fg-2">/ 100 match{t.full ? "" : `, ${t.n} of ${MATCH_DIMS.length} scored`}</span>
            </p>
          </Card>
        );
      })}
      <div>
        <button type="button" className="desk-btn desk-btn--quiet" onClick={() => run(() => addMatch(e.id))}>
          Score against a new project
        </button>
      </div>
    </Section>
  );
}

export function PerformancePane() {
  const { bundle, run, who } = useFile();
  const e = bundle.expert;
  const set = (id: string, path: string[], v: unknown) => run(() => setEvalField(e.id, id, path, v));
  const totals = bundle.evals.map(evalTotal).filter((t) => t.full);

  return (
    <Section
      title="Performance after consultations"
      intro="Look for substantiated feedback and repeated patterns. One client's opinion doesn't decide an expert's future."
      aside={totals.length ? <Chip tone="mute">{`Average ${Math.round(totals.reduce((a, t) => a + t.t, 0) / totals.length)} across ${totals.length}`}</Chip> : null}
    >
      {bundle.evals.map((x) => {
        const t = evalTotal(x);
        const [cls, action, tone] = perfClass(t.t);
        return (
          <Card key={x.id} onRemove={() => run(() => removeRecord(e.id, "evals", x.id))} removeLabel="Remove this evaluation">
            <p className="mb-4 text-[12.5px] text-fg-3">
              Recorded by <span className="font-semibold text-fg-2">{who(x.by)}</span>, {fmtDate(x.at)}
            </p>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <TextField label="Project" value={x.project} onCommit={(v) => set(x.id, ["project"], v)} />
              <TextField label="Consultation date" type="date" value={x.date} onCommit={(v) => set(x.id, ["date"], v)} />
            </div>
            <div className="mt-2">
              {PERF_DIMS.map((d) => (
                <ScoreRow key={d.key} dim={d} value={x.d?.[d.key]} stamp={x.dBy?.[d.key]} onCommit={(v) => set(x.id, ["d", d.key], v)} />
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FLAGS.map(([k, label]) => (
                <CheckField key={k} label={label} checked={x.flags?.[k]} onCommit={(v) => set(x.id, ["flags", k], v)} />
              ))}
            </div>
            <div className="mt-4">
              <TextField multiline rows={2} label="Feedback and evidence" value={x.note} onCommit={(v) => set(x.id, ["note"], v)} />
            </div>
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-4">
              <p>
                <span className="text-[30px] font-semibold tracking-[-0.04em] tabular-nums">{t.t}</span>
                <span className="ml-2 text-[14px] text-fg-2">/ 100</span>
              </p>
              {t.full ? <Chip tone={tone}>{`${cls}: ${action}`}</Chip> : <Chip tone="mute">Scoring incomplete</Chip>}
            </div>
          </Card>
        );
      })}
      <div>
        <button type="button" className="desk-btn desk-btn--quiet" onClick={() => run(() => addEvaluation(e.id))}>
          Record a consultation
        </button>
      </div>
      <RuleNote>
        Flagging a compliance incident suspends the expert at once, whatever the score. Flagging inaccurate credentials reopens the
        Verification sign-off.
      </RuleNote>
    </Section>
  );
}

export function UpkeepPane() {
  const { bundle, run, who } = useFile();
  const e = bundle.expert;
  const [reason, setReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const su = e.susp;
  const today = new Date();

  return (
    <>
      <Section title="Review schedule" intro="Conflicts are re-checked for every assignment, and availability before each one.">
        <div className="-mx-5 overflow-x-auto sm:-mx-7">
          <table className="desk-table min-w-[640px]">
            <thead>
              <tr>
                <th scope="col" className="pl-5 sm:pl-7">Item</th>
                <th scope="col">Every</th>
                <th scope="col">Last reviewed</th>
                <th scope="col">Next due</th>
                <th scope="col" className="pr-5 sm:pr-7">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {REVIEWS.map(([k, label, months]) => {
                const last = e.reviews?.[k] || e.createdAt;
                const due = addMonths(last, months);
                const over = !!due && due < today;
                return (
                  <tr key={k}>
                    <td className="pl-5 font-semibold sm:pl-7">{label}</td>
                    <td>{months} months</td>
                    <td>{fmtDate(last)}</td>
                    <td>{over ? <Chip tone="warn">{`Overdue since ${fmtDate(due!.toISOString())}`}</Chip> : fmtDate(due?.toISOString())}</td>
                    <td className="pr-5 text-right sm:pr-7">
                      <button type="button" className="desk-btn desk-btn--quiet px-3 py-2 text-[13px]" onClick={() => run(() => markReviewed(e.id, k))}>
                        Mark reviewed today
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Suspension">
        {su?.on ? (
          <div className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-3">
              <Chip tone="bad">Suspended</Chip>
              <span className="text-[14.5px]">{su.reason}</span>
            </p>
            <p className="text-[13px] text-fg-3">
              By {who(su.by)}, {fmtDate(su.at)}
            </p>
            <div>
              <button type="button" className="desk-btn desk-btn--quiet" onClick={() => run(() => liftSuspension(e.id))}>
                Lift suspension after investigation
              </button>
            </div>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={async (ev) => {
              ev.preventDefault();
              if (await run(() => suspend(e.id, reason))) setReason("");
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label htmlFor="susp-reason" className="text-[13px] font-semibold text-fg-2">
                Reason
              </label>
              <input
                id="susp-reason"
                className="desk-input"
                value={reason}
                onChange={(ev) => setReason(ev.target.value)}
                placeholder="What happened and what is being investigated"
              />
            </div>
            <button type="submit" className="desk-btn desk-btn--danger" disabled={!reason.trim()}>
              Suspend this expert
            </button>
          </form>
        )}
      </Section>

      <Section title="Audit trail" intro="Results and decisions on this file, with the operator who made each one. Routine edits aren't logged; who set a value is shown beside it." aside={<span className="text-[14px] text-fg-2">{bundle.audit.length} entries</span>}>
        {bundle.audit.length ? (
          <ol className="flex max-h-[560px] flex-col overflow-y-auto pr-1">
            {bundle.audit.map((a, i) => (
              <li key={`${a.at}-${i}`} className="grid gap-x-5 gap-y-0.5 border-b border-line py-3 last:border-b-0 sm:grid-cols-[170px_minmax(0,1fr)]">
                <time dateTime={a.at} className="font-mono text-[12px] text-fg-3 sm:pt-0.5">
                  {fmtDateTime(a.at)}
                </time>
                <p className="text-[14px]">
                  <span className="font-semibold">{who(a.by)}</span> <span className="text-fg-2">{a.action}</span>
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[14.5px] text-fg-2">Milestones appear here as they happen: the interview completed, the gate cleared, the scorecard completed, each sign-off.</p>
        )}
      </Section>

      <Section title="Delete this file" intro="Removes the expert's profile, project matches, evaluations and audit trail. Use this when a person asks for their data to be erased.">
        <div className="flex flex-wrap gap-3">
          {confirmDelete ? (
            <>
              <form
                action={async () => {
                  setDeleting(true);
                  await deleteExpert(e.id);
                }}
              >
                <button type="submit" className="desk-btn desk-btn--danger" disabled={deleting}>
                  {deleting ? "Deleting" : "Delete permanently"}
                </button>
              </form>
              <button type="button" className="desk-btn desk-btn--quiet" onClick={() => setConfirmDelete(false)}>
                Keep the file
              </button>
            </>
          ) : (
            <button type="button" className="desk-btn desk-btn--danger" onClick={() => setConfirmDelete(true)}>
              Delete expert file
            </button>
          )}
        </div>
      </Section>
    </>
  );
}
