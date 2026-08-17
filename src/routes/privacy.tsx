import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BibleRoutine" },
      {
        name: "description",
        content:
          "What BibleRoutine collects, why, who processes it, and how to delete your account and data.",
      },
      { property: "og:title", content: "Privacy Policy — BibleRoutine" },
      {
        property: "og:description",
        content: "How BibleRoutine handles your email, quiz answers and reading progress.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bibleroutine.app/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bibleroutine.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="17 August 2026">
      <LegalSection heading="Who we are">
        <p>
          BibleRoutine is a web-based daily Bible reading product operated by the BibleRoutine team
          ("we", "us"). You can reach us at any time at{" "}
          <a className="underline underline-offset-4" href="mailto:hello@bibleroutine.app">
            hello@bibleroutine.app
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Your email address</strong>, given during the quiz or at sign-in. It is your
            account identifier and the address your reading links are sent to.
          </li>
          <li>
            <strong>Your quiz answers</strong> — tradition, pace, season of life and the questions
            you want answered. They are used once to build your 30-day plan and kept so your plan
            stays stable.
          </li>
          <li>
            <strong>Your reading activity</strong> — which days you completed, your streak, the
            notes and highlights you write inside a session.
          </li>
          <li>
            <strong>Payment status</strong> — whether your subscription is trialling, active or
            cancelled, and when it renews. We never see or store your card number.
          </li>
          <li>
            <strong>Basic technical data</strong> — the marketing source you arrived from, browser
            type and approximate region, used to keep the service working and to understand which
            entry points people use.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Why we may process it">
        <p>
          To provide the service you paid for (performance of a contract), to send the emails tied
          to your plan (contract and legitimate interest), to keep the product safe and working
          (legitimate interest), and to meet tax and accounting duties (legal obligation).
        </p>
      </LegalSection>

      <LegalSection heading="Who processes data on our behalf">
        <ul className="list-disc space-y-2 pl-5">
          <li>Our hosting, database and authentication provider, which stores your account and plan.</li>
          <li>Stripe, which processes payments and holds your card details directly. We receive only the subscription status and the last four digits.</li>
          <li>Our email delivery provider, which sends your sign-in links and reading reminders.</li>
        </ul>
        <p>We do not sell your data and we do not share it with advertisers.</p>
      </LegalSection>

      <LegalSection heading="Your notes are yours">
        <p>
          What you write inside a session is visible only to your account. We do not read it, and we
          do not use it to train models.
        </p>
      </LegalSection>

      <LegalSection heading="Emails you receive">
        <p>
          Sign-in links and payment receipts are essential and cannot be turned off while your
          account exists. Daily reading reminders and gentle "come back" emails are optional: switch
          them off in your plan settings, or use the unsubscribe link at the bottom of any of them.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          While your account exists, and for up to 30 days after deletion in encrypted backups.
          Payment records are kept longer where tax law requires it.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can ask for a copy of your data, correct it, or have your account and everything in it
          deleted. Write to{" "}
          <a className="underline underline-offset-4" href="mailto:hello@bibleroutine.app">
            hello@bibleroutine.app
          </a>{" "}
          and we will action it within 30 days. If you are in the EU or UK you may also complain to
          your local data protection authority.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We use only what the product needs: a session cookie so you stay signed in, and a local
          store that remembers your quiz answers before you have an account. No advertising cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>BibleRoutine is not directed at children under 13 and we do not knowingly collect their data.</p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If we change this policy in a way that matters, we will say so by email before it takes
          effect.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
