"use server";

import { randomInt } from "node:crypto";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, operatorNames } from "@/lib/desk/accounts";
import { milestones, type FileState } from "@/lib/desk/milestones";
import {
  ALL_REQUIREMENTS,
  FLAGS,
  MATCH_DIMS,
  PERF_DIMS,
  REVIEWS,
  SCORECARD,
  SIGN_STAGES,
  VERIFICATION_STATUSES,
  cannotApprove,
  clampScore,
  total,
} from "@/lib/desk/rules";
import { SESSION_COOKIE, SIGN_IN_PATH, createSessionValue, requireOperator, sessionCookieOptions } from "@/lib/desk/session";
import { mutate, readDesk } from "@/lib/desk/store";
import type { CheckResult, DeskData, Expert, ExpertBundle, Operator, SignKey } from "@/lib/desk/types";

/*
 * Every change to the register goes through these server actions. Each one checks the operator's
 * session first, validates the input against an allow-list (the browser is never trusted) and
 * stamps scores, compliance results and claim statuses with the operator who set them.
 *
 * The audit trail records milestones only: `change` compares the file before and after and logs
 * results and decisions (src/lib/desk/milestones.ts), never individual field edits.
 */

export type ActionResult = { ok: true; bundle: ExpertBundle } | { ok: false; error: string };

const MAX_TEXT = 4000;
const now = () => new Date().toISOString();
const text = (v: unknown) => String(v ?? "").trim().slice(0, MAX_TEXT);

class Refusal extends Error {}
function refuse(message: string): never {
  throw new Refusal(message);
}

/** Add a line to an expert's audit trail. */
function log(d: DeskData, expertId: string, by: string, action: string) {
  d.audit.push({ expertId, at: now(), by, action });
}

function fileState(d: DeskData, expertId: string): FileState {
  return structuredClone({
    expert: d.experts[expertId],
    matches: Object.values(d.matches).filter((m) => m.expertId === expertId),
    evals: Object.values(d.evals).filter((x) => x.expertId === expertId),
  });
}

async function bundleFor(d: DeskData, expertId: string): Promise<ExpertBundle> {
  const expert = d.experts[expertId];
  return {
    expert,
    matches: Object.values(d.matches).filter((m) => m.expertId === expertId).sort((a, b) => b.at.localeCompare(a.at)),
    evals: Object.values(d.evals).filter((x) => x.expertId === expertId).sort((a, b) => b.at.localeCompare(a.at)),
    // Stored oldest first; shown newest first
    audit: d.audit.filter((a) => a.expertId === expertId).reverse(),
    names: await operatorNames(),
  };
}

/**
 * Run a change for one expert and return the updated file, or the reason it was refused. Whatever
 * the change achieved (a completed scorecard, a cleared gate, a decision, a new status) is written
 * to the audit trail under the operator's name.
 */
async function change(expertId: string, fn: (d: DeskData, op: Operator, e: Expert) => void): Promise<ActionResult> {
  const op = await requireOperator();
  try {
    const d = await mutate((draft) => {
      const e = draft.experts[expertId];
      if (!e) refuse("That expert file no longer exists. Reload the register.");
      const before = fileState(draft, expertId);
      fn(draft, op, e);
      for (const line of milestones(before, fileState(draft, expertId))) log(draft, expertId, op.username, line);
      return draft;
    });
    return { ok: true, bundle: await bundleFor(d, expertId) };
  } catch (err) {
    if (err instanceof Refusal) return { ok: false, error: err.message };
    console.error("[operators] change failed", err);
    return { ok: false, error: "The change wasn't saved. Try again." };
  }
}

export async function loadBundle(expertId: string): Promise<ExpertBundle | null> {
  await requireOperator();
  const d = await readDesk();
  return d.experts[expertId] ? bundleFor(d, expertId) : null;
}

/* ───────────────────────── Sign in and out ───────────────────────── */

export type SignInState = { error: string; username: string };

const attempts = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 8;

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const username = text(form.get("username")).toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = text(form.get("next"));
  if (!username || !password) return { error: "Enter your username and password.", username };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}|${username}`;
  const seen = attempts.get(key);
  if (seen && seen.count >= MAX_ATTEMPTS && seen.until > Date.now()) {
    return { error: "Too many attempts. Wait 15 minutes, then try again.", username };
  }

  const account = await checkCredentials(username, password);
  if (!account) {
    const count = seen && seen.until > Date.now() ? seen.count + 1 : 1;
    attempts.set(key, { count, until: Date.now() + WINDOW_MS });
    return { error: "That username and password don't match an active operator.", username };
  }
  attempts.delete(key);

  (await cookies()).set(SESSION_COOKIE, createSessionValue(account.username), sessionCookieOptions);
  redirect(next.startsWith("/operators") && !next.startsWith(SIGN_IN_PATH) ? next : "/operators/dashboard");
}

export async function signOut() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: sessionCookieOptions.path });
  redirect(SIGN_IN_PATH);
}

/* ───────────────────────── Expert files ───────────────────────── */

const ID_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newId = (prefix: string) => prefix + Array.from({ length: 6 }, () => ID_CHARS[randomInt(ID_CHARS.length)]).join("");

export async function createExpert() {
  const op = await requireOperator();
  const id = await mutate((d) => {
    let id = newId("EX-");
    while (d.experts[id]) id = newId("EX-");
    d.experts[id] = {
      id,
      createdAt: now(),
      createdBy: op.username,
      reg: {},
      jobs: [],
      quals: [],
      tax: {},
      areas: [],
      scr: { a: {} },
      comp: {},
      claims: [],
      score: {},
      scoreBy: {},
      signs: {},
      reviews: {},
    };
    log(d, id, op.username, "opened the expert file");
    return id;
  });
  redirect(`/operators/experts/${id}`);
}

export async function deleteExpert(expertId: string) {
  const op = await requireOperator();
  await mutate((d) => {
    if (!d.experts[expertId]) return;
    removeExpertFrom(d, expertId);
    // Keep the fact that a file was erased, with who did it, but none of the person's details.
    log(d, expertId, op.username, "deleted the expert file at the person's request");
  });
  redirect("/operators");
}

function removeExpertFrom(d: DeskData, expertId: string) {
  delete d.experts[expertId];
  for (const [id, m] of Object.entries(d.matches)) if (m.expertId === expertId) delete d.matches[id];
  for (const [id, x] of Object.entries(d.evals)) if (x.expertId === expertId) delete d.evals[id];
  d.audit = d.audit.filter((a) => a.expertId !== expertId);
}

export async function removeSamples() {
  await requireOperator();
  await mutate((d) => {
    for (const e of Object.values(d.experts)) if (e.sample) removeExpertFrom(d, e.id);
  });
  redirect("/operators");
}

/* ───────────────────────── Field edits ───────────────────────── */

const REG_TEXT = ["legalName", "displayName", "email", "phone", "country", "city", "linkedin", "website", "languages", "cvRef", "availability", "rate"];
const REG_BOOL = ["idOk", "emailOk", "phoneOk", "rateOk"];
const TAX_FIELDS = ["industry", "subsector", "industry2", "functional", "geo", "companies", "customers", "technical"];
const ROWS = {
  jobs: ["employer", "title", "unit", "start", "end", "geo", "seniority", "scope", "resp", "projects", "decisions", "exposure"],
  quals: ["qual", "inst", "year", "status", "source"],
  areas: ["area", "years", "depth", "recency", "authority", "questions", "evidence"],
  claims: ["claim", "status", "source", "date"],
} as const;
type RowKey = keyof typeof ROWS;
const isRowKey = (k: string): k is RowKey => k in ROWS;

const CHECKS: CheckResult[] = ["", "pass", "fail", "na"];

/** Set one field on an expert's file. `path` is the field's location, e.g. ["score", "k1"]. */
export async function setExpertField(expertId: string, path: string[], value: unknown): Promise<ActionResult> {
  return change(expertId, (_d, op, e) => {
    const [root, a, b, c] = path;
    const at = now();
    const by = op.username;

    switch (root) {
      case "reg": {
        e.reg ??= {};
        if (REG_TEXT.includes(a)) {
          (e.reg as Record<string, unknown>)[a] = text(value);
        } else if (REG_BOOL.includes(a)) {
          (e.reg as Record<string, unknown>)[a] = value === true;
          if (a === "idOk") {
            e.reg.idBy = by;
            e.reg.idAt = at;
          } else if (a === "rateOk") e.reg.rateBy = by;
        } else refuse("That field can't be changed.");
        return;
      }
      case "tax": {
        if (!TAX_FIELDS.includes(a)) refuse("That field can't be changed.");
        e.tax ??= {};
        (e.tax as Record<string, string>)[a] = text(value);
        if (a === "industry") e.tax.subsector = "";
        return;
      }
      case "jobs":
      case "quals":
      case "areas":
      case "claims": {
        const rows = e[root] as Record<string, string | undefined>[];
        const i = Number(a);
        if (!Number.isInteger(i) || i < 0 || i >= rows.length) refuse("That row no longer exists. Reload the file.");
        if (!(ROWS[root] as readonly string[]).includes(b)) refuse("That field can't be changed.");
        const v = text(value);
        if (b === "status" && !VERIFICATION_STATUSES.includes(v)) refuse("Choose a verification status from the list.");
        rows[i][b] = v;
        if (root === "claims" && b === "status") {
          rows[i].by = by;
          rows[i].at = at;
        }
        return;
      }
      case "scr": {
        e.scr ??= { a: {} };
        if (a === "date") {
          e.scr.date = text(value).slice(0, 10);
          if (!e.scr.by) e.scr.by = by;
        } else if (a === "a" && /^q([1-9]|1[0-2])$/.test(b ?? "")) {
          e.scr.a ??= {};
          e.scr.a[b] = text(value);
        } else if (["strengths", "limits", "toVerify"].includes(a)) {
          (e.scr as Record<string, unknown>)[a] = text(value);
        } else refuse("That field can't be changed.");
        return;
      }
      case "comp": {
        const req = ALL_REQUIREMENTS.find((r) => r.key === a);
        if (!req) refuse("That requirement doesn't exist.");
        e.comp ??= {};
        const cur = (e.comp[a] ??= { s: "", n: "" });
        if (b === "s") {
          const v = text(value) as CheckResult;
          if (!CHECKS.includes(v)) refuse("Choose pass, fail or not checked.");
          if (v === "na" && !req.naAllowed) refuse(`"${req.label}" can't be marked not applicable.`);
          cur.s = v;
          cur.by = by;
          cur.at = at;
        } else if (b === "n") {
          cur.n = text(value);
        } else refuse("That field can't be changed.");
        return;
      }
      case "score": {
        const dim = SCORECARD.find((x) => x.key === a);
        if (!dim) refuse("That scorecard category doesn't exist.");
        const v = clampScore(value, dim.max);
        e.score ??= {};
        e.scoreBy ??= {};
        if (e.score[a] === v) return;
        e.score[a] = v;
        e.scoreBy[a] = { by, at };
        return;
      }
      case "signs": {
        const stage = SIGN_STAGES.find(([k]) => k === a);
        if (!stage || b !== "note" || c !== undefined) refuse("That field can't be changed.");
        const s = e.signs[a as SignKey];
        if (!s) refuse("Write the note after the decision is made.");
        s.note = text(value);
        return;
      }
      default:
        refuse("That field can't be changed.");
    }
  });
}

export async function addRow(expertId: string, rowKey: string): Promise<ActionResult> {
  return change(expertId, (_d, _op, e) => {
    if (!isRowKey(rowKey)) refuse("Unknown list.");
    const rows = e[rowKey] as Record<string, string>[];
    if (rows.length >= 40) refuse("This list is full.");
    rows.push(rowKey === "claims" || rowKey === "quals" ? { status: "Self-declared" } : {});
  });
}

export async function removeRow(expertId: string, rowKey: string, index: number): Promise<ActionResult> {
  return change(expertId, (_d, _op, e) => {
    if (!isRowKey(rowKey)) refuse("Unknown list.");
    const rows = e[rowKey] as Record<string, string>[];
    if (!Number.isInteger(index) || index < 0 || index >= rows.length) refuse("That row no longer exists. Reload the file.");
    rows.splice(index, 1);
  });
}

/* ───────────────────────── Sign-offs ───────────────────────── */

export async function decide(expertId: string, stage: string, decision: string): Promise<ActionResult> {
  return change(expertId, (_d, op, e) => {
    const s = SIGN_STAGES.find(([k]) => k === stage);
    if (!s) refuse("Unknown sign-off.");
    const k = s[0];
    if (!["", "approve", "reject"].includes(decision)) refuse("Unknown decision.");
    if (decision === "approve") {
      const why = cannotApprove(e, k, op.username);
      if (why) refuse(why);
    }
    e.signs[k] = {
      d: decision as "" | "approve" | "reject",
      by: decision ? op.username : "",
      at: decision ? now() : "",
      total: decision ? total(e).t : null,
      note: "",
    };
  });
}

/* ───────────────────────── Reviews and suspension ───────────────────────── */

export async function markReviewed(expertId: string, key: string): Promise<ActionResult> {
  return change(expertId, (d, op, e) => {
    const r = REVIEWS.find(([k]) => k === key);
    if (!r) refuse("Unknown review item.");
    e.reviews ??= {};
    e.reviews[key] = now();
    log(d, e.id, op.username, `reviewed ${r[1].toLowerCase()}`);
  });
}

export async function suspend(expertId: string, reason: string): Promise<ActionResult> {
  return change(expertId, (_d, op, e) => {
    const why = text(reason);
    if (!why) refuse("Say what happened and what is being investigated.");
    e.susp = { on: true, reason: why, by: op.username, at: now() };
  });
}

export async function liftSuspension(expertId: string): Promise<ActionResult> {
  return change(expertId, (_d, op, e) => {
    e.susp = { on: false, reason: "", by: op.username, at: now() };
  });
}

/* ───────────────────────── Project matches and evaluations ───────────────────────── */

export async function addMatch(expertId: string): Promise<ActionResult> {
  return change(expertId, (d, op, e) => {
    const id = newId("M-");
    d.matches[id] = { id, expertId: e.id, project: "", need: "", d: {}, dBy: {}, conflict: "", note: "", adjacent: false, at: now(), by: op.username };
  });
}

export async function addEvaluation(expertId: string): Promise<ActionResult> {
  return change(expertId, (d, op, e) => {
    const id = newId("P-");
    d.evals[id] = { id, expertId: e.id, project: "", date: "", d: {}, dBy: {}, flags: {}, note: "", at: now(), by: op.username };
  });
}

export async function removeRecord(expertId: string, kind: "matches" | "evals", id: string): Promise<ActionResult> {
  return change(expertId, (d, op) => {
    const rec = d[kind][id];
    if (!rec || rec.expertId !== expertId) refuse("That record no longer exists.");
    delete d[kind][id];
    log(d, expertId, op.username, `removed the ${kind === "matches" ? "project match" : "consultation evaluation"} "${rec.project || "untitled"}"`);
  });
}

export async function setMatchField(expertId: string, id: string, path: string[], value: unknown): Promise<ActionResult> {
  return change(expertId, (d, op) => {
    const m = d.matches[id];
    if (!m || m.expertId !== expertId) refuse("That project match no longer exists.");
    const [root, key] = path;
    const by = op.username;
    if (root === "project" || root === "need" || root === "note") {
      m[root] = text(value);
    } else if (root === "adjacent") {
      m.adjacent = value === true;
    } else if (root === "conflict") {
      const v = text(value) as CheckResult;
      if (!["", "pass", "fail"].includes(v)) refuse("Choose pass, fail or not checked.");
      m.conflict = v;
      m.conflictBy = { by, at: now() };
    } else if (root === "d") {
      const dim = MATCH_DIMS.find((x) => x.key === key);
      if (!dim) refuse("That match category doesn't exist.");
      const v = clampScore(value, dim.max);
      if (m.d[key] === v) return;
      m.d[key] = v;
      (m.dBy ??= {})[key] = { by, at: now() };
    } else refuse("That field can't be changed.");
  });
}

export async function setEvalField(expertId: string, id: string, path: string[], value: unknown): Promise<ActionResult> {
  return change(expertId, (d, op, e) => {
    const x = d.evals[id];
    if (!x || x.expertId !== expertId) refuse("That evaluation no longer exists.");
    const [root, key] = path;
    const by = op.username;
    if (root === "project" || root === "note") {
      x[root] = text(value);
    } else if (root === "date") {
      x.date = text(value).slice(0, 10);
    } else if (root === "d") {
      const dim = PERF_DIMS.find((p) => p.key === key);
      if (!dim) refuse("That evaluation category doesn't exist.");
      const v = clampScore(value, dim.max);
      if (x.d[key] === v) return;
      x.d[key] = v;
      (x.dBy ??= {})[key] = { by, at: now() };
    } else if (root === "flags") {
      if (!FLAGS.some(([k]) => k === key)) refuse("Unknown flag.");
      const on = value === true;
      x.flags[key] = on;
      // A compliance incident suspends at once; inaccurate credentials reopen Verification.
      if (on && key === "compliance") {
        e.susp = { on: true, reason: "Compliance incident reported on a consultation. Under investigation.", by, at: now() };
      }
      if (on && key === "inaccurate" && e.signs.verification?.d === "approve") {
        e.signs.verification = { d: "", by: "", at: "", total: null, note: "" };
      }
    } else refuse("That field can't be changed.");
  });
}
