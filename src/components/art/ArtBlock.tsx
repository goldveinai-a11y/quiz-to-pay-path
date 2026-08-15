import type { ReactNode } from "react";

export type ArtTone = "teal" | "terra" | "indigo" | "olive";

const TONES: Record<ArtTone, { top: string; hills: string }> = {
  teal: {
    top: "linear-gradient(160deg,#2B6A61,#123C36 60%,#0C2A26)",
    hills:
      "radial-gradient(120% 100% at 20% 100%,#0A2320 40%,transparent 41%),radial-gradient(120% 100% at 78% 100%,#0E2C28 44%,transparent 45%)",
  },
  terra: {
    top: "linear-gradient(150deg,#C2603A,#8E4227 62%,#5F2C19)",
    hills:
      "radial-gradient(120% 100% at 22% 100%,#59291642 40%,transparent 41%),radial-gradient(120% 100% at 80% 100%,#6B3320 44%,transparent 45%)",
  },
  indigo: {
    top: "linear-gradient(160deg,#39406F,#1A1E3C 65%,#12142A)",
    hills:
      "radial-gradient(130% 100% at 25% 100%,#101228 42%,transparent 43%),radial-gradient(130% 100% at 80% 100%,#171A38 46%,transparent 47%)",
  },
  olive: {
    top: "linear-gradient(150deg,#7E8B49,#4C5825 65%,#333C18)",
    hills:
      "radial-gradient(130% 100% at 25% 100%,#2C3315 42%,transparent 43%),radial-gradient(130% 100% at 80% 100%,#3A4420 46%,transparent 47%)",
  },
};

export function ArtBlock({
  tone = "teal",
  height = 170,
  eyebrow,
  children,
  className = "",
  sun = true,
}: {
  tone?: ArtTone;
  height?: number;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
  sun?: boolean;
}) {
  const t = TONES[tone];
  return (
    <div
      className={`art-hatch relative w-full ${className}`}
      style={{ height, background: t.top }}
      aria-hidden={children ? undefined : true}
    >
      {sun ? (
        <span
          className="pointer-events-none absolute -right-7 -top-8 h-32 w-32 rounded-full opacity-80 blur-[2px]"
          style={{
            background: "radial-gradient(circle,#EBCB8B,#D9973F 52%,transparent 72%)",
          }}
        />
      ) : null}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{ backgroundImage: t.hills }}
      />
      {eyebrow ? (
        <span className="eyebrow absolute left-5 top-4 text-white/70">{eyebrow}</span>
      ) : null}
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}
