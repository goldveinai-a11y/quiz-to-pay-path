import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildMyPlan,
  buildSessionDay,
  persistStep,
  persistDone,
  switchBook,
  readAccess,
  cancelAccess,
  changePlan,
} from "./read.server";

// Fulfilment is not a public endpoint: it runs only from finalizePurchase,
// after the payment session has been verified with the card processor.
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

export const getAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readAccess(context.userId));

export const cancelAccessNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: "sandbox" | "live" }) => data)
  .handler(async ({ context, data }) => cancelAccess(context.userId, data.environment));

export const changePlanNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        planCode: z.enum(["1-week", "1-month", "3-month"]),
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => changePlan(context.userId, data.planCode, data.environment));