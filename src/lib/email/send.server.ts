import type { EmailTemplate } from "./templates";

/**
 * Single delivery point for every product email. Managed delivery is used when
 * a sender domain is configured for the project; until then the send is
 * skipped and reported, never faked.
 */
export type SendResult = { delivered: boolean; reason?: string };

export async function sendEmail(to: string, template: EmailTemplate): Promise<SendResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"];
  if (!apiKey || !from) {
    console.warn(`[email] skipped "${template.subject}" for ${to}: sender domain not configured`);
    return { delivered: false, reason: "sender_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: template.subject,
      html: template.html,
      text: template.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[email] delivery failed for ${to}: ${response.status} ${detail}`);
    return { delivered: false, reason: `provider_${response.status}` };
  }
  return { delivered: true };
}