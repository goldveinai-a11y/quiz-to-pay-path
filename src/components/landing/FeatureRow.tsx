import type { ReactNode } from "react";
import { PhoneMock } from "@/components/paywall/PhoneMock";

export function FeatureRow({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-12">
      <div className="mx-auto w-[240px]">
        <PhoneMock className="h-[340px]">{children}</PhoneMock>
      </div>
      <h3 className="mt-6 text-center text-[21px] leading-snug text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-[420px] text-center text-[14px] leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}