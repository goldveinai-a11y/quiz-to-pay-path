/**
 * Google Analytics 4 — funnel instrumentation.
 *
 * The measurement ID arrives from the Google Analytics connector as a build-time
 * env var. When it is absent (local dev, preview without the connector) every
 * call here is a no-op, so instrumentation can be sprinkled freely.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"] as
  | string
  | undefined;

let started = false;

function push(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

export function initAnalytics() {
  if (started || typeof window === "undefined" || !MEASUREMENT_ID) return;
  started = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  push("js", new Date());
  // Route changes are reported by trackPageView, so the automatic one would double count.
  push("config", MEASUREMENT_ID, { send_page_view: false });
}

export type EventParams = Record<string, string | number | boolean | undefined>;

/** Never pass emails, names or anything else that identifies a reader. */
export function track(event: string, params: EventParams = {}) {
  if (typeof window === "undefined" || !MEASUREMENT_ID) return;
  push("event", event, params);
}

export function trackPageView(path: string, title?: string) {
  track("page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : path,
    page_title: title ?? (typeof document !== "undefined" ? document.title : undefined),
  });
}

/** Fires an event at most once per browser, keyed by id (purchase, day-2 return, …). */
export function trackOnce(key: string, event: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  const storageKey = `br:ga:${key}`;
  try {
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // Private mode: better to send twice than never.
  }
  track(event, params);
}

/**
 * Retention signal: the reader opened the product on a later calendar day than
 * their first visit to it. Sent once per distinct return day.
 */
export function trackReturnVisit() {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const first = window.localStorage.getItem("br:ga:first-product-day");
    if (!first) {
      window.localStorage.setItem("br:ga:first-product-day", today);
      return;
    }
    if (first === today) return;
    const days = Math.round((Date.parse(today) - Date.parse(first)) / 86400000);
    trackOnce(`return-${today}`, "product_return", { days_since_first: days });
  } catch {
    // Storage unavailable — skip the signal rather than break the page.
  }
}
