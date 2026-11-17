"use client";

import { useId, useState } from "react";
import { band, type Dimension } from "@/lib/desk/rules";
import type { Stamp } from "@/lib/desk/types";
import { cn } from "@/lib/cn";
import { fmtDate } from "../ui";
import { useFile } from "./context";

/*
 * Form fields that save themselves: text saves when the field loses focus (or on Enter in a
 * one-line field), selects and checkboxes save on change. Each keeps the operator's draft while
 * they type and takes the saved value back from the server once they leave the field.
 */

type TextProps = {
  label: string;
  value?: string | null;
  onCommit: (v: string) => void;
  hint?: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "date";
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
};

function useDraft(value: string) {
  const [draft, setDraft] = useState(value);
  const [base, setBase] = useState(value);
  const [editing, setEditing] = useState(false);
  // Take a new saved value from the server unless the operator is in the middle of typing.
  if (!editing && value !== base) {
    setBase(value);
    setDraft(value);
  }
  return { draft, setDraft, base, editing, setEditing };
}

export function TextField({ label, value, onCommit, hint, placeholder, type = "text", multiline, rows = 3, disabled, className }: TextProps) {
  const id = useId();
  const v = value ?? "";
  const { draft, setDraft, base, setEditing } = useDraft(v);
  const commit = () => {
    setEditing(false);
    if (draft.trim() !== base.trim()) onCommit(draft);
  };
  const common = {
    id,
    className: "desk-input",
    value: draft,
    placeholder,
    disabled,
    "aria-describedby": hint ? `${id}-hint` : undefined,
    onFocus: () => setEditing(true),
    onBlur: commit,
  };
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-fg-2">
        {label}
      </label>
      {multiline ? (
        <textarea {...common} rows={rows} onChange={(e) => setDraft(e.target.value)} />
      ) : (
        <input
          {...common}
          type={type}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-[12.5px] text-fg-3">
          {hint}
        </p>
      )}
    </div>
  );
}

type Option = string | [string, string];

export function SelectField({
  label,
  value,
  options,
  onCommit,
  className,
  disabled,
}: {
  label: string;
  value?: string | null;
  options: Option[];
  onCommit: (v: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-fg-2">
        {label}
      </label>
      <select id={id} className="desk-input" value={value ?? ""} disabled={disabled} onChange={(e) => onCommit(e.target.value)}>
        {options.map((o) => {
          const [val, text] = Array.isArray(o) ? o : [o, o];
          return (
            <option key={val} value={val}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function CheckField({
  label,
  checked,
  onCommit,
  disabled,
  detail,
}: {
  label: string;
  checked?: boolean;
  onCommit: (v: boolean) => void;
  disabled?: boolean;
  detail?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" className="desk-check" checked={!!checked} disabled={disabled} onChange={(e) => onCommit(e.target.checked)} />
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[14.5px] leading-snug">
          {label}
        </label>
        {detail && <div className="mt-0.5">{detail}</div>}
      </div>
    </div>
  );
}

/** One scored dimension: label, the 0..max input, the band its value falls in, and who scored it. */
export function ScoreRow({
  dim,
  value,
  stamp,
  onCommit,
}: {
  dim: Dimension;
  value?: number | null;
  stamp?: Stamp;
  onCommit: (v: string) => void;
}) {
  const id = useId();
  const { who } = useFile();
  const v = value === null || value === undefined ? "" : String(value);
  const { draft, setDraft, base, setEditing } = useDraft(v);
  const commit = () => {
    setEditing(false);
    if (draft !== base) onCommit(draft);
  };
  const filled = typeof value === "number" ? value / dim.max : 0;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-x-5 gap-y-1.5 border-b border-line py-4 last:border-b-0">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[14.5px] font-semibold">
          {dim.label}
        </label>
        <span className="ml-2 font-mono text-[12px] text-fg-3">out of {dim.max}</span>
      </div>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={dim.max}
        step={1}
        className="desk-input desk-input--score"
        value={draft}
        aria-describedby={`${id}-band`}
        onFocus={() => setEditing(true)}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      <div id={`${id}-band`} className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex h-1 w-24 overflow-hidden rounded-full bg-[rgb(var(--fg-rgb)/0.07)]" aria-hidden>
          <span className="h-full rounded-full bg-signal" style={{ width: `${filled * 100}%` }} />
        </span>
        {dim.bands && <span className="text-[13px] text-fg-2">{band(dim, value)}</span>}
        {stamp && (
          <span className="text-[12.5px] text-fg-3">
            Scored by <span className="font-semibold text-fg-2">{who(stamp.by)}</span>, {fmtDate(stamp.at)}
          </span>
        )}
      </div>
    </div>
  );
}

export function Card({ children, onRemove, removeLabel = "Remove" }: { children: React.ReactNode; onRemove?: () => void; removeLabel?: string }) {
  return (
    <div className="rounded-[18px] border border-line bg-[rgb(var(--fg-rgb)/0.02)] p-4 sm:p-5">
      {children}
      {onRemove && (
        <div className="mt-4 flex justify-end">
          <button type="button" className="desk-link text-[13.5px]" onClick={onRemove}>
            {removeLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export const grid = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
