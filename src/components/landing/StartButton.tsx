import { Link } from "@tanstack/react-router";
import { track } from "@/lib/analytics";

export function StartButton({
  label = "Start",
  className = "",
  placement = "landing",
}: {
  label?: string;
  className?: string;
  placement?: string;
}) {
  return (
    <Link
      to="/quiz"
      search={(prev: Record<string, unknown>) => prev}
      onClick={() => track("landing_cta_click", { placement, label })}
      className={`flex h-14 w-full items-center justify-center rounded-2xl bg-ink text-base font-semibold text-background shadow-s2 transition-transform active:scale-[0.99] ${className}`}
    >
      {label}
    </Link>
  );
}