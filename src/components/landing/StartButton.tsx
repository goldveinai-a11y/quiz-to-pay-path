import { Link } from "@tanstack/react-router";

export function StartButton({ label = "Start", className = "" }: { label?: string; className?: string }) {
  return (
    <Link
      to="/quiz"
      search={(prev: Record<string, unknown>) => prev}
      className={`flex h-14 w-full items-center justify-center rounded-2xl bg-ink text-base font-semibold text-background shadow-s2 transition-transform active:scale-[0.99] ${className}`}
    >
      {label}
    </Link>
  );
}