/**
 * What goes in an expert's audit trail: milestones, not keystrokes. After every change the desk
 * compares the file before and after, and records only results and decisions, such as the
 * scorecard being completed, the compliance gate clearing or failing, a sign-off, a suspension, or
 * the expert's status changing. Edits to names, notes, answers or single score categories are not
 * logged; who set each value is still stamped on the value itself.
 */
import {
  complianceState,
  disputedCount,
  evalTotal,
  matchTotal,
  matchVerdict,
  perfClass,
  requirementsFor,
  screened,
  SIGN_STAGES,
  status,
  tier,
  total,
  FLAGS,
} from "./rules";
import type { Evaluation, Expert, Match } from "./types";

export type FileState = { expert: Expert; matches: Match[]; evals: Evaluation[] };

const quote = (s: string) => `"${s || "untitled"}"`;

/** Lines for the audit trail, in the order they happened logically. */
export function milestones(before: FileState, after: FileState): string[] {
  const out: string[] = [];
  const a = before.expert;
  const b = after.expert;

  if (!screened(a) && screened(b)) out.push("completed the screening interview");

  if (!a.reg?.idOk && b.reg?.idOk) out.push("confirmed the expert's identity");
  if (a.reg?.idOk && !b.reg?.idOk) out.push("withdrew the identity check");

  if (!a.reg?.rateOk && b.reg?.rateOk) out.push("signed off the expert's rate");
  if (a.reg?.rateOk && !b.reg?.rateOk) out.push("withdrew the rate sign-off");

  const da = disputedCount(a);
  const db = disputedCount(b);
  if (db > da) out.push(`marked ${db - da === 1 ? "a claim" : `${db - da} claims`} as disputed`);
  if (da > 0 && db === 0) out.push("resolved the disputed claims");

  const ca = complianceState(a);
  const cb = complianceState(b);
  if (ca !== cb) {
    if (cb === "cleared") out.push("cleared the compliance gate");
    else if (cb === "failed") {
      const failed = requirementsFor(b).filter((r) => b.comp?.[r.key]?.s === "fail").map((r) => r.label);
      out.push(`failed the compliance gate on ${failed.join(", ")}`);
    } else out.push("reopened the compliance gate");
  }

  const ta = total(a);
  const tb = total(b);
  if (!ta.full && tb.full) out.push(`completed the scorecard: ${tb.t} / 100, ${tier(tb.t)[0]} (${tier(tb.t)[1].toLowerCase()})`);
  else if (ta.full && tb.full && ta.t !== tb.t) out.push(`changed the score from ${ta.t} to ${tb.t}`);
  else if (ta.full && !tb.full) out.push("reopened the scorecard");

  for (const [k, label] of SIGN_STAGES) {
    const sa = a.signs?.[k];
    const sb = b.signs?.[k];
    if ((sa?.d ?? "") === (sb?.d ?? "") && (sa?.at ?? "") === (sb?.at ?? "")) continue;
    if (sb?.d === "approve") out.push(`approved the ${label} sign-off at a score of ${sb.total ?? tb.t}`);
    else if (sb?.d === "reject") out.push(`rejected the ${label} sign-off`);
    else if (sa?.d) out.push(`reopened the ${label} sign-off`);
  }

  if (!a.susp?.on && b.susp?.on) out.push(`suspended the expert: ${b.susp.reason}`);
  if (a.susp?.on && !b.susp?.on) out.push("lifted the suspension");

  // Project matches: the outcome, once there is one
  for (const m of after.matches) {
    const old = before.matches.find((x) => x.id === m.id);
    // A verdict that moved only because the expert's status moved is covered by the status line
    if (!old || JSON.stringify(old) === JSON.stringify(m)) continue;
    if (old.conflict !== m.conflict && (m.conflict === "pass" || m.conflict === "fail")) {
      out.push(`${m.conflict === "pass" ? "passed" : "failed"} the conflict check for ${quote(m.project)}`);
    }
    const va = matchVerdict(old, a)[0];
    const vb = matchVerdict(m, b)[0];
    const scored = matchTotal(m).full;
    if (va !== vb && scored && vb !== "Needs the project conflict check") out.push(`project match ${quote(m.project)}: ${vb} (${matchTotal(m).t} / 100)`);
  }

  // Consultation evaluations: the rating once complete, and any flag raised
  for (const x of after.evals) {
    const old = before.evals.find((y) => y.id === x.id);
    if (!old) continue;
    const ea = evalTotal(old);
    const eb = evalTotal(x);
    if (!ea.full && eb.full) out.push(`rated the consultation ${quote(x.project)}: ${eb.t} / 100, ${perfClass(eb.t)[0].toLowerCase()}`);
    else if (ea.full && eb.full && ea.t !== eb.t) out.push(`changed the rating of ${quote(x.project)} from ${ea.t} to ${eb.t}`);
    for (const [k, label] of FLAGS) {
      if (!old.flags?.[k] && x.flags?.[k]) out.push(`flagged "${label}" on ${quote(x.project)}`);
    }
  }

  // The headline result last, so the trail reads cause then effect
  const sa = status(a);
  const sb = status(b);
  if (sa.code !== sb.code) out.push(`status is now ${sb.label}`);

  return out;
}
