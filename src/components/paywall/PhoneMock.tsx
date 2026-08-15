import type { ReactNode } from "react";

export function PhoneMock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border-[6px] border-ink bg-card shadow-s3 ${className}`}
    >
      <span className="absolute left-1/2 top-0 z-10 h-[14px] w-[64px] -translate-x-1/2 rounded-b-xl bg-ink" />
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
