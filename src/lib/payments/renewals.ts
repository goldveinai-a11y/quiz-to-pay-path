export type Renewal = {
  amountCents: number;
  interval: "month" | "year";
  intervalCount: number;
};

/** What the buyer is told on the paywall, expressed for the card processor. */
export const RENEWALS: Record<string, Renewal> = {
  "1-week": { amountCents: 2999, interval: "month", intervalCount: 3 },
  "1-month": { amountCents: 2999, interval: "month", intervalCount: 3 },
  "3-month": { amountCents: 6999, interval: "year", intervalCount: 1 },
};