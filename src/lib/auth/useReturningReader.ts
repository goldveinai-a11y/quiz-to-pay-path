import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a signed-in reader straight to their plan instead of leaving them
 * inside the acquisition funnel (landing page, quiz).
 */
export function useReturningReader() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      void navigate({ to: "/plan", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);
}
