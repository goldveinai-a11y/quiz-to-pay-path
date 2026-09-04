import { createHash } from "node:crypto";

/**
 * Meta Conversions API — server-side mirror of the browser Pixel's Purchase
 * event (see meta-pixel.ts). This is the safety net: if a buyer closes the
 * tab right after paying, the webhook still fulfils the order (see
 * purchase.server.ts) and this is what tells Meta the purchase happened,
 * since no browser pixel ever gets the chance to fire in that case.
 *
 * Both env vars are server-only secrets — never prefix them with VITE_, or
 * they'd ship in the client bundle. Until META_CAPI_ACCESS_TOKEN is set in
 * Lovable's environment variables, this silently no-ops: purchases must
 * never fail because analytics isn't configured yet.
 */
const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type MetaCapiPurchaseInput = {
  /** Must match the eventId the browser Pixel uses for the same purchase — see trackMetaPurchase. */
  eventId: string;
  eventSourceUrl: string;
  value: number;
  currency: string;
  email: string;
};

export async function sendMetaPurchaseEvent(input: MetaCapiPurchaseInput): Promise<void> {
  if (!ACCESS_TOKEN || !PIXEL_ID) return;
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: input.eventId,
              event_source_url: input.eventSourceUrl,
              action_source: "website",
              user_data: {
                em: [sha256(input.email)],
              },
              custom_data: {
                value: input.value,
                currency: input.currency,
              },
            },
          ],
        }),
      },
    );
    if (!res.ok) {
      console.error("Meta CAPI Purchase failed:", res.status, await res.text());
    }
  } catch (e) {
    // Best-effort signal — never let an analytics failure touch the purchase flow.
    console.error("Meta CAPI Purchase error:", e);
  }
}
