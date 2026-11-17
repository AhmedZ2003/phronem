/**
 * Phronem's existing monogram (the "P" from the current site icon), on a violet-to-indigo nebula tile.
 * Pass a distinct `gradientId` when several marks share a page and some may be hidden: a gradient
 * defined inside a hidden (display: none) SVG doesn't paint for the others that reference it.
 */
export function LogoMark({ className, gradientId = "logo-nebula" }: { className?: string; gradientId?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-marine-2)" />
          <stop offset="1" stopColor="var(--color-marine)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
      <path
        d="M22 46V18h11.5c6.4 0 10.5 3.7 10.5 9.4S39.9 37 33.5 37H27.5v9z M27.5 32.3h5.6c3.3 0 5.3-1.8 5.3-4.9s-2-4.7-5.3-4.7h-5.6z"
        fill="var(--color-fg)"
      />
    </svg>
  );
}
