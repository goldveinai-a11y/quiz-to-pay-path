import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — BibleRoutine" },
      {
        name: "description",
        content:
          "The agreement between you and BibleRoutine: your account, your subscription, renewals, cancellation and content licensing.",
      },
      { property: "og:title", content: "Terms of Use — BibleRoutine" },
      {
        property: "og:description",
        content: "Account, subscription, renewal and cancellation terms for BibleRoutine.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bibleroutine.app/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bibleroutine.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="17 August 2026">
      <LegalSection heading="The agreement">
        <p>
          By taking the quiz, buying a plan or signing in, you agree to these terms. If you do not
          agree, please do not use BibleRoutine.
        </p>
      </LegalSection>

      <LegalSection heading="What BibleRoutine is">
        <p>
          A web product that gives you a 30-day guided Bible reading plan: one short session a day
          with the passage, an explanation, the original word behind a key phrase, and space for your
          own notes. It is a study aid. It is not spiritual direction, counselling, medical or legal
          advice, and it does not replace your church or your own reading.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          Your account is created from the email address you gave during the quiz. Sign-in is by a
          link sent to that address — there is no password. Anyone with access to your inbox can
          open your account, so keep it secure. One account is for one person; do not share your
          sign-in links.
        </p>
      </LegalSection>

      <LegalSection heading="Subscription, intro period and renewal">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Access is sold as a <strong>subscription</strong>. You pay the intro amount shown at
            checkout immediately, and that amount covers the intro period.
          </li>
          <li>
            When the intro period ends, the subscription <strong>renews automatically</strong> at the
            renewal price and billing cycle displayed on the checkout page and repeated in your
            receipt — for example a 1-week intro followed by a recurring 3-month charge.
          </li>
          <li>
            Renewals continue until you cancel. Prices may change, but never for a cycle you have
            already paid for, and we will email you before any change takes effect.
          </li>
          <li>
            You can switch to a different billing cycle from your plan settings. Stripe prorates the
            difference.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Cancelling">
        <p>
          One click, inside your plan settings, at any time — no email, no phone call. Cancelling
          stops all future charges and you keep full access until the end of the period you have
          already paid for. See the{" "}
          <Link to="/refund" className="underline underline-offset-4">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Bible text and study content">
        <p>
          Scripture is shown in public-domain translations only — the World English Bible (WEB), the
          King James Version (KJV) and the American Standard Version (ASV) — so you may quote and
          share it freely. The explanations, original-word notes, session structure, design and
          shareable cards are ours or licensed to us; they are for your personal use. Do not
          republish, resell or bulk-copy them.
        </p>
      </LegalSection>

      <LegalSection heading="What you write">
        <p>
          Your notes stay yours. You give us only the permission needed to store and display them
          back to you.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>
          Do not attempt to break, scrape, resell or abuse the service, and do not use it to harass
          others. We may suspend an account that does, and will refund any unused paid period.
        </p>
      </LegalSection>

      <LegalSection heading="Availability and liability">
        <p>
          We work to keep BibleRoutine available, but the service is provided as it is, without
          warranties. To the extent the law allows, our total liability is limited to what you paid
          us in the twelve months before the claim. Nothing here limits liability that cannot legally
          be limited.
        </p>
      </LegalSection>

      <LegalSection heading="Ending the agreement">
        <p>
          You may stop using BibleRoutine and delete your account at any time. We may end the
          agreement for a serious or repeated breach of these terms.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a className="underline underline-offset-4" href="mailto:hello@bibleroutine.app">
            hello@bibleroutine.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
