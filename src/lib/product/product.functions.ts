import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildMyPlan, buildSessionDay, persistStep, persistDone, switchBook } from "./read.server";

export const completePurchase = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        email: z.string().email(),
        planCode: z.string().min(1),
        bookSlug: z.string().optional(),
        tradition: z.string().optional(),
        voices: z.string().optional(),
        showBothSides: z.boolean().optional(),
        readerName: z.string().optional(),
        origin: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { fulfillPurchase } = await import("./purchase.server");
    return fulfillPurchase(data);
  });

export const getMyPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => buildMyPlan(context.userId));

export const getSessionDay = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ day: z.number().int().min(1).max(30) }).parse(data))
  .handler(async ({ data, context }) => buildSessionDay(context.userId, data.day));

export const saveStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ day: z.number().int().min(1).max(30), step: z.number().int().min(1).max(6) }).parse(data),
  )
  .handler(async ({ data, context }) => persistStep(context.userId, data.day, data.step));

export const completeDay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        day: z.number().int().min(1).max(30),
        note: z.string().max(4000).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => persistDone(context.userId, data.day, data.note ?? null));

export const startBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ bookSlug: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => switchBook(context.userId, data.bookSlug));