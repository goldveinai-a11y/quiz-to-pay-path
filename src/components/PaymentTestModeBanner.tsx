const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"] as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        Production checkout is not configured yet.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="mx-auto mb-3 w-full max-w-md rounded-xl border border-border bg-card/80 px-4 py-2 text-center text-xs text-muted-foreground">
        Test mode — payments in the preview are not real.
      </div>
    );
  }
  return null;
}