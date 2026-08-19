import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

/** Real handsets are ~9:19.5. Anything squatter reads as a fake tablet. */
const SIZES: Record<Size, { frame: string; radius: string; border: string; notch: string }> = {
  sm: { frame: "w-[116px]", radius: "rounded-[20px]", border: "border-[4px]", notch: "h-[9px] w-[42px]" },
  md: { frame: "w-[140px]", radius: "rounded-[24px]", border: "border-[5px]", notch: "h-[11px] w-[52px]" },
  lg: { frame: "w-[220px]", radius: "rounded-[34px]", border: "border-[7px]", notch: "h-[15px] w-[76px]" },
};

export function PhoneMock({
  children,
  size = "md",
  ratio = "phone",
  className = "",
}: {
  children: ReactNode;
  size?: Size;
  /** "phone" locks the true 9:19.5 handset ratio; "auto" defers to className. */
  ratio?: "phone" | "auto";
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <div
      className={`relative overflow-hidden border-ink bg-card shadow-s3 ${s.frame} ${s.radius} ${s.border} ${
        ratio === "phone" ? "aspect-[9/19.5]" : ""
      } ${className}`}
    >
      <span
        className={`absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-xl bg-ink ${s.notch}`}
      />
      <div className="h-full w-full overflow-hidden">{children}</div>
    </div>
  );
}
