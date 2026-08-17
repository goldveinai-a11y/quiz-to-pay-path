import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — BibleRoutine" },
      {
        name: "description",
        content: "Reach the BibleRoutine team: billing, sign-in trouble, account deletion, feedback.",
      },
      { property: "og:title", content: "Contact & Support — BibleRoutine" },
      { property: "og:description", content: "Write to us at hello@bibleroutine.app." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bibleroutine.app/contact" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bibleroutine.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalPage title="Contact & Support" updated="17 August 2026">
      <LegalSection heading="One address, a real person">
        <p>
          Write to{" "}
          <a className="underline underline-offset-4" href="mailto:hello@bibleroutine.app">
            hello@bibleroutine.app
          </a>
          . We answer within two business days, usually sooner. Emailing from the address on your
          account helps us find you straight away.
        </p>
      </LegalSection>

      <LegalSection heading="Common things">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>The sign-in link did not arrive.</strong> Check spam, then request a new one on
            the{" "}
            <Link to="/auth" className="underline underline-offset-4">
              sign-in page
            </Link>
            . Links expire after a short while, so always use the newest one.
          </li>
          <li>
            <strong>Cancel your subscription.</strong> One click in your plan settings — see the{" "}
            <Link to="/refund" className="underline underline-offset-4">
              cancellation policy
            </Link>
            .
          </li>
          <li>
            <strong>Change your billing cycle.</strong> Also in plan settings; the difference is
            prorated.
          </li>
          <li>
            <strong>Delete your account and data.</strong> Ask us and it is done within 30 days,
            including your notes.
          </li>
          <li>
            <strong>Stop the daily emails.</strong> Turn them off in plan settings or use the
            unsubscribe link in any reminder.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Feedback">
        <p>
          If a session explained something badly, or a word note felt wrong, tell us the day number
          and what bothered you. That feedback is how the plans get better.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
