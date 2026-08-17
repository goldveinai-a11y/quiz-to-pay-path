import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation — BibleRoutine" },
      {
        name: "description",
        content:
          "How to cancel BibleRoutine in one click, what happens to your access, and when we refund.",
      },
      { property: "og:title", content: "Refund & Cancellation — BibleRoutine" },
      {
        property: "og:description",
        content: "Cancel in one click. Keep access until the period you paid for ends.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bibleroutine.app/refund" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bibleroutine.app/refund" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated="17 August 2026">
      <LegalSection heading="Cancel in one click">
        <p>
          Open your plan, go to settings and press cancel. It takes effect immediately: no further
          charges are made. You keep full access to your plan, your notes and your streak until the
          end of the period you already paid for.
        </p>
      </LegalSection>

      <LegalSection heading="Cancelling during the intro period">
        <p>
          Cancel before the intro period ends and you are never charged the renewal amount. The intro
          amount itself is a payment for that period and is not automatically refunded — but see
          below.
        </p>
      </LegalSection>

      <LegalSection heading="When we refund">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Within 14 days of your first payment</strong>, if the product is not what you
            expected, write to us and we refund it. No argument, no form to fill in.
          </li>
          <li>
            <strong>A renewal you did not intend</strong>, reported within 14 days of the charge and
            with little or no use of that period: refunded in full.
          </li>
          <li>
            <strong>A duplicate or clearly mistaken charge</strong>: refunded in full, always.
          </li>
          <li>
            <strong>A technical failure</strong> that stopped you using your plan and that we could
            not fix: refunded for the affected period.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How to ask">
        <p>
          Email{" "}
          <a className="underline underline-offset-4" href="mailto:hello@bibleroutine.app">
            hello@bibleroutine.app
          </a>{" "}
          from the address on your account. We reply within two business days and approved refunds
          reach your card within 5–10 business days, depending on your bank.
        </p>
      </LegalSection>

      <LegalSection heading="Statutory rights">
        <p>
          If you are a consumer in the EU or UK, you have a 14-day right of withdrawal for digital
          services. By starting your plan immediately after payment you ask us to begin the service
          during that period; we still honour the refund window above. Nothing in this policy limits
          rights the law gives you.
        </p>
        <p>
          Related:{" "}
          <Link to="/terms" className="underline underline-offset-4">
            Terms of Use
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
