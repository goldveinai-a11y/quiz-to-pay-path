import { getRequestHost } from "@tanstack/react-start/server";
import type { StripeEnv } from "@/lib/stripe.server";

/**
 * The environment is decided on the server from the host that served the
 * request, never from the browser: preview and production share one database,
 * so a client-supplied value could mix test and real money.
 */
export function resolveStripeEnv(): StripeEnv {
  let host = "";
  try {
    host = getRequestHost({ xForwardedHost: true }).toLowerCase();
  } catch {
    host = "";
  }
  const live = host === "bibleroutine.app" || host === "www.bibleroutine.app";
  return live ? "live" : "sandbox";
}
