import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { BookOpen, NotebookPen, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: ProductShell,
});

const TABS = [
  { to: "/plan", label: "Today", icon: BookOpen },
  { to: "/plan/all", label: "Plan", icon: CalendarDays },
  { to: "/notes", label: "Notes", icon: NotebookPen },
] as const;

/** Reading a session is full-screen; everywhere else keeps the three tabs. */
function ProductShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reading = /^\/plan\/\d+/.test(pathname);

  return (
    <>
      <Outlet />
      {reading ? null : (
        <nav className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-[480px]">
            {TABS.map((tab) => {
              const active = tab.to === "/plan" ? pathname === "/plan" : pathname === tab.to;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors duration-150",
                    active ? "text-terra" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="eyebrow">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}