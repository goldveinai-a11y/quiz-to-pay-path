import type Stripe from "stripe";
import { getAccessPlan } from "@/lib/product/pricing";
import type { Renewal } from "./renewals";

/**
 * Two stable products, reused by every checkout. Creating prices inline on each
 * session would spawn a new product per purchase and clutter the catalog.
 */
const PLAN_PRODUCT_ID = "bibleroutine_plan";
const ACCESS_PRODUCT_ID = "bibleroutine_access";
/** Digital goods — required for tax to be classified correctly. */
const TAX_CODE = "txcd_10000000";

async function ensureProduct(
  stripe: Stripe,
  id: string,
  name: string,
  description: string,
): Promise<Stripe.Product> {
  try {
    const existing = await stripe.products.retrieve(id);
    if (existing.active) return existing;
  } catch {
    // Not created in this environment yet.
  }
  return stripe.products.create({ id, name, description, tax_code: TAX_CODE });
}

export function renewalLookupKey(renewal: Renewal): string {
  return `bibleroutine_renewal_${renewal.intervalCount}_${renewal.interval}_${renewal.amountCents}`;
}

function introLookupKey(planCode: string, amountCents: number): string {
  return `bibleroutine_intro_${planCode.replace(/-/g, "_")}_${amountCents}`;
}

async function findPrice(stripe: Stripe, lookupKey: string): Promise<Stripe.Price | undefined> {
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  return found.data[0];
}

/** The recurring price that starts once the intro period ends. */
export async function ensureRenewalPrice(stripe: Stripe, renewal: Renewal): Promise<Stripe.Price> {
  const lookupKey = renewalLookupKey(renewal);
  const existing = await findPrice(stripe, lookupKey);
  if (existing) return existing;

  const product = await ensureProduct(
    stripe,
    ACCESS_PRODUCT_ID,
    "BibleRoutine — continued access",
    "Continued access to daily guided Bible sessions.",
  );
  return stripe.prices.create({
    currency: "usd",
    unit_amount: renewal.amountCents,
    recurring: { interval: renewal.interval, interval_count: renewal.intervalCount },
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    product: product.id,
  });
}

/** The amount charged today, billed on the first invoice of the subscription. */
export async function ensureIntroPrice(stripe: Stripe, planCode: string): Promise<Stripe.Price> {
  const plan = getAccessPlan(planCode);
  const lookupKey = introLookupKey(plan.code, plan.amountCents);
  const existing = await findPrice(stripe, lookupKey);
  if (existing) return existing;

  const product = await ensureProduct(
    stripe,
    PLAN_PRODUCT_ID,
    "BibleRoutine — 30-day plan",
    "A personalised 30-day guided Bible reading plan.",
  );
  return stripe.prices.create({
    currency: "usd",
    unit_amount: plan.amountCents,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    nickname: `BibleRoutine — ${plan.label}`,
    product: product.id,
  });
}
