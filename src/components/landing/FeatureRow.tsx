import type { ReactNode } from "react";
import { PhoneMock } from "@/components/paywall/PhoneMock";
import { Reveal } from "@/components/product/Reveal";

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
      <Reveal className="flex justify-center">
        <PhoneMock size="lg">{children}</PhoneMock>
      </Reveal>
      <h3 className="mt-6 text-center text-[21px] leading-snug text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-[420px] text-center text-[14px] leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}