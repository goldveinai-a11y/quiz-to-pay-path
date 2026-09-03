import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  email: z.string().email(),
  segment: z.string().optional(),
  newsletter: z.boolean().optional(),
});

export const saveLead = createServerFn({ method: "POST" })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();
    const { error } = await supabaseAdmin
      .from("leads")
      .upsert(
        {
          email,
          segment: data.segment ?? null,
          newsletter: data.newsletter ?? false,
        },
        { onConflict: "email" },
      );
    if (error) {
      console.error("saveLead failed", error);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
