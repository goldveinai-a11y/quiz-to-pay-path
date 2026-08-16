/** Static, template-only emails. Nothing here is generated at runtime. */

export type EmailTemplate = { subject: string; html: string; text: string };

type Shell = {
  preheader: string;
  heading: string;
  body: string[];
  cta?: { label: string; href: string } | undefined;
  quote?: { text: string; reference: string } | undefined;
  unsubscribeUrl?: string | undefined;
};

const INK = "#1c1917";
const PAPER = "#f6f1e7";
const MUTED = "#6b6257";
const TERRA = "#b4521f";

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function shell(s: Shell) {
  const paragraphs = s.body
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK}">${escape(p)}</p>`,
    )
    .join("");

  const quote = s.quote
    ? `<blockquote style="margin:22px 0;padding:16px 18px;border-left:3px solid ${TERRA};background:#ffffff">
         <p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:${INK}">${escape(s.quote.text)}</p>
         <p style="margin:8px 0 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">${escape(s.quote.reference)}</p>
       </blockquote>`
    : "";

  const cta = s.cta
    ? `<p style="margin:26px 0 0"><a href="${s.cta.href}" style="display:inline-block;background:${INK};color:${PAPER};text-decoration:none;padding:14px 26px;border-radius:12px;font-size:15px;font-weight:600">${escape(s.cta.label)}</a></p>`
    : "";

  const footer = s.unsubscribeUrl
    ? `<p style="margin:26px 0 0;font-size:12px;color:${MUTED}">
         You get these because you are reading a plan on Plainly.
         <a href="${s.unsubscribeUrl}" style="color:${MUTED}">Stop these emails</a>.
       </p>`
    : "";

  return `<!doctype html><html><body style="margin:0;background:${PAPER};padding:28px 0">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(s.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${PAPER};padding:0 24px">
        <tr><td>
          <p style="margin:0 0 20px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:${MUTED}">Plainly</p>
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;line-height:1.25;color:${INK};font-weight:600">${escape(s.heading)}</h1>
          ${paragraphs}${quote}${cta}${footer}
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

function plain(s: Shell) {
  const parts = [s.heading, "", ...s.body];
  if (s.quote) parts.push("", `"${s.quote.text}" — ${s.quote.reference}`);
  if (s.cta) parts.push("", `${s.cta.label}: ${s.cta.href}`);
  if (s.unsubscribeUrl) parts.push("", `Stop these emails: ${s.unsubscribeUrl}`);
  return parts.join("\n");
}

function build(subject: string, s: Shell): EmailTemplate {
  return { subject, html: shell(s), text: plain(s) };
}

export function welcomeEmail(input: {
  name?: string | null;
  bookTitle: string;
  signInUrl: string;
  unsubscribeUrl: string;
}): EmailTemplate {
  const s: Shell = {
    preheader: "Day 1 is open.",
    heading: input.name ? `${input.name}, Day 1 is open` : "Day 1 is open",
    body: [
      `Your plan is ${input.bookTitle}. One session a day, about ten minutes, six short steps.`,
      "This link is how you get back in — no password, ever. Keep this email.",
    ],
    cta: { label: "Open Day 1", href: input.signInUrl },
    unsubscribeUrl: input.unsubscribeUrl,
  };
  return build("Day 1 is open — Plainly", s);
}

export function dailyEmail(input: {
  day: number;
  title: string;
  reference: string;
  setup: string;
  streak: number;
  planUrl: string;
  unsubscribeUrl: string;
}): EmailTemplate {
  const body = [input.setup];
  if (input.streak >= 2) body.push(`${input.streak} days in a row. Keep it going.`);
  const s: Shell = {
    preheader: `${input.title} — ${input.reference}`,
    heading: `Day ${input.day}: ${input.title}`,
    body,
    cta: { label: `Read Day ${input.day}`, href: input.planUrl },
    unsubscribeUrl: input.unsubscribeUrl,
  };
  return build(`Day ${input.day} is open — ${input.title}`, s);
}

export function winBackEmail(input: {
  day: number;
  title: string;
  quote: string;
  reference: string;
  planUrl: string;
  unsubscribeUrl: string;
}): EmailTemplate {
  const s: Shell = {
    preheader: "Your place is kept.",
    heading: "Your place is kept",
    body: [
      `Day ${input.day} is still waiting — nothing expired, nothing reset.`,
      "Here is one line from the session you left.",
    ],
    quote: { text: input.quote, reference: input.reference },
    cta: { label: `Pick up Day ${input.day}`, href: input.planUrl },
    unsubscribeUrl: input.unsubscribeUrl,
  };
  return build(`Day ${input.day} is still waiting — ${input.title}`, s);
}

export function finishEmail(input: {
  bookTitle: string;
  sessions: number;
  notes: number;
  reviewUrl: string;
  unsubscribeUrl: string;
}): EmailTemplate {
  const s: Shell = {
    preheader: "Thirty days, finished.",
    heading: "Thirty days, finished",
    body: [
      `You read ${input.bookTitle} — ${input.sessions} sessions, ${input.notes} notes in your own words.`,
      "If it was worth the ten minutes a day, one line from you helps someone else start.",
    ],
    cta: { label: "Leave a line", href: input.reviewUrl },
    unsubscribeUrl: input.unsubscribeUrl,
  };
  return build(`You finished ${input.bookTitle}`, s);
}