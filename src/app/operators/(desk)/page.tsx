import type { Metadata } from "next";
import { operatorNames } from "@/lib/desk/accounts";
import { averageScore, complianceState, counts, displayName, reviewsDue, status, tier, total } from "@/lib/desk/rules";
import { readDesk } from "@/lib/desk/store";
import { requireOperator } from "@/lib/desk/session";
import { Figures } from "@/components/desk/ui";
import { RegisterTable, type RegisterRow } from "@/components/desk/RegisterTable";
import { removeSamples, createExpert } from "@/app/operators/actions";

export const metadata: Metadata = { title: "Expert register" };

export default async function RegisterPage() {
  await requireOperator();
  const [desk, names] = await Promise.all([readDesk(), operatorNames()]);
  const experts = Object.values(desk.experts);
  const c = counts(experts);
  const avg = averageScore(experts);
  const samples = experts.filter((e) => e.sample).length;

  const lastChange = new Map<string, { by: string; at: string }>();
  for (const a of desk.audit) {
    const prev = lastChange.get(a.expertId);
    if (!prev || a.at > prev.at) lastChange.set(a.expertId, { by: a.by, at: a.at });
  }

  const rows: RegisterRow[] = experts.map((e) => {
    const t = total(e);
    const st = status(e);
    const last = lastChange.get(e.id) ?? { by: e.createdBy, at: e.createdAt };
    return {
      id: e.id,
      name: displayName(e),
      sample: !!e.sample,
      industry: e.tax?.industry ?? "",
      subsector: e.tax?.subsector ?? "",
      search: [displayName(e), e.id, e.tax?.subsector, e.tax?.companies, e.tax?.functional].join(" ").toLowerCase(),
      score: t.full ? t.t : null,
      scored: t.n,
      tier: t.full ? tier(t.t)[0] : "",
      compliance: complianceState(e),
      status: { code: st.code, label: st.label, tone: st.tone },
      due: reviewsDue(e).length,
      lastBy: names[last.by] ?? last.by,
      lastAt: last.at,
    };
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <h1 className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-none tracking-[-0.045em]">Expert register</h1>
          <p className="mt-2.5 text-[15px] text-fg-2">One file per expert, from registration to the four sign-offs.</p>
        </div>
        {samples > 0 && (
          <form action={removeSamples} className="ml-auto">
            <button type="submit" className="desk-btn desk-btn--quiet">
              Remove {samples} sample {samples === 1 ? "record" : "records"}
            </button>
          </form>
        )}
      </div>

      <Figures
        items={[
          ["Registered", c.registered],
          ["Fully verified", c.verified],
          ["Compliance-cleared", c.cleared],
          ["Qualified 70+", c.q70],
          ["Qualified 80+", c.q80],
          ["Average score", avg ?? "None yet"],
        ]}
      />

      {rows.length ? (
        <RegisterTable rows={rows} />
      ) : (
        <div className="desk-panel flex flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-[20px] font-semibold tracking-[-0.03em]">No expert files yet</h2>
          <p className="max-w-[52ch] text-[14.5px] text-fg-2">
            Each expert gets one file: profile, screening interview, verification register, compliance gate, the 100-point
            scorecard and four sign-offs.
          </p>
          <form action={createExpert}>
            <button type="submit" className="desk-btn desk-btn--primary">
              Open the first expert file
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
