export function GrowthChart({ now, after }: { now: number; after: number }) {
  const w = 320;
  const h = 132;
  const y = (v: number) => h - 14 - ((v - 1) / 9) * (h - 34);
  const x0 = 14;
  const x1 = w - 14;
  const cx1 = x0 + (x1 - x0) * 0.45;
  const cx2 = x0 + (x1 - x0) * 0.72;
  const d = `M${x0},${y(now)} C${cx1},${y(now)} ${cx2},${y(after) + 22} ${x1},${y(after)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Projected understanding">
      <defs>
        <linearGradient id="gc-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--faint)" />
          <stop offset="100%" stopColor="var(--terra)" />
        </linearGradient>
        <linearGradient id="gc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--terra)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--terra)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={x0}
          x2={x1}
          y1={18 + i * ((h - 32) / 3)}
          y2={18 + i * ((h - 32) / 3)}
          stroke="var(--border)"
          strokeDasharray="2 5"
        />
      ))}
      <path d={`${d} L${x1},${h - 14} L${x0},${h - 14} Z`} fill="url(#gc-fill)" />
      <path d={d} fill="none" stroke="url(#gc-line)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={x0} cy={y(now)} r="5" fill="var(--card)" stroke="var(--faint)" strokeWidth="3" />
      <circle cx={x1} cy={y(after)} r="6" fill="var(--terra)" />
      <circle cx={x1} cy={y(after)} r="11" fill="var(--terra)" opacity="0.18" />
    </svg>
  );
}
