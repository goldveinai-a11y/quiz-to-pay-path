export type AccessPlan = {
  code: string;
  label: string;
  amountCents: number;
  /** Length of the intro access period in days. */
  introDays: number;
  renews: string;
};

export const ACCESS_PLANS: Record<string, AccessPlan> = {
  "1-week": {
    code: "1-week",
    label: "1-week access",
    amountCents: 699,
    introDays: 7,
    renews: "$29.99 every 3 months after",
  },
  "1-month": {
    code: "1-month",
    label: "1-month access",
    amountCents: 1499,
    introDays: 30,
    renews: "$29.99 every 3 months after",
  },
  "3-month": {
    code: "3-month",
    label: "3-month access",
    amountCents: 2999,
    introDays: 90,
    renews: "$69.99 every year after",
  },
};

export function getAccessPlan(code: string | undefined): AccessPlan {
  return ACCESS_PLANS[code ?? "1-month"] ?? ACCESS_PLANS["1-month"]!;
}