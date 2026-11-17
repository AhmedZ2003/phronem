import { describe, expect, it } from "vitest";
import { SAMPLE_DATA } from "./seed";
import {
  cannotApprove,
  clampScore,
  complianceState,
  matchVerdict,
  requirementsFor,
  reviewsDue,
  status,
  tier,
  total,
} from "./rules";
import type { Expert } from "./types";

const sample = (id: string): Expert => structuredClone(SAMPLE_DATA.experts[id]);

/** A fully qualified file signed by two different operators. */
function qualified(): Expert {
  const e = sample("EX-SAMPLE1");
  e.signs = {
    recruiter: { d: "approve", by: "operator_1", at: "2026-11-10T10:00:00Z", total: 83 },
    verification: { d: "approve", by: "operator_2", at: "2026-11-10T11:00:00Z", total: 83 },
    compliance: { d: "approve", by: "operator_2", at: "2026-11-10T12:00:00Z", total: 83 },
    quality: { d: "approve", by: "operator_1", at: "2026-11-10T13:00:00Z", total: 83 },
  };
  return e;
}

describe("status", () => {
  it("qualifies a complete, cleared, fully signed file for the main network at 80+", () => {
    expect(status(qualified()).code).toBe("main");
  });

  it("lets a failed compliance item override any score", () => {
    const e = sample("EX-SAMPLE3");
    expect(total(e).t).toBe(91);
    expect(status(e).code).toBe("inelig");
  });

  it("keeps a part-scored file in assessment", () => {
    expect(status(sample("EX-SAMPLE2")).code).toBe("assess");
  });

  it("suspension wins over everything", () => {
    const e = qualified();
    e.susp = { on: true, reason: "Under investigation", by: "operator_1", at: "2026-11-11T00:00:00Z" };
    expect(status(e).code).toBe("susp");
  });

  it("blocks approval while a claim is disputed", () => {
    const e = qualified();
    e.claims[0].status = "Disputed";
    const st = status(e);
    expect(st.code).toBe("pending");
    expect(st.reasons).toContain("Disputed claim on the verification register");
  });

  it("asks for a new Quality approval when the score changed after it", () => {
    const e = qualified();
    e.score.k1 = 20; // 83 -> 86
    const st = status(e);
    expect(st.code).toBe("pending");
    expect(st.reasons.join(" ")).toContain("changed from 83 to 86");
  });

  it("holds 60 to 69 and rejects below 60", () => {
    const e = qualified();
    e.score = { k1: 12, k2: 9, k3: 9, k4: 9, k5: 6, k6: 6, k7: 6, k8: 3 }; // 60
    expect(status(e).code).toBe("hold");
    e.score.k8 = 2; // 59
    expect(status(e).code).toBe("rej");
  });
});

describe("sign-offs", () => {
  it("refuses Quality when one operator signed all three earlier stages", () => {
    const e = qualified();
    for (const k of ["recruiter", "verification", "compliance"] as const) e.signs[k]!.by = "operator_1";
    delete e.signs.quality;
    expect(cannotApprove(e, "quality", "operator_1")).toMatch(/second person/);
    expect(cannotApprove(e, "quality", "operator_2")).toBe("");
  });

  it("requires the interview before the Recruiter sign-off", () => {
    expect(cannotApprove(sample("EX-SAMPLE2"), "recruiter", "operator_1")).toMatch(/interview/);
  });

  it("requires a cleared gate before the Compliance sign-off", () => {
    expect(cannotApprove(sample("EX-SAMPLE3"), "compliance", "operator_1")).toMatch(/compliance requirement/);
  });
});

describe("compliance", () => {
  it("adds healthcare checks for healthcare experts and finance checks for banking experts", () => {
    expect(requirementsFor(sample("EX-SAMPLE1")).some((r) => r.key === "h1")).toBe(true);
    expect(requirementsFor(sample("EX-SAMPLE3")).some((r) => r.key === "f1")).toBe(true);
    expect(requirementsFor(sample("EX-SAMPLE2")).some((r) => r.key === "h1" || r.key === "f1")).toBe(false);
  });

  it("does not accept not applicable on a mandatory item", () => {
    const e = qualified();
    e.comp.c9 = { s: "na", n: "" };
    expect(complianceState(e)).toBe("incomplete");
  });
});

describe("project match", () => {
  const base = () => structuredClone(SAMPLE_DATA.matches["M-sample1"]);

  it("shortlists a qualified expert at 80+ with a passed conflict check", () => {
    expect(matchVerdict(base(), qualified())[0]).toBe("Shortlist");
  });

  it("blocks on a failed conflict check whatever the score", () => {
    const m = base();
    m.conflict = "fail";
    expect(matchVerdict(m, qualified())[1]).toBe("bad");
  });

  it("allows 70 to 79 only when the client accepted adjacent expertise", () => {
    const m = base();
    m.d.m1 = 15; // 89 -> 81
    m.d.m2 = 12; // -> 75
    expect(matchVerdict(m, qualified())[1]).toBe("warn");
    m.adjacent = true;
    expect(matchVerdict(m, qualified())[1]).toBe("good");
  });
});

describe("helpers", () => {
  it("clamps scores to the dimension's range and clears on blank", () => {
    expect(clampScore("25", 20)).toBe(20);
    expect(clampScore("-3", 20)).toBe(0);
    expect(clampScore("", 20)).toBeNull();
    expect(clampScore("abc", 20)).toBeNull();
  });

  it("maps totals to tiers", () => {
    expect(tier(92)[0]).toBe("Tier 1");
    expect(tier(80)[0]).toBe("Tier 2");
    expect(tier(70)[0]).toBe("Tier 3");
    expect(tier(65)[0]).toBe("Tier 4");
  });

  it("flags employment as due six months after the last review", () => {
    const e = qualified();
    e.createdAt = "2026-01-01T00:00:00Z";
    const due = reviewsDue(e, new Date("2026-08-01T00:00:00Z")).map((r) => r[0]);
    expect(due).toEqual(["employment"]);
  });
});
