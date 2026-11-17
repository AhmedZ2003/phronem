/**
 * Record shapes for the expert qualification desk (/operators). They follow the EQIP Qualification
 * Desk's sample records one for one, so its JSON exports can be imported unchanged. On top of
 * those, every score, compliance result and claim status records the operator who set it.
 */

export type CheckResult = "" | "pass" | "fail" | "na";
export type Decision = "" | "approve" | "reject";
export type SignKey = "recruiter" | "verification" | "compliance" | "quality";

/** Who set a value and when. `by` is an operator username. */
export type Stamp = { by: string; at: string };

export type Registration = {
  legalName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  linkedin?: string;
  website?: string;
  languages?: string;
  cvRef?: string;
  availability?: string;
  rate?: string;
  idOk?: boolean;
  idBy?: string;
  idAt?: string;
  emailOk?: boolean;
  phoneOk?: boolean;
  rateOk?: boolean;
  rateBy?: string;
};

export type Job = {
  employer?: string;
  title?: string;
  unit?: string;
  start?: string;
  end?: string;
  geo?: string;
  seniority?: string;
  scope?: string;
  resp?: string;
  projects?: string;
  decisions?: string;
  exposure?: string;
};

export type Qualification = { qual?: string; inst?: string; year?: string; status?: string; source?: string };

export type Taxonomy = {
  industry?: string;
  subsector?: string;
  industry2?: string;
  functional?: string;
  geo?: string;
  companies?: string;
  customers?: string;
  technical?: string;
};

export type ExpertiseArea = {
  area?: string;
  years?: string;
  depth?: string;
  recency?: string;
  authority?: string;
  questions?: string;
  evidence?: string;
};

export type Screening = {
  date?: string;
  by?: string;
  a?: Record<string, string>;
  strengths?: string;
  limits?: string;
  toVerify?: string;
};

export type Claim = { claim?: string; status?: string; source?: string; date?: string; by?: string; at?: string };

export type ComplianceCheck = { s: CheckResult; n: string; by?: string; at?: string };

export type SignOff = { d: Decision; by: string; at: string; total: number | null; note?: string };

export type Suspension = { on: boolean; reason: string; by: string; at: string };

export type Expert = {
  id: string;
  sample?: boolean;
  createdAt: string;
  createdBy: string;
  reg: Registration;
  jobs: Job[];
  quals: Qualification[];
  tax: Taxonomy;
  areas: ExpertiseArea[];
  scr: Screening;
  comp: Record<string, ComplianceCheck>;
  claims: Claim[];
  score: Record<string, number | null>;
  /** Who gave each scorecard dimension its current value. */
  scoreBy?: Record<string, Stamp>;
  signs: Partial<Record<SignKey, SignOff>>;
  reviews: Record<string, string>;
  susp?: Suspension;
};

export type Match = {
  id: string;
  expertId: string;
  project: string;
  need: string;
  d: Record<string, number | null>;
  dBy?: Record<string, Stamp>;
  conflict: CheckResult;
  conflictBy?: Stamp;
  note: string;
  adjacent: boolean;
  at: string;
  by: string;
};

export type Evaluation = {
  id: string;
  expertId: string;
  project: string;
  date: string;
  d: Record<string, number | null>;
  dBy?: Record<string, Stamp>;
  flags: Record<string, boolean>;
  note: string;
  at: string;
  by: string;
};

export type AuditEntry = { expertId: string; at: string; by: string; action: string };

export type DeskData = {
  experts: Record<string, Expert>;
  matches: Record<string, Match>;
  evals: Record<string, Evaluation>;
  audit: AuditEntry[];
};

/** Everything the expert file screen needs for one expert. */
export type ExpertBundle = {
  expert: Expert;
  matches: Match[];
  evals: Evaluation[];
  audit: AuditEntry[];
  /** Operator usernames mentioned in the bundle, mapped to display names. */
  names: Record<string, string>;
};

/** A signed-in operator, as the screens see them. */
export type Operator = { username: string; name: string };

/** A stored operator account. The password is kept only as a scrypt hash. */
export type OperatorAccount = {
  username: string;
  name: string;
  salt: string;
  hash: string;
  active: boolean;
  createdAt: string;
};

export type Tone = "good" | "warn" | "bad" | "mute";
