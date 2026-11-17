/**
 * Line-art icons for the four "in writing before any fieldwork" cards. Drawn on a 32×32 grid with
 * one stroke weight, in the same geometric spirit as the step icons; each card gives its icon its
 * own color through `currentColor`.
 *
 *   confidentiality   a padlock with a keyhole
 *   personal-data     a shield guarding a person
 *   adverse-events    a heartbeat line inside a ring
 *   full-chain        two interlocking chain links: every party in the chain, connected
 */
const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Confidentiality() {
  return (
    <>
      <path d="M10.5 14.5V11a5.5 5.5 0 0 1 11 0v3.5" {...s} />
      <rect x="7.5" y="14.5" width="17" height="12" rx="3" {...s} />
      <circle cx="16" cy="19.5" r="1.6" {...s} />
      <path d="M16 21.1V23.5" {...s} />
    </>
  );
}

function PersonalData() {
  return (
    <>
      <path d="M16 4.5 25.5 8v7.5c0 6-4.1 10.6-9.5 12-5.4-1.4-9.5-6-9.5-12V8L16 4.5Z" {...s} />
      <circle cx="16" cy="13.5" r="2.8" {...s} />
      <path d="M11.2 21.5c.9-2.4 2.7-3.7 4.8-3.7s3.9 1.3 4.8 3.7" {...s} />
    </>
  );
}

function AdverseEvents() {
  return (
    <>
      <circle cx="16" cy="16" r="11" {...s} />
      <path d="M7.5 16.5h4.3l2-4.5 3.4 9 2.1-4.5h5.2" {...s} />
    </>
  );
}

function FullChain() {
  return (
    <>
      <rect x="3.5" y="11" width="15" height="10" rx="5" transform="rotate(-25 11 16)" {...s} />
      <rect x="13.5" y="11" width="15" height="10" rx="5" transform="rotate(-25 21 16)" {...s} />
    </>
  );
}

export const assuranceIcons = {
  confidentiality: Confidentiality,
  "personal-data": PersonalData,
  "adverse-events": AdverseEvents,
  "full-chain": FullChain,
} as const;

export type AssuranceIconName = keyof typeof assuranceIcons;

export function AssuranceIcon({ name, className }: { name: AssuranceIconName; className?: string }) {
  const Glyph = assuranceIcons[name];
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <Glyph />
    </svg>
  );
}
