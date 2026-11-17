"use client";

import { addRow, removeRow, setExpertField } from "@/app/operators/actions";
import { INDUSTRIES, VERIFICATION_STATUSES } from "@/lib/desk/rules";
import { RuleNote, Section, fmtDate } from "../ui";
import { useFile } from "./context";
import { Card, CheckField, SelectField, TextField, grid } from "./fields";

function useSetters() {
  const { bundle, run } = useFile();
  const id = bundle.expert.id;
  return {
    set: (path: string[], value: unknown) => run(() => setExpertField(id, path, value)),
    add: (rows: string) => run(() => addRow(id, rows)),
    remove: (rows: string, i: number) => run(() => removeRow(id, rows, i)),
  };
}

export function ProfilePane() {
  const { bundle, who } = useFile();
  const { set, add, remove } = useSetters();
  const e = bundle.expert;
  const r = e.reg ?? {};

  return (
    <>
      <Section title="Identification">
        <div className={grid}>
          <TextField label="Full legal name" value={r.legalName} onCommit={(v) => set(["reg", "legalName"], v)} />
          <TextField label="Professional display name" value={r.displayName} onCommit={(v) => set(["reg", "displayName"], v)} />
          <TextField label="Professional email" type="email" value={r.email} onCommit={(v) => set(["reg", "email"], v)} />
          <TextField label="Contact number" type="tel" value={r.phone} onCommit={(v) => set(["reg", "phone"], v)} />
          <TextField label="Country of residence" value={r.country} onCommit={(v) => set(["reg", "country"], v)} />
          <TextField label="Current city" value={r.city} onCommit={(v) => set(["reg", "city"], v)} />
          <TextField label="LinkedIn profile URL" type="url" value={r.linkedin} onCommit={(v) => set(["reg", "linkedin"], v)} />
          <TextField label="Professional website" type="url" value={r.website} onCommit={(v) => set(["reg", "website"], v)} />
          <TextField label="Consultation languages" value={r.languages} onCommit={(v) => set(["reg", "languages"], v)} />
          <TextField label="Where the CV is filed" hint="A folder or link. Don't paste the CV here." value={r.cvRef} onCommit={(v) => set(["reg", "cvRef"], v)} />
          <TextField label="Availability" value={r.availability} onCommit={(v) => set(["reg", "availability"], v)} />
          <TextField label="Rate stated by the expert" hint="Enter only what the expert named. Never suggest a figure." value={r.rate} onCommit={(v) => set(["reg", "rate"], v)} />
        </div>

        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <CheckField
            label="Government ID seen and matched to this person"
            checked={r.idOk}
            onCommit={(v) => set(["reg", "idOk"], v)}
            detail={r.idOk && r.idBy ? <span className="text-[12.5px] text-fg-3">Checked by {who(r.idBy)}, {fmtDate(r.idAt)}</span> : null}
          />
          <CheckField label="Email address verified" checked={r.emailOk} onCommit={(v) => set(["reg", "emailOk"], v)} />
          <CheckField label="Contact number verified" checked={r.phoneOk} onCommit={(v) => set(["reg", "phoneOk"], v)} />
          <CheckField
            label="Rate signed off"
            checked={r.rateOk}
            onCommit={(v) => set(["reg", "rateOk"], v)}
            detail={r.rateOk && r.rateBy ? <span className="text-[12.5px] text-fg-3">Signed off by {who(r.rateBy)}</span> : null}
          />
        </div>
        <RuleNote>Record that ID was checked. Never upload, copy or type an ID document or its number into this desk.</RuleNote>
      </Section>

      <Section title="Employment history" intro="Capture what the person did in their own role. The last four boxes on each position matter most.">
        {(e.jobs ?? []).map((j, i) => (
          <Card key={i} onRemove={() => remove("jobs", i)} removeLabel="Remove this position">
            <div className={grid}>
              <TextField label="Employer" value={j.employer} onCommit={(v) => set(["jobs", String(i), "employer"], v)} />
              <TextField label="Job title" value={j.title} onCommit={(v) => set(["jobs", String(i), "title"], v)} />
              <TextField label="Department or unit" value={j.unit} onCommit={(v) => set(["jobs", String(i), "unit"], v)} />
              <TextField label="Start" placeholder="For example, Mar 2019" value={j.start} onCommit={(v) => set(["jobs", String(i), "start"], v)} />
              <TextField label="End" placeholder="Blank if current" value={j.end} onCommit={(v) => set(["jobs", String(i), "end"], v)} />
              <TextField label="Country and geographic remit" value={j.geo} onCommit={(v) => set(["jobs", String(i), "geo"], v)} />
              <TextField label="Seniority or reporting level" value={j.seniority} onCommit={(v) => set(["jobs", String(i), "seniority"], v)} />
              <TextField label="Team size and budget or P&L" value={j.scope} onCommit={(v) => set(["jobs", String(i), "scope"], v)} className="lg:col-span-2" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField multiline rows={2} label="Main responsibilities and products handled" value={j.resp} onCommit={(v) => set(["jobs", String(i), "resp"], v)} />
              <TextField multiline rows={2} label="Major projects personally involved in" value={j.projects} onCommit={(v) => set(["jobs", String(i), "projects"], v)} />
              <TextField multiline rows={2} label="Decisions personally responsible for" value={j.decisions} onCommit={(v) => set(["jobs", String(i), "decisions"], v)} />
              <TextField multiline rows={2} label="Direct operational exposure" value={j.exposure} onCommit={(v) => set(["jobs", String(i), "exposure"], v)} />
            </div>
          </Card>
        ))}
        <div>
          <button type="button" className="desk-btn desk-btn--quiet" onClick={() => add("jobs")}>
            Add a position
          </button>
        </div>
      </Section>

      <Section title="Qualifications and licenses">
        {(e.quals ?? []).map((q, i) => (
          <Card key={i} onRemove={() => remove("quals", i)} removeLabel="Remove this qualification">
            <div className={grid}>
              <TextField label="Qualification, certification or license" value={q.qual} onCommit={(v) => set(["quals", String(i), "qual"], v)} />
              <TextField label="Institution or issuing body" value={q.inst} onCommit={(v) => set(["quals", String(i), "inst"], v)} />
              <TextField label="Year" value={q.year} onCommit={(v) => set(["quals", String(i), "year"], v)} />
              <SelectField label="Verification status" value={q.status || "Self-declared"} options={VERIFICATION_STATUSES} onCommit={(v) => set(["quals", String(i), "status"], v)} />
              <TextField label="Verification source and date" value={q.source} onCommit={(v) => set(["quals", String(i), "source"], v)} className="lg:col-span-2" />
            </div>
          </Card>
        ))}
        <div>
          <button type="button" className="desk-btn desk-btn--quiet" onClick={() => add("quals")}>
            Add a qualification
          </button>
        </div>
      </Section>
    </>
  );
}

export function ExpertisePane() {
  const { bundle } = useFile();
  const { set, add, remove } = useSetters();
  const e = bundle.expert;
  const t = e.tax ?? {};
  const industries: [string, string][] = [["", "Choose"], ...Object.keys(INDUSTRIES).map((i): [string, string] => [i, i])];

  return (
    <>
      <Section title="Classification">
        <div className={grid}>
          <SelectField label="Primary industry" value={t.industry} options={industries} onCommit={(v) => set(["tax", "industry"], v)} />
          <SelectField
            label="Subsector"
            value={t.subsector}
            options={[["", t.industry ? "Choose" : "Choose an industry first"], ...(INDUSTRIES[t.industry ?? ""] ?? []).map((s): [string, string] => [s, s])]}
            onCommit={(v) => set(["tax", "subsector"], v)}
            disabled={!t.industry || !(INDUSTRIES[t.industry] ?? []).length}
          />
          <SelectField label="Secondary industry" value={t.industry2} options={[["", "None"], ...industries.slice(1)]} onCommit={(v) => set(["tax", "industry2"], v)} />
          <TextField label="Functional expertise" placeholder="For example, market access, procurement" value={t.functional} onCommit={(v) => set(["tax", "functional"], v)} />
          <TextField label="Geographic expertise" value={t.geo} onCommit={(v) => set(["tax", "geo"], v)} />
          <TextField label="Companies worked for" value={t.companies} onCommit={(v) => set(["tax", "companies"], v)} />
          <TextField label="Customer segments understood" value={t.customers} onCommit={(v) => set(["tax", "customers"], v)} />
          <TextField label="Technical expertise" value={t.technical} onCommit={(v) => set(["tax", "technical"], v)} />
        </div>
        <RuleNote>Healthcare and financial-services industries add their own screening items to the compliance gate.</RuleNote>
      </Section>

      <Section title="Expertise areas" intro="One entry per subject the expert can be put forward for. Working at a company does not earn every tag that company touches.">
        {(e.areas ?? []).map((a, i) => (
          <Card key={i} onRemove={() => remove("areas", i)} removeLabel="Remove this area">
            <div className={grid}>
              <TextField label="Expertise area" value={a.area} onCommit={(v) => set(["areas", String(i), "area"], v)} />
              <TextField label="Years of exposure" value={a.years} onCommit={(v) => set(["areas", String(i), "years"], v)} />
              <SelectField
                label="Depth of involvement"
                value={a.depth}
                options={[["", "Choose"], "Direct", "Managerial", "Advisory", "Observational"]}
                onCommit={(v) => set(["areas", String(i), "depth"], v)}
              />
              <SelectField
                label="Last worked in it directly"
                value={a.recency}
                options={[["", "Choose"], "Current", "Within the last year", "1 to 3 years ago", "3 to 5 years ago", "More than 5 years ago"]}
                onCommit={(v) => set(["areas", String(i), "recency"], v)}
              />
              <TextField label="Evidence supporting the claim" value={a.evidence} onCommit={(v) => set(["areas", String(i), "evidence"], v)} className="lg:col-span-2" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                multiline
                rows={2}
                label="Decisions made or influenced, budgets and processes handled"
                value={a.authority}
                onCommit={(v) => set(["areas", String(i), "authority"], v)}
              />
              <TextField multiline rows={2} label="Specific questions they can confidently answer" value={a.questions} onCommit={(v) => set(["areas", String(i), "questions"], v)} />
            </div>
          </Card>
        ))}
        <div>
          <button type="button" className="desk-btn desk-btn--quiet" onClick={() => add("areas")}>
            Add an expertise area
          </button>
        </div>
      </Section>
    </>
  );
}
