/**
 * Meta Pixel — the browser half of the BibleRoutine ↔ Meta Ads signal.
 *
 * Deliberately narrower than analytics.ts: GA4 gets every funnel step for
 * diagnostics, but Meta's ad algorithm only needs the handful of standard
 * events it actually optimizes against — Lead, ViewContent, InitiateCheckout,
 * Purchase. Firing the full GA4 event list here would just add noise to the
 * account's event volume without improving anything.
 *
 * Purchase is the one event that also has a server-side Conversions API
 * counterpart (see meta-capi.server.ts) so a closed tab after payment still
 * reaches Meta. Both sides of a Purchase must share the same eventId — pass
 * it through untouched — so Meta dedupes the pair instead of double counting.
 */

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      callMethod?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
  }
}

const PIXEL_ID =
  (import.meta.env["VITE_META_PIXEL_ID"] as string | undefined) || "1597943145145592";

let started = false;

/**
 * Unlike analytics.ts, preview deploys don't load the pixel at all — a
 * developer clicking through a Lovable preview must never fire a real event
 * against the live ad account. QA the pixel on bibleroutine.app itself using
 * Meta Pixel Helper or the Events Manager Test Events tab.
 */
function isProduction(): boolean {
  if (typeof window === "undefined") return false;
  return /(^|\.)bibleroutine\.app$/.test(window.location.hostname);
}

export function initMetaPixel() {
  if (started || typeof window === "undefined" || !PIXEL_ID || !isProduction()) return;
  started = true;

  (function (f: Window, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: NonNullable<Window["fbq"]> = Object.assign(
      function (...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue?.push(args);
      },
      { queue: [] as unknown[], loaded: true, version: v },
    );
    f.fbq = n;
    if (!f._fbq) f._fbq = n;
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, "script", "2.0");

  window.fbq?.("init", PIXEL_ID);
  window.fbq?.("track", "PageView");
}

export type MetaEventParams = Record<string, string | number | boolean | undefined>;

function fire(event: string, params: MetaEventParams = {}, eventId?: string) {
  if (typeof window === "undefined" || !started) return;
  if (eventId) {
    window.fbq?.("track", event, params, { eventID: eventId });
  } else {
    window.fbq?.("track", event, params);
  }
}

/** Quiz email step submitted — the moment BibleRoutine has a real lead. */
export function trackMetaLead(params: MetaEventParams = {}) {
  fire("Lead", params);
}

/** Paywall/result page viewed. */
export function trackMetaViewContent(params: MetaEventParams = {}) {
  fire("ViewContent", params);
}

/** Reader picked a plan and moved to the Stripe checkout step. */
export function trackMetaInitiateCheckout(params: MetaEventParams = {}) {
  fire("InitiateCheckout", params);
}

/**
 * eventId must be the exact id the server passed back from finalizePurchase
 * (itself generated in fulfillPurchase), so this browser event dedupes
 * against the server-side Conversions API Purchase for the same transaction.
 */
export function trackMetaPurchase(eventId: string, value: number, currency: string) {
  fire("Purchase", { value, currency }, eventId);
}
