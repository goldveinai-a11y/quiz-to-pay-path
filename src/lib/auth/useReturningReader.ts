import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

/**
 * Sends a signed-in reader straight to their plan instead of leaving them
 * inside the acquisition funnel (landing page, quiz).
 *
 * The Supabase client (and the auth SDK it drags in) is loaded via a
 * dynamic import instead of a static one. A static `import { supabase }`
 * here puts the whole Supabase JS bundle on the initial script list for
 * "/quiz" and "/" (verified in the deployed HTML), directly widening the
 * paint -> hydrated window on the very screen the hydration-race dead-tap
 * bug lives on. This check only matters for the small slice of already
 * signed-in visitors; it must never be why a brand-new visitor's first tap
 * on the quiz gets lost.
 */
export function useReturningReader() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      void navigate({ to: "/plan", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);
}
