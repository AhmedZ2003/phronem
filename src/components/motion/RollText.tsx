/**
 * Markup for the hover text roll (runtime/textRoll.ts). The parent link needs `data-roll`.
 * Without JS (or with reduced motion) the original label simply stays put.
 */
export function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-block overflow-hidden align-top leading-[1.25]">
      <span data-roll-original className="block">
        {children}
      </span>
      <span data-roll-clone aria-hidden className="absolute inset-0 block">
        {children}
      </span>
    </span>
  );
}
