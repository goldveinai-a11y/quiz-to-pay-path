# Meta Purchase tracking — final closure

## Verdict on Claude's finding

The claim "Purchase is never called" is outdated. Verified in code:

- Browser Pixel `trackMetaPurchase` fires only on `/checkout-complete`, after server-side verification of payment via Stripe (`finalizePurchase`), with real amount/currency from the session.
- Click on "Start my plan" fires `InitiateCheckout` — a different event, no double counting.
- Server-side Conversions API mirror exists in `purchase.server.ts` (webhook path for closed tabs), sharing a deterministic `eventId` with the browser event so Meta dedupes.

## What remains

1. **Add the CAPI access token** (the only real gap). Without `META_CAPI_ACCESS_TOKEN` the server-side Purchase silently no-ops. Steps:
   - User copies the token: Meta Events Manager → pixel 1597943145145592 → Settings → Conversions API → Generate access token.
   - Add it as the project secret `META_CAPI_ACCESS_TOKEN` (server-only, never VITE_).
2. **Live verification after the next publish** — exactly as Claude suggests, in Events Manager → Test events on bibleroutine.app:
   - Test-purchase with Stripe test card in sandbox OR observe first real purchase.
   - Confirm Purchase appears once per transaction (browser + server deduped by event id), with correct value/currency.
   - Confirm InitiateCheckout fires on plan-button click and Lead on result-page email submit.

## Technical notes

- No code changes needed for tracking logic itself.
- Pixel intentionally loads only on `bibleroutine.app` (preview never fires real events), so Test events must run on the production domain.
- `META_CAPI_ACCESS_TOKEN` is read at module scope in `meta-capi.server.ts`; after adding the secret a republish is required for it to take effect.
