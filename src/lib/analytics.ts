/**
 * Google Analytics 4 — funnel instrumentation.
 *
 * The measurement ID is the BibleRoutine web stream. It is a public identifier,
 * so it lives in code instead of depending on whichever stream the connector
 * happens to sync. VITE_GA_MEASUREMENT_ID can override it if the stream changes.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID =
  (import.meta.env["VITE_GA_MEASUREMENT_ID"] as string | undefined) || "G-NCNVKMQGQT";

let started = false;

/**
 * Anything that is not the live domain is treated as a preview: events are sent
 * with debug_mode (visible instantly in GA DebugView) and tagged env=preview so
 * production reports can filter them out.
 */
function environment(): "production" | "preview" {
  if (typeof window === "undefined") return "production";
  return /(^|\.)bibleroutine\.app$/.test(window.location.hostname) ? "production" : "preview";
}

const isPreview = () => environment() === "preview";

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
  push("config", MEASUREMENT_ID, {
    send_page_view: false,
    ...(isPreview() ? { debug_mode: true } : {}),
  });
}

export type EventParams = Record<string, string | number | boolean | undefined>;

/** Never pass emails, names or anything else that identifies a reader. */
export function track(event: string, params: EventParams = {}) {
  if (typeof window === "undefined" || !MEASUREMENT_ID) return;
  push("event", event, {
    ...params,
    env: environment(),
    ...(isPreview() ? { debug_mode: true } : {}),
  });
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
