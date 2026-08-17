import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/SiteFooter";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-[640px] items-center justify-between px-5">
          <Link to="/" className="font-serif text-[20px] tracking-tight text-ink">
            BibleRoutine
          </Link>
          <Link to="/" className="text-[13px] text-muted-foreground underline underline-offset-4">
            Back
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-[640px] px-5 py-12">
        <h1 className="font-serif text-[30px] leading-tight text-ink">{title}</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">Last updated {updated}</p>
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink/85">{children}</div>
      </article>

      <SiteFooter />
    </main>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-[20px] leading-snug text-ink">{heading}</h2>
      {children}
    </section>
  );
}
