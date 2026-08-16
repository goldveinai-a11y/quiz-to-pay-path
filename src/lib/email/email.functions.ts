import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getEmailPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("email_preferences")
      .select("daily_reminder, win_back, milestone")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data ?? { daily_reminder: true, win_back: true, milestone: true };
  });

export const setEmailPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ dailyReminder: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("email_preferences")
      .update({ daily_reminder: data.dailyReminder, win_back: data.dailyReminder })
      .eq("user_id", context.userId);
    return { ok: true };
  });

/** Public on purpose: an unsubscribe link must work without signing in. */
export const unsubscribeEmails = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ token: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { unsubscribeByToken } = await import("./dispatch.server");
    return unsubscribeByToken(data.token);
  });