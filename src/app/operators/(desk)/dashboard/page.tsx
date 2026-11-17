import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FolderSimplePlus,
  Gauge,
  HourglassMedium,
  SealCheck,
  ShieldCheck,
  Stamp,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { createExpert } from "@/app/operators/actions";
import { listAccounts } from "@/lib/desk/accounts";
import {
  INDUSTRIES,
  PERIODS,
  PILOT,
  averageScore,
  counts,
  displayName,
  evalTotal,
  matchVerdict,
  reviewsDue,
  status,
} from "@/lib/desk/rules";
import { readDesk } from "@/lib/desk/store";
import { requireOperator } from "@/lib/desk/session";
import { Chip, Section, fmtDate } from "@/components/desk/ui";
import { Monogram } from "@/components/desk/DeskShell";
import { Sparkline } from "@/components/desk/Sparkline";
import { PeriodSelect } from "@/components/desk/PeriodSelect";
import { Emblem } from "@/components/visuals/Emblem";
import type { AuditEntry, Expert, Tone } from "@/lib/desk/types";

export const metadata: Metadata = { title: "Dashboard" };

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "None yet");

/** What an audit milestone records (wording from src/lib/desk/milestones.ts). */
function kind(action: string) {
  if (action === "opened the expert file") return "opened";
  if (/^(completed the scorecard|changed the score|rated the consultation|changed the rating)/.test(action)) return "scores";
  if (/^(cleared|failed) the compliance gate|^(passed|failed) the conflict check|^confirmed the expert's identity/.test(action)) return "checks";
  if (/^(approved|rejected|reopened) the .* sign-off/.test(action)) return "signoffs";
  return "other";
}

function tally(lines: AuditEntry[]) {
  const k = lines.map((l) => kind(l.action));
  return {
    opened: k.filter((x) => x === "opened").length,
    scores: k.filter((x) => x === "scores").length,
    checks: k.filter((x) => x === "checks").length,
    signoffs: k.filter((x) => x === "signoffs").length,
    last: lines.reduce((m, x) => (x.at > m ? x.at : m), ""),
  };
}

type Attention = { e: Expert; reason: string; tone: Tone; label: string; section: string };

/** Files that need someone: pending decisions first, then holds, then overdue reviews. */
function attention(experts: Expert[]): Attention[] {
  const out: Attention[] = [];
  for (const e of experts) {
    const st = status(e);
    if (st.code === "pending") out.push({ e, reason: st.reasons[0], tone: "warn", label: "Decision needed", section: "scorecard" });
    else if (st.code === "hold") out.push({ e, reason: "Scored 60 to 69: assess further", tone: "warn", label: "On hold", section: "scorecard" });
    else {
      const due = reviewsDue(e);
      if (due.length) out.push({ e, reason: `${due.map((r) => r[1]).join(", ")} review due`, tone: "mute", label: "Review due", section: "upkeep" });
    }
  }
  const rank = { "Decision needed": 0, "On hold": 1, "Review due": 2 } as Record<string, number>;
  return out.sort((a, b) => rank[a.label] - rank[b.label] || b.e.createdAt.localeCompare(a.e.createdAt));
}

type Props = { searchParams: Promise<{ period?: string }> };

/** ISO start of the activity window, or "" for all time. Read per request. */
function periodStart(period: string) {
  return period === "all" ? "" : new Date(Date.now() - Number(period) * 86_400_000).toISOString();
}

/** Experts registered in each of the last `weeks` weeks, oldest first, with week labels. */
function weeklyRegistrations(experts: Expert[], weeks = 12) {
  const now = Date.now();
  const week = 7 * 86_400_000;
  const values = Array.from({ length: weeks }, () => 0);
  for (const e of experts) {
    const age = now - new Date(e.createdAt).getTime();
    const i = weeks - 1 - Math.floor(age / week);
    if (i >= 0 && i < weeks) values[i]++;
  }
  const labels = values.map((_, i) => `Week of ${fmtDate(new Date(now - (weeks - 1 - i) * week - 6 * 86_400_000).toISOString())}`);
  return { values, labels };
}

const tint = (hue: string) => ({ "--hue": hue }) as React.CSSProperties;
const initialsOf = (name: string) =>
  name
    .replace(/^Sample:\s*/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export default async function DashboardPage({ searchParams }: Props) {
  const operator = await requireOperator();
  const { period: rawPeriod } = await searchParams;
  const period = PERIODS.some(([v]) => v === rawPeriod) ? rawPeriod! : "30";
  const periodLabel = PERIODS.find(([v]) => v === period)![1].toLowerCase();
  const since = periodStart(period);

  const [desk, accounts] = await Promise.all([readDesk(), listAccounts()]);
  const experts = Object.values(desk.experts);
  const c = counts(experts);
  const funnel = [c.registered, c.screened, c.verified, c.cleared, c.q70, c.q80];
  const evals = Object.values(desk.evals);
  const matches = Object.values(desk.matches);
  const evalTotals = evals.map(evalTotal).filter((t) => t.full);
  const shortlisted = matches.filter((m) => matchVerdict(m, desk.experts[m.expertId])[1] === "good").length;
  const samples = experts.filter((e) => e.sample).length;
  const avg = averageScore(experts);
  const queue = attention(experts);
  const pending = queue.filter((q) => q.label === "Decision needed");
  const weekly = weeklyRegistrations(experts);
  const newInPeriod = experts.filter((e) => !since || e.createdAt >= since).length;
  const statuses = experts.map((e) => status(e).code);
  const pipeline = [
    { label: "Qualified", hue: "var(--st-ok-rgb)", n: statuses.filter((s) => s === "main" || s === "sel").length },
    { label: "Waiting for a decision", hue: "var(--st-wait-rgb)", n: statuses.filter((s) => s === "pending" || s === "hold").length },
    { label: "In assessment", hue: "var(--st-assess-rgb)", n: statuses.filter((s) => s === "assess").length },
    { label: "Not eligible or rejected", hue: "var(--st-out-rgb)", n: statuses.filter((s) => s === "inelig" || s === "rej" || s === "susp").length },
  ];
  const oldestWaiting = pending.reduce((m, q) => (!m || q.e.createdAt < m ? q.e.createdAt : m), "");

  const inPeriod = desk.audit.filter((a) => !since || a.at >= since);
  const mine = tally(inPeriod.filter((a) => a.by === operator.username));
  const team = accounts.map((a) => ({ ...a, ...tally(inPeriod.filter((x) => x.by === a.username)) }));
  const target80 = PILOT[PILOT.length - 1][1];

  const industries = [...Object.keys(INDUSTRIES), ""]
    .map((i) => {
      const group = experts.filter((e) => (e.tax?.industry ?? "") === i);
      return { i, group, k: counts(group), avg: averageScore(group) };
    })
    .filter((x) => x.group.length);

  const work: { Icon: typeof Gauge; label: string; detail: string; value: number; hue: string }[] = [
    { Icon: FolderSimplePlus, label: "Files opened", detail: "New experts registered", value: mine.opened, hue: "var(--accent-rgb)" },
    { Icon: Gauge, label: "Scorecards", detail: "Completed or rescored", value: mine.scores, hue: "var(--icon-violet-rgb)" },
    { Icon: ShieldCheck, label: "Clearances", detail: "Identity, compliance and conflict checks", value: mine.checks, hue: "var(--st-ok-rgb)" },
    { Icon: Stamp, label: "Sign-offs", detail: "Approved, rejected or reopened", value: mine.signoffs, hue: "var(--icon-orchid-rgb)" },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[clamp(2rem,3.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.045em]">
            Welcome, <span className="text-signal">{operator.name}</span>
          </h1>
          <p className="mt-2.5 text-[15px] text-fg-2">
            {samples
              ? `${samples} sample ${samples === 1 ? "record is" : "records are"} counted below. Remove them from the register before the pilot starts.`
              : "Where the network stands today, and what is waiting for you."}
          </p>
        </div>
        <div className="ml-auto">
          <PeriodSelect value={period} />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(290px,340px)_minmax(0,1fr)]">
        {/* The operator's own card, in the place of the reference's profile and rank card */}
        <div className="flex flex-col gap-6">
        <section aria-labelledby="me-title" className="desk-panel desk-panel--edge flex flex-col overflow-hidden px-6 pb-6">
          <div aria-hidden className="card-hero -mx-6">
            <Emblem className="spin-slow absolute left-1/2 top-[-56px] size-[220px] -translate-x-1/2 text-signal-2 opacity-35" />
          </div>
          <div className="-mt-[52px] flex flex-col items-center text-center">
            <span className="relative grid size-[104px] place-items-center rounded-full bg-[var(--color-ink-2)]">
              <span aria-hidden className="absolute inset-0 rounded-full border-2 border-[rgb(var(--accent-rgb)/0.55)]" />
              <span aria-hidden className="absolute inset-[8px] rounded-full border border-dashed border-[rgb(var(--accent-rgb)/0.4)]" />
              <Monogram name={operator.name} className="relative size-[64px] rounded-[20px] text-[20px] shadow-[0_10px_30px_-8px_rgb(var(--violet-rgb)/0.8)]" />
            </span>
            <Chip tone="mute" className="mt-4">
              Operator
            </Chip>
            <h2 id="me-title" className="mt-3 text-[20px] font-semibold tracking-[-0.03em]">
              {operator.name}
            </h2>
            <p className="font-mono text-[12px] text-fg-3">{operator.username}</p>
          </div>

          <h3 className="mt-7 text-[14px] font-semibold text-fg-2">Your work, {periodLabel}</h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {work.map(({ Icon, label, detail, value, hue }) => (
              <li key={label} className="flex items-center gap-3 rounded-[16px] border border-line bg-[rgb(var(--fg-rgb)/0.025)] p-3">
                <span className="icon-tile size-10" style={tint(hue)}>
                  <Icon aria-hidden weight="duotone" className="size-5" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[14.5px] font-semibold">{label}</span>
                  <span className="block text-[12.5px] text-fg-3">{detail}</span>
                </span>
                <span className="text-[20px] font-semibold tabular-nums tracking-[-0.03em]">{value}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
              <span className="text-fg-2">Pilot target: qualified at 80+</span>
              <span className="tabular-nums">
                <span className="font-semibold">{c.q80}</span>
                <span className="text-fg-3"> of {target80}</span>
              </span>
            </div>
            <div className="meter mt-2.5" role="img" aria-label={`${c.q80} of ${target80}`}>
              <i style={{ width: `${Math.min(100, (c.q80 / target80) * 100)}%` }} />
            </div>
            <p className="mt-3 text-[12.5px] text-fg-3">{mine.last ? `Last active ${fmtDate(mine.last)}` : `No recorded work ${periodLabel === "all time" ? "yet" : `in the ${periodLabel}`}`}</p>
          </div>
        </section>

        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {/* Three figures, as the reference's earnings cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Registered: with the weekly trend */}
            <div className="desk-panel stat-tile flex flex-col gap-4 p-5" style={tint("var(--accent-rgb)")}>
              <div className="flex items-start justify-between gap-3">
                <span className="icon-tile">
                  <UsersThree aria-hidden weight="duotone" className="size-[22px]" />
                </span>
                <Sparkline
                  values={weekly.values}
                  labels={weekly.labels}
                  summary={`Experts registered per week, last 12 weeks: ${weekly.values.join(", ")}`}
                  className="h-10 w-[120px]"
                />
              </div>
              <div>
                <p className="text-[13.5px] text-fg-2">Experts registered</p>
                <p className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{c.registered}</p>
                <p className="mt-2 text-[13px] text-fg-3">
                  <span className="font-semibold text-signal">+{newInPeriod}</span> {period === "all" ? "since the start" : `in the ${periodLabel}`}
                </p>
              </div>
            </div>

            {/* Qualified: with its share of the register */}
            <div className="desk-panel stat-tile flex flex-col gap-4 p-5" style={tint("var(--st-ok-rgb)")}>
              <span className="icon-tile">
                <SealCheck aria-hidden weight="duotone" className="size-[22px]" />
              </span>
              <div>
                <p className="text-[13.5px] text-fg-2">Qualified 70+</p>
                <p className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{c.q70}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[rgb(var(--st-ok-rgb)/0.18)]" role="img" aria-label={`${pct(c.q70, c.registered)} of the register`}>
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[rgb(var(--st-ok-rgb))]" style={{ width: `${c.registered ? (c.q70 / c.registered) * 100 : 0}%` }} />
                  </span>
                  <span className="text-[13px] tabular-nums text-fg-3">{pct(c.q70, c.registered)}</span>
                </div>
              </div>
            </div>

            {/* Waiting: and for how long */}
            <div className="desk-panel stat-tile flex flex-col gap-4 p-5" style={tint("var(--st-wait-rgb)")}>
              <span className="icon-tile">
                <HourglassMedium aria-hidden weight="duotone" className="size-[22px]" />
              </span>
              <div>
                <p className="text-[13.5px] text-fg-2">Waiting for a decision</p>
                <p className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{pending.length}</p>
                <p className="mt-2 text-[13px] text-fg-3">{oldestWaiting ? `Oldest opened ${new Date(oldestWaiting).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "Nothing waiting"}</p>
              </div>
            </div>
          </div>

          {/* The banner: the next thing that needs doing, over the site's nebula */}
          <div className="desk-banner flex min-h-[230px] items-center p-7 sm:p-9">
            <div aria-hidden className="pointer-events-none absolute -right-28 top-1/2 size-[320px] -translate-y-1/2 opacity-40 sm:-right-20 sm:opacity-60 2xl:-right-6">
              <Emblem className="spin-slow size-full text-signal-2" />
            </div>
            <div className="relative max-w-[22rem] lg:max-w-[24rem]">
              {pending.length ? (
                <>
                  <h2 className="text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-[1.1] tracking-[-0.04em]">
                    {pending.length} {pending.length === 1 ? "file is" : "files are"} waiting for a decision
                  </h2>
                  <p className="mt-3 text-[15px] text-fg-2">
                    {displayName(pending[0].e)}: {pending[0].reason.charAt(0).toLowerCase() + pending[0].reason.slice(1)}.
                  </p>
                  <Link href={`/operators/experts/${pending[0].e.id}?section=${pending[0].section}`} className="desk-btn desk-btn--primary mt-6">
                    Open the file
                    <ArrowRight aria-hidden weight="bold" className="size-4" />
                  </Link>
                </>
              ) : experts.length ? (
                <>
                  <h2 className="text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-[1.1] tracking-[-0.04em]">No decisions are waiting</h2>
                  <p className="mt-3 text-[15px] text-fg-2">
                    {c.q80} of {target80} experts are qualified at 80+ for the pilot. Register the next expert to keep the network growing.
                  </p>
                  <Link href="/operators" className="desk-btn desk-btn--primary mt-6">
                    Open the register
                    <ArrowRight aria-hidden weight="bold" className="size-4" />
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-[1.1] tracking-[-0.04em]">Start the register</h2>
                  <p className="mt-3 text-[15px] text-fg-2">Open a file for the first expert: profile, screening, verification, compliance and the scorecard.</p>
                  <form action={createExpert}>
                    <button type="submit" className="desk-btn desk-btn--primary mt-6">
                      Open the first file
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Needs attention, as the reference's list of events */}
          <Section
            title="Needs attention"
            aside={queue.length > 5 ? <Link href="/operators" className="desk-link text-[14px]">View all {queue.length} in the register</Link> : null}
          >
            {queue.length ? (
              <ul className="-mt-1 flex flex-col">
                {queue.slice(0, 5).map((q) => (
                  <li key={q.e.id} className="border-t border-line first:border-t-0">
                    <Link
                      href={`/operators/experts/${q.e.id}?section=${q.section}`}
                      className="group -mx-3 flex items-center gap-4 rounded-[14px] px-3 py-3.5 transition-colors hover:bg-[rgb(var(--fg-rgb)/0.035)]"
                    >
                      <span
                        aria-hidden
                        className="icon-tile size-11 text-[13px] font-bold tracking-[-0.02em]"
                        style={tint(q.tone === "warn" ? "var(--st-wait-rgb)" : "var(--st-assess-rgb)")}
                      >
                        {initialsOf(displayName(q.e))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold group-hover:underline">{displayName(q.e)}</span>
                        <span className="block truncate text-[13px] text-fg-2">{q.reason}</span>
                      </span>
                      <span className="hidden text-right text-[13px] text-fg-3 sm:block">
                        Opened
                        <span className="block text-fg-2">{fmtDate(q.e.createdAt)}</span>
                      </span>
                      <Chip tone={q.tone} className="hidden md:inline-flex">
                        {q.label}
                      </Chip>
                      <ArrowRight aria-hidden weight="bold" className="size-4 shrink-0 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 text-[14.5px] text-fg-2">
                <SealCheck aria-hidden weight="duotone" className="size-5 text-signal" />
                Nothing is waiting. Every file is decided and inside its review period.
              </p>
            )}
          </Section>

          {/* One whole split into parts: every expert in the register by where they stand */}
          <section aria-labelledby="pipeline-title" className="desk-panel p-5 sm:p-7">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="pipeline-title" className="text-[18px] font-semibold tracking-[-0.025em]">
                Where every expert stands
              </h2>
              <span className="text-[13px] text-fg-3">{experts.length} in the register</span>
            </div>
            {experts.length ? (
              <>
                <div
                  className="seg-bar mt-4"
                  role="img"
                  aria-label={pipeline.map((p) => `${p.label} ${p.n}`).join(", ")}
                >
                  {pipeline
                    .filter((p) => p.n > 0)
                    .map((p) => (
                      <span key={p.label} style={{ ...tint(p.hue), flexGrow: p.n }} title={`${p.label}: ${p.n} (${Math.round((p.n / experts.length) * 100)}%)`} />
                    ))}
                </div>
                <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {pipeline.map((p) => (
                    <li key={p.label} className="flex items-center gap-3 text-[14px]">
                      <span className="legend-dot" style={tint(p.hue)} aria-hidden />
                      <span className="min-w-0 flex-1 text-fg-2">{p.label}</span>
                      <span className="font-semibold tabular-nums">{p.n}</span>
                      <span className="w-11 text-right text-[13px] tabular-nums text-fg-3">{Math.round((p.n / experts.length) * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-[14px] text-fg-2">Experts appear here once the first file is opened.</p>
            )}
          </section>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Section title="Pilot qualification exercise" intro="Counts against the framework's proposed pilot targets. Targets, not industry benchmarks.">
          <ol className="flex flex-col gap-4">
            {PILOT.map(([label, target], i) => (
              <li key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2">
                <span className="text-[14.5px]">{label}</span>
                <span className="text-[14px] tabular-nums text-fg-2">
                  <span className="font-semibold text-fg">{funnel[i]}</span> of {target}
                </span>
                <div className="meter col-span-2" role="img" aria-label={`${funnel[i]} of ${target}`}>
                  <i style={{ width: `${Math.min(100, (funnel[i] / target) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Network quality">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line">
            {(
              [
                ["Application to approval", pct(c.q70, c.registered)],
                ["Project match success", pct(shortlisted, matches.length)],
                ["Consultations evaluated", evals.length],
                ["Average performance", evalTotals.length ? Math.round(evalTotals.reduce((a, t) => a + t.t, 0) / evalTotals.length) : "None yet"],
                ["Expert cancellation rate", pct(evals.filter((x) => x.flags?.cancelled).length, evals.length)],
                ["Average quality score", avg ?? "None yet"],
              ] as [string, string | number][]
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1.5 bg-ink-2 px-4 py-4">
                <dt className="order-2 text-[13px] text-fg-2">{label}</dt>
                <dd className="order-1 text-[24px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section className="lg:col-span-2" title="Operator activity" intro={`Scorecards, clearances and sign-offs per operator, ${periodLabel}.`}>
          <div className="-mx-5 overflow-x-auto sm:-mx-7">
            <table className="desk-table min-w-[520px]">
              <thead>
                <tr>
                  <th scope="col" className="pl-5 sm:pl-7">Operator</th>
                  <th scope="col">Scorecards</th>
                  <th scope="col">Clearances</th>
                  <th scope="col">Sign-offs</th>
                  <th scope="col" className="pr-5 sm:pr-7">Last active</th>
                </tr>
              </thead>
              <tbody>
                {team.map((a) => (
                  <tr key={a.username}>
                    <td className="pl-5 sm:pl-7">
                      <div className="flex items-center gap-3">
                        <Monogram name={a.name} className="size-9 rounded-[11px] text-[12px]" />
                        <div>
                          <div className="font-semibold">{a.name}</div>
                          <div className="font-mono text-[12px] text-fg-3">
                            {a.username}
                            {!a.active && <span className="ml-2 font-sans">disabled</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="tabular-nums">{a.scores}</td>
                    <td className="tabular-nums">{a.checks}</td>
                    <td className="tabular-nums">{a.signoffs}</td>
                    <td className="pr-5 text-[13.5px] text-fg-2 sm:pr-7">{a.last ? fmtDate(a.last) : "No activity"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section className="lg:col-span-2" title="Coverage by industry" intro="Where the network is deep and where it is thin.">
          <div className="-mx-5 overflow-x-auto sm:-mx-7">
            <table className="desk-table min-w-[520px]">
              <thead>
                <tr>
                  <th scope="col" className="pl-5 sm:pl-7">Industry</th>
                  <th scope="col">Registered</th>
                  <th scope="col">Cleared</th>
                  <th scope="col">70+</th>
                  <th scope="col" className="pr-5 sm:pr-7">80+</th>
                </tr>
              </thead>
              <tbody>
                {industries.length ? (
                  industries.map(({ i, k }) => (
                    <tr key={i || "none"}>
                      <td className="pl-5 font-semibold sm:pl-7">{i || "Not classified"}</td>
                      <td className="tabular-nums">{k.registered}</td>
                      <td className="tabular-nums">{k.cleared}</td>
                      <td className="tabular-nums">{k.q70}</td>
                      <td className="pr-5 tabular-nums sm:pr-7">{k.q80}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-fg-2">
                      No experts registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

    </div>
  );
}
