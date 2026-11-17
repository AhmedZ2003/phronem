import { describe, expect, it } from "vitest";
import { milestones, type FileState } from "./milestones";
import { SAMPLE_DATA } from "./seed";

const state = (id: string): FileState => ({
  expert: structuredClone(SAMPLE_DATA.experts[id]),
  matches: Object.values(structuredClone(SAMPLE_DATA.matches)).filter((m) => m.expertId === id),
  evals: Object.values(structuredClone(SAMPLE_DATA.evals)).filter((x) => x.expertId === id),
});

describe("audit milestones", () => {
  it("logs nothing for a plain edit", () => {
    const a = state("EX-SAMPLE1");
    const b = structuredClone(a);
    b.expert.reg.city = "Leeds";
    b.expert.jobs[0].title = "Head of Market Access";
    b.expert.scr.a!.q1 = "Reworded answer.";
    expect(milestones(a, b)).toEqual([]);
  });

  it("logs a score result change, not the category edit", () => {
    const a = state("EX-SAMPLE1");
    const b = structuredClone(a);
    b.expert.score.k1 = 16;
    expect(milestones(a, b)).toEqual(["changed the score from 83 to 82", "status is now Pending approval"]);
  });

  it("logs the scorecard once it is complete", () => {
    const a = state("EX-SAMPLE2");
    const b = structuredClone(a);
    b.expert.score.k4 = 9;
    expect(milestones(a, b)).toEqual([]);
    const c = structuredClone(b);
    c.expert.score.k7 = 9;
    c.expert.score.k8 = 3;
    expect(milestones(b, c)).toEqual(["completed the scorecard: 74 / 100, Tier 3 (qualified expert)", "status is now Pending approval"]);
  });

  it("logs the compliance gate result, naming the failed requirement", () => {
    const a = state("EX-SAMPLE1");
    const b = structuredClone(a);
    b.expert.comp.c3 = { s: "fail", n: "" };
    expect(milestones(a, b)).toEqual(["failed the compliance gate on Employer policies", "status is now Not eligible"]);
  });

  it("logs a sign-off decision", () => {
    const a = state("EX-SAMPLE3");
    const b = structuredClone(a);
    b.expert.signs.recruiter = { d: "", by: "", at: "", total: null };
    expect(milestones(a, b)).toEqual(["reopened the Recruiter sign-off"]);
  });

  it("logs a project match outcome only when it is scored", () => {
    const a = state("EX-SAMPLE1");
    const b = structuredClone(a);
    b.matches[0].conflict = "fail";
    expect(milestones(a, b)).toEqual([
      'failed the conflict check for "Sample brief: UK oncology launch pricing"',
      'project match "Sample brief: UK oncology launch pricing": Blocked: conflict or eligibility failed (89 / 100)',
    ]);
  });

  it("logs a raised consultation flag", () => {
    const a = state("EX-SAMPLE1");
    const b = structuredClone(a);
    b.evals[0].flags.missed = true;
    expect(milestones(a, b)).toEqual(['flagged "Missed consultation" on "Sample brief: UK oncology launch pricing"']);
  });
});
