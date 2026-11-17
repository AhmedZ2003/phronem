"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarBlank } from "@phosphor-icons/react";
import { PERIODS } from "@/lib/desk/rules";

/** The dashboard's time window for activity counts, kept in the URL (?period=). */
export function PeriodSelect({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <label className="relative flex items-center">
      <span className="sr-only">Activity period</span>
      <CalendarBlank aria-hidden weight="bold" className="pointer-events-none absolute left-3.5 size-4 text-signal" />
      <select
        className="desk-input w-auto min-w-[170px] pl-10 font-semibold"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.set("period", e.target.value);
          router.replace(`?${next.toString()}`, { scroll: false });
        }}
      >
        {PERIODS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
