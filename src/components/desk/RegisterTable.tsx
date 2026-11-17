"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { INDUSTRIES, STATUS_FILTERS, complianceTone, type ComplianceState } from "@/lib/desk/rules";
import type { Tone } from "@/lib/desk/types";
import { Chip, fmtDate } from "./ui";

export type RegisterRow = {
  id: string;
  name: string;
  sample: boolean;
  industry: string;
  subsector: string;
  search: string;
  score: number | null;
  scored: number;
  tier: string;
  compliance: ComplianceState;
  status: { code: string; label: string; tone: Tone };
  due: number;
  lastBy: string;
  lastAt: string;
};

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Search and filter the register in the browser (the list is small), highest score first. */
export function RegisterTable({ rows }: { rows: RegisterRow[] }) {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("");
  const [st, setSt] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => (!needle || r.search.includes(needle)) && (!industry || r.industry === industry) && (!st || r.status.code === st))
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  }, [rows, q, industry, st]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <label htmlFor="register-q" className="text-[13px] font-semibold text-fg-2">
            Search
          </label>
          <div className="relative">
            <MagnifyingGlass aria-hidden weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-3" />
            <input
              id="register-q"
              className="desk-input pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, file number, subsector or company"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="register-industry" className="text-[13px] font-semibold text-fg-2">
            Industry
          </label>
          <select id="register-industry" className="desk-input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All industries</option>
            {Object.keys(INDUSTRIES).map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="register-status" className="text-[13px] font-semibold text-fg-2">
            Status
          </label>
          <select id="register-status" className="desk-input" value={st} onChange={(e) => setSt(e.target.value)}>
            {STATUS_FILTERS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="desk-panel overflow-x-auto">
        <table className="desk-table min-w-[920px]">
          <caption className="sr-only">Experts, highest score first</caption>
          <thead>
            <tr>
              <th scope="col">Expert</th>
              <th scope="col">Industry</th>
              <th scope="col">Score</th>
              <th scope="col">Compliance</th>
              <th scope="col">Status</th>
              <th scope="col">Reviews</th>
              <th scope="col">Last change</th>
            </tr>
          </thead>
          <tbody>
            {shown.length ? (
              shown.map((r) => (
                <tr key={r.id}>
                  <td className="min-w-[220px]">
                    <Link href={`/operators/experts/${r.id}`} className="font-semibold text-fg underline-offset-4 hover:underline">
                      {r.name}
                    </Link>
                    <div className="mt-0.5 font-mono text-[12px] text-fg-3">
                      {r.id}
                      {r.sample && <span className="ml-2 font-sans text-fg-3">sample record</span>}
                    </div>
                  </td>
                  <td>
                    <div className="text-[14px]">{r.industry || <span className="text-fg-3">Not classified</span>}</div>
                    <div className="text-[13px] text-fg-3">{r.subsector}</div>
                  </td>
                  <td className="whitespace-nowrap">
                    {r.score !== null ? (
                      <>
                        <span className="text-[17px] font-semibold tabular-nums">{r.score}</span>
                        <span className="ml-2 text-[13px] text-fg-3">{r.tier}</span>
                      </>
                    ) : (
                      <span className="text-[13.5px] text-fg-3">{r.scored} of 8 scored</span>
                    )}
                  </td>
                  <td>
                    <Chip tone={complianceTone(r.compliance)}>{capital(r.compliance)}</Chip>
                  </td>
                  <td>
                    <Chip tone={r.status.tone}>{r.status.label}</Chip>
                  </td>
                  <td className="whitespace-nowrap">
                    {r.due ? <Chip tone="warn">{r.due} due</Chip> : <span className="text-[13.5px] text-fg-3">Up to date</span>}
                  </td>
                  <td className="whitespace-nowrap text-[13.5px]">
                    <div className="font-semibold text-fg-2">{r.lastBy}</div>
                    <div className="text-fg-3">{fmtDate(r.lastAt)}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-fg-2">
                  No expert matches these filters.{" "}
                  <button
                    type="button"
                    className="desk-link"
                    onClick={() => {
                      setQ("");
                      setIndustry("");
                      setSt("");
                    }}
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
