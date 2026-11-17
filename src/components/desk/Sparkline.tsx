/**
 * A 12-point trend for a stat tile (dataviz: de-emphasised line, the current period in the
 * accent). 2px line, a soft area under it, the latest point as a dot with a surface ring.
 * Each point has a hover target larger than the mark, with a native tooltip, and the chart has
 * an accessible summary.
 */
export function Sparkline({
  values,
  labels,
  hue = "var(--accent-rgb)",
  summary,
  className,
}: {
  values: number[];
  labels: string[];
  hue?: string;
  summary: string;
  className?: string;
}) {
  const w = 132;
  const h = 40;
  const pad = 5;
  const max = Math.max(1, ...values);
  const step = (w - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pad} ${h - pad} Z`;
  const [lx, ly] = pts[pts.length - 1];
  const gid = `spark-${summary.replace(/\W+/g, "").slice(0, 24)}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label={summary}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`rgb(${hue} / 0.32)`} />
          <stop offset="1" stopColor={`rgb(${hue} / 0)`} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={`rgb(${hue} / 0.6)`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={4} fill={`rgb(${hue})`} stroke="var(--color-ink-2)" strokeWidth={2} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7} fill="transparent">
          <title>{`${labels[i]}: ${values[i]}`}</title>
        </circle>
      ))}
    </svg>
  );
}
