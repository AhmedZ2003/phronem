/**
 * The qualification rules, ported from the EQIP Qualification Desk. Pure functions with no
 * server or browser dependencies, so the server actions enforce exactly what the screens show.
 *
 * Three separate judgments, never merged:
 *   - network quality: the 100-point scorecard (SCORECARD) and its tiers
 *   - fit for one client brief: the project match score (MATCH_DIMS)
 *   - what happened on a call: the post-consultation evaluation (PERF_DIMS)
 * Compliance is a pass/fail gate beside them. No score can override a failed requirement.
 */
import type { CheckResult, Evaluation, Expert, Match, SignKey, Tone } from "./types";

export const INDUSTRIES: Record<string, string[]> = {
  "Healthcare and life sciences": [
    "Pharmaceuticals",
    "Biotechnology",
    "Medical devices",
    "Hospitals and health systems",
    "Healthcare insurance",
    "Healthcare technology",
    "Clinical research",
    "Contract research organizations",
    "Pharmaceutical distribution",
    "Healthcare procurement",
    "Diagnostics",
    "Regulatory affairs",
  ],
  "Banking and financial services": [
    "Retail banking",
    "Corporate and commercial banking",
    "Payments",
    "Lending and credit",
    "Wealth and asset management",
    "Insurance",
    "Capital markets",
    "Risk and compliance",
    "Fintech",
  ],
  "Information technology": [
    "Enterprise software",
    "Cloud and infrastructure",
    "Cybersecurity",
    "IT services and outsourcing",
    "Data and AI",
    "Telecommunications",
    "Semiconductors and hardware",
  ],
  "Private equity and investing": [
    "Buyout",
    "Growth equity",
    "Venture capital",
    "Portfolio operations",
    "Deal advisory and due diligence",
    "Fund operations",
  ],
  Other: [],
};

const HEALTHCARE = "Healthcare and life sciences";
const FINANCIAL = ["Banking and financial services", "Private equity and investing"];

/** [low, high, description] for one score band. */
export type Band = [number, number, string];
export type Dimension = { key: string; label: string; max: number; bands?: Band[] };

export const SCORECARD: Dimension[] = [
  {
    key: "k1",
    label: "Domain expertise depth",
    max: 20,
    bands: [
      [0, 4, "General awareness only; cannot go beyond basic concepts"],
      [5, 8, "Limited exposure; knows some terminology and processes"],
      [9, 12, "Working knowledge and practical experience"],
      [13, 16, "Deep specialist knowledge; explains complex issues"],
      [17, 20, "Exceptional authority across a defined niche"],
    ],
  },
  {
    key: "k2",
    label: "Professional experience and seniority",
    max: 15,
    bands: [
      [0, 3, "Minimal relevant experience"],
      [4, 6, "Early-career relevant experience"],
      [7, 9, "Established professional experience"],
      [10, 12, "Senior managerial or specialist experience"],
      [13, 15, "Extensive senior executive or recognized specialist experience"],
    ],
  },
  {
    key: "k3",
    label: "Direct operational exposure",
    max: 15,
    bands: [
      [0, 3, "Theoretical or indirect exposure"],
      [4, 6, "Limited participation"],
      [7, 9, "Regular practical involvement"],
      [10, 12, "Direct responsibility for relevant operations"],
      [13, 15, "Extensive hands-on and decision-making responsibility"],
    ],
  },
  {
    key: "k4",
    label: "Evidence and credential verification",
    max: 15,
    bands: [
      [0, 3, "Major claims unsupported or inconsistent"],
      [4, 6, "Limited supporting evidence"],
      [7, 9, "Main professional history corroborated"],
      [10, 12, "Strong verification of relevant experience"],
      [13, 15, "Thoroughly corroborated record and material claims"],
    ],
  },
  {
    key: "k5",
    label: "Analytical ability and commercial understanding",
    max: 10,
    bands: [
      [0, 2, "Unstructured opinions"],
      [3, 4, "Basic understanding"],
      [5, 6, "Sound practical reasoning"],
      [7, 8, "Strong commercial and analytical understanding"],
      [9, 10, "Exceptional at explaining complex business dynamics"],
    ],
  },
  {
    key: "k6",
    label: "Communication and articulation",
    max: 10,
    bands: [
      [0, 2, "Difficult to understand or unstructured"],
      [3, 4, "Basic communication"],
      [5, 6, "Clear and understandable"],
      [7, 8, "Strong professional communicator"],
      [9, 10, "Explains complex issues precisely"],
    ],
  },
  {
    key: "k7",
    label: "Knowledge recency",
    max: 10,
    bands: [
      [0, 2, "Knowledge substantially outdated"],
      [3, 4, "Limited recent exposure"],
      [5, 6, "Relevant experience within the last 3 to 5 years"],
      [7, 8, "Direct exposure within the last 1 to 3 years"],
      [9, 10, "Current or very recent direct exposure"],
    ],
  },
  {
    key: "k8",
    label: "Professional reliability",
    max: 5,
    bands: [
      [0, 1, "Unreliable"],
      [2, 2, "Below expected standard"],
      [3, 3, "Meets professional expectations"],
      [4, 4, "Highly reliable"],
      [5, 5, "Consistently exceptional"],
    ],
  },
];

/** The 12-question screening interview: [question, what it assesses]. */
export const QUESTIONS: [string, string][] = [
  ["Walk me through your professional career and the responsibilities you personally held.", "Career authenticity"],
  ["Which industry or functional area do you understand most deeply?", "Primary expertise"],
  ["What specific business decisions have you personally made or influenced?", "Decision-making exposure"],
  ["Which operational processes have you personally managed?", "Practical knowledge"],
  ["Which companies, competitors or industry participants can you discuss from direct experience?", "Industry exposure"],
  ["What are the most important commercial drivers in your area of expertise?", "Commercial understanding"],
  ["What are the biggest challenges currently facing this industry?", "Industry awareness"],
  ["Which industry developments have materially changed over the last three years?", "Recency"],
  ["Which subjects would you decline to comment on because you lack sufficient knowledge?", "Intellectual honesty"],
  ["Can you distinguish between your direct experience, informed opinion and publicly available information?", "Analytical integrity"],
  ["Can you explain complex business matters to an investment professional or corporate executive?", "Communication"],
  ["Are there any employment, contractual, regulatory or other restrictions on your participation in paid consultations?", "Compliance eligibility"],
];

/** One compliance requirement. `naAllowed` items may be marked not applicable. */
export type Requirement = { key: string; label: string; detail: string; naAllowed: boolean };

const CORE: Requirement[] = [
  { key: "c1", label: "Identity", detail: "Verify identity", naAllowed: false },
  { key: "c2", label: "Employment restrictions", detail: "Disclose relevant contractual restrictions", naAllowed: false },
  { key: "c3", label: "Employer policies", detail: "Confirm outside consulting is permitted", naAllowed: false },
  { key: "c4", label: "Conflicts of interest", detail: "Disclose relevant conflicts", naAllowed: false },
  { key: "c5", label: "Confidentiality", detail: "Sign confidentiality obligations", naAllowed: false },
  { key: "c6", label: "Insider information", detail: "Agree not to disclose material non-public information", naAllowed: false },
  { key: "c7", label: "Trade secrets", detail: "Agree not to disclose proprietary or confidential information", naAllowed: false },
  { key: "c8", label: "Regulatory restrictions", detail: "Identify applicable industry restrictions", naAllowed: true },
  { key: "c9", label: "Sanctions and eligibility", detail: "Complete applicable legal screening", naAllowed: false },
  { key: "c10", label: "Professional licenses", detail: "Verify where relevant", naAllowed: true },
  { key: "c11", label: "Data protection", detail: "Privacy notice given and consent recorded", naAllowed: false },
  { key: "c12", label: "Consultation conduct", detail: "Accept the expert code of conduct", naAllowed: false },
];

const HEALTH: Requirement[] = [
  ["h1", "Patient confidentiality"],
  ["h2", "Protected health information"],
  ["h3", "Clinical trial confidentiality"],
  ["h4", "Unpublished clinical results"],
  ["h5", "Regulatory submission confidentiality"],
  ["h6", "Employer and sponsor restrictions"],
].map(([key, label]) => ({ key, label, detail: "Healthcare screening", naAllowed: true }));

const FINANCE: Requirement[] = [
  ["f1", "Material non-public information"],
  ["f2", "Restricted securities and issuers"],
  ["f3", "Investment banking confidentiality"],
  ["f4", "Client confidentiality"],
  ["f5", "Trading restrictions"],
  ["f6", "Employer policy on outside business activities"],
].map(([key, label]) => ({ key, label, detail: "Financial services screening", naAllowed: true }));

export const VERIFICATION_STATUSES = ["Verified", "Partially verified", "Self-declared", "Unverified", "Disputed", "Expired"];

export const MATCH_DIMS: Dimension[] = [
  { key: "m1", label: "Direct subject-matter relevance", max: 25 },
  { key: "m2", label: "Relevant functional experience", max: 20 },
  { key: "m3", label: "Relevant company or market exposure", max: 15 },
  { key: "m4", label: "Direct operational involvement", max: 15 },
  { key: "m5", label: "Knowledge recency", max: 10 },
  { key: "m6", label: "Geographic relevance", max: 5 },
  { key: "m7", label: "Ability to address client questions", max: 10 },
];

export const PERF_DIMS: Dimension[] = [
  { key: "p1", label: "Relevance to the client's questions", max: 25 },
  { key: "p2", label: "Depth of knowledge", max: 20 },
  { key: "p3", label: "Accuracy and credibility", max: 20 },
  { key: "p4", label: "Clarity of communication", max: 15 },
  { key: "p5", label: "Practical usefulness of insights", max: 10 },
  { key: "p6", label: "Professional conduct and punctuality", max: 10 },
];

export const FLAGS: [string, string][] = [
  ["complaint", "Client complaint"],
  ["missed", "Missed consultation"],
  ["inaccurate", "Inaccurate credentials"],
  ["compliance", "Compliance incident"],
  ["cantAnswer", "Could not answer the agreed questions"],
  ["cancelled", "Expert cancelled"],
];

export const SIGN_STAGES: [SignKey, string][] = [
  ["recruiter", "Recruiter"],
  ["verification", "Verification"],
  ["compliance", "Compliance"],
  ["quality", "Quality"],
];

/** [key, label, months between reviews] */
export const REVIEWS: [string, string, number][] = [
  ["contact", "Contact information", 12],
  ["employment", "Employment status", 6],
  ["expertise", "Expertise profile", 12],
  ["compliance", "Compliance declaration", 12],
  ["rate", "Consultation rate", 12],
];

/** The framework's proposed pilot funnel. Operating targets, not industry benchmarks. */
export const PILOT: [string, number][] = [
  ["Applications", 100],
  ["Screened", 75],
  ["Fully verified", 50],
  ["Compliance-cleared", 40],
  ["Qualified at 70+", 30],
  ["Qualified at 80+", 20],
];

/** Activity windows on the dashboard: [value in ?period=, label] */
export const PERIODS = [
  ["7", "Last 7 days"],
  ["30", "Last 30 days"],
  ["all", "All time"],
] as const;

export const STATUS_FILTERS: [string, string][] = [
  ["", "All statuses"],
  ["main", "Qualified: main network"],
  ["sel", "Qualified: selected projects"],
  ["pending", "Pending approval"],
  ["assess", "In assessment"],
  ["hold", "Hold"],
  ["rej", "Rejected"],
  ["inelig", "Not eligible"],
  ["susp", "Suspended"],
];

/* ───────────────────────── Scoring ───────────────────────── */

export function sumOf(vals: Record<string, number | null | undefined> | undefined, dims: Dimension[]) {
  let t = 0;
  let n = 0;
  for (const d of dims) {
    const v = vals?.[d.key];
    if (typeof v === "number") {
      t += v;
      n++;
    }
  }
  return { t, n, full: n === dims.length };
}

export const total = (e: Expert) => sumOf(e.score, SCORECARD);

export function tier(t: number): [string, string] {
  if (t >= 90) return ["Tier 1", "Distinguished expert"];
  if (t >= 80) return ["Tier 2", "Senior expert"];
  if (t >= 70) return ["Tier 3", "Qualified expert"];
  if (t >= 60) return ["Tier 4", "Developing"];
  return ["Below 60", "Unqualified"];
}

export function band(d: Dimension, v: number | null | undefined) {
  if (typeof v !== "number") return "Not scored";
  return d.bands?.find(([lo, hi]) => v >= lo && v <= hi)?.[2] ?? "";
}

/** Clamp a typed score to a dimension's range; blank clears it. */
export function clampScore(raw: unknown, max: number): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Math.round(Number(raw));
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(max, n));
}

/* ───────────────────────── Compliance ───────────────────────── */

/** Core checks for everyone, plus healthcare or financial screening by the expert's industries. */
export function requirementsFor(e: Expert): Requirement[] {
  const inds = [e.tax?.industry, e.tax?.industry2];
  return [
    ...CORE,
    ...(inds.includes(HEALTHCARE) ? HEALTH : []),
    ...(inds.some((x) => x && FINANCIAL.includes(x)) ? FINANCE : []),
  ];
}

export const ALL_REQUIREMENTS: Requirement[] = [...CORE, ...HEALTH, ...FINANCE];

export type ComplianceState = "cleared" | "incomplete" | "failed";

export function complianceState(e: Expert): ComplianceState {
  let fail = 0;
  let open = 0;
  for (const r of requirementsFor(e)) {
    const s = e.comp?.[r.key]?.s ?? "";
    if (s === "fail") fail++;
    else if (!(s === "pass" || (s === "na" && r.naAllowed))) open++;
  }
  return fail ? "failed" : open ? "incomplete" : "cleared";
}

export const complianceTone = (c: ComplianceState): Tone => (c === "cleared" ? "good" : c === "failed" ? "bad" : "warn");

/* ───────────────────────── Status and sign-offs ───────────────────────── */

export const disputedCount = (e: Expert) => (e.claims ?? []).filter((c) => c.status === "Disputed").length;
export const signOf = (e: Expert, k: SignKey) => e.signs?.[k];

export function screened(e: Expert) {
  const s = e.scr ?? {};
  return !!s.date && QUESTIONS.every((_, i) => (s.a?.[`q${i + 1}`] ?? "").trim().length > 0);
}

export type StatusCode = "susp" | "inelig" | "assess" | "rej" | "hold" | "pending" | "main" | "sel";
export type Status = { code: StatusCode; label: string; tone: Tone; reasons: string[] };

export function status(e: Expert): Status {
  const tt = total(e);
  const c = complianceState(e);
  if (e.susp?.on) return { code: "susp", label: "Suspended", tone: "bad", reasons: [e.susp.reason || "Suspended pending investigation"] };
  if (c === "failed")
    return { code: "inelig", label: "Not eligible", tone: "bad", reasons: ["A compliance requirement failed. The score cannot override it."] };
  if (!tt.full) return { code: "assess", label: "In assessment", tone: "mute", reasons: [] };
  if (tt.t < 60) return { code: "rej", label: "Rejected: below 60", tone: "bad", reasons: [] };
  if (tt.t < 70) return { code: "hold", label: "Hold for further assessment", tone: "warn", reasons: [] };

  const r: string[] = [];
  if (c !== "cleared") r.push("Compliance gate not cleared");
  if (!e.reg?.idOk) r.push("Identity not checked");
  if (disputedCount(e)) r.push("Disputed claim on the verification register");
  for (const [k, label] of SIGN_STAGES) if (signOf(e, k)?.d !== "approve") r.push(`${label} sign-off missing`);
  // An approval covers the score it was given on. If the score moved since, Quality approves again.
  const q = signOf(e, "quality");
  if (q?.d === "approve" && typeof q.total === "number" && q.total !== tt.t)
    r.push(`Score changed from ${q.total} to ${tt.t} since Quality approved it`);
  if (r.length) return { code: "pending", label: "Pending approval", tone: "warn", reasons: r };

  return tt.t >= 80
    ? { code: "main", label: "Qualified: main network", tone: "good", reasons: [] }
    : { code: "sel", label: "Qualified: selected projects", tone: "good", reasons: [] };
}

export const isQualified = (e: Expert) => {
  const c = status(e).code;
  return c === "main" || c === "sel";
};

const same = (a?: string, b?: string) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Why `operator` cannot approve stage `k` now, or "" if they can. */
export function cannotApprove(e: Expert, k: SignKey, operator: string): string {
  if (!operator) return "Sign-offs need a named operator.";
  if (k === "recruiter" && !screened(e)) return "Record the interview date and all 12 answers first.";
  if (k === "verification") {
    if (!e.reg?.idOk) return "Identity has not been checked.";
    if (!(e.claims ?? []).length) return "Add at least one claim to the register.";
    if (disputedCount(e)) return "Resolve disputed claims first.";
  }
  if (k === "compliance" && complianceState(e) !== "cleared") return "Every compliance requirement must pass first.";
  if (k === "quality") {
    const tt = total(e);
    const earlier: SignKey[] = ["recruiter", "verification", "compliance"];
    if (earlier.some((x) => signOf(e, x)?.d !== "approve")) return "The three earlier sign-offs must be approved first.";
    if (!tt.full || tt.t < 70) return "The score must be complete and 70 or above.";
    if (earlier.every((x) => same(signOf(e, x)?.by, operator)))
      return "A second person must sign at least one stage. Nobody approves an expert alone.";
  }
  return "";
}

/* ───────────────────────── Project match and performance ───────────────────────── */

export function matchVerdict(m: Match, e: Expert | undefined): [string, Tone] {
  const t = sumOf(m.d, MATCH_DIMS);
  if (m.conflict === "fail") return ["Blocked: conflict or eligibility failed", "bad"];
  if (!t.full) return ["Scoring incomplete", "mute"];
  if (!e || !isQualified(e)) return ["Blocked: expert is not qualified", "bad"];
  if (m.conflict !== "pass") return ["Needs the project conflict check", "warn"];
  if (t.t >= 80) return ["Shortlist", "good"];
  if (t.t >= 70)
    return m.adjacent ? ["Shortlist: client accepted adjacent expertise", "good"] : ["Only if the client accepts adjacent expertise", "warn"];
  return ["Do not shortlist", "bad"];
}

export function perfClass(t: number): [string, string, Tone] {
  if (t >= 90) return ["Exceptional", "Priority expert", "good"];
  if (t >= 80) return ["Strong", "Preferred expert", "good"];
  if (t >= 70) return ["Satisfactory", "Retain and monitor", "mute"];
  if (t >= 60) return ["Below standard", "Review and retrain where appropriate", "warn"];
  return ["Unsatisfactory", "Suspend pending investigation", "bad"];
}

export const evalTotal = (x: Evaluation) => sumOf(x.d, PERF_DIMS);
export const matchTotal = (m: Match) => sumOf(m.d, MATCH_DIMS);

/* ───────────────────────── Reviews ───────────────────────── */

export function addMonths(iso: string, months: number): Date | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + months);
  return d;
}

export function reviewsDue(e: Expert, now = new Date()) {
  return REVIEWS.filter(([key, , months]) => {
    const due = addMonths(e.reviews?.[key] || e.createdAt, months);
    return !!due && due < now;
  });
}

/* ───────────────────────── Counts for the register and dashboard ───────────────────────── */

export function counts(all: Expert[]) {
  const st = all.map(status);
  return {
    registered: all.length,
    screened: all.filter(screened).length,
    verified: all.filter((e) => signOf(e, "verification")?.d === "approve").length,
    cleared: all.filter((e) => complianceState(e) === "cleared" && signOf(e, "compliance")?.d === "approve").length,
    q70: st.filter((s) => s.code === "main" || s.code === "sel").length,
    q80: st.filter((s) => s.code === "main").length,
  };
}

export function averageScore(all: Expert[]): number | null {
  const full = all.map(total).filter((t) => t.full);
  return full.length ? Math.round(full.reduce((a, t) => a + t.t, 0) / full.length) : null;
}

export const displayName = (e: Expert) => e.reg?.displayName || e.reg?.legalName || "Unnamed expert";

export const CHECK_OPTIONS: [CheckResult, string][] = [
  ["", "Not checked"],
  ["pass", "Pass"],
  ["fail", "Fail"],
];
