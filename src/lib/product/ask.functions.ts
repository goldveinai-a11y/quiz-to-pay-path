import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AskInput = {
  day: number;
  question: string;
  reference: string;
  passage: string;
  context: string;
};

export type AskResult = { answer: string } | { error: string };

const DAILY_LIMIT = 20;

/** One plain answer about the passage in front of the reader. */
export const askAboutPassage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AskInput) => {
    const question = data.question.trim();
    if (question.length < 3) throw new Error("Ask a full question");
    if (question.length > 400) throw new Error("Keep the question short");
    return { ...data, question };
  })
  .handler(async ({ data, context }): Promise<AskResult> => {
    const since = new Date(Date.now() - 86400000).toISOString();
    const { count } = await context.supabase
      .from("session_questions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) {
      return { error: "That's all the questions for today — more tomorrow." };
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { error: "Questions are unavailable right now." };

    const system = [
      "You answer questions about a Bible passage for an adult beginner.",
      "No question is too basic. Be warm, concrete and short: 2-4 sentences.",
      "Explain history, language and meaning. Do not preach, do not moralise,",
      "do not take a denominational side; if traditions disagree, say so in one line.",
      "Stay with the passage given. If the answer is unknown, say so plainly.",
    ].join(" ");

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Passage (${data.reference}):\n${data.passage}\n\nBackground: ${data.context}\n\nQuestion: ${data.question}`,
            },
          ],
        }),
      });
      if (response.status === 429) return { error: "Too many questions at once — try again in a minute." };
      if (!response.ok) return { error: "Couldn't answer that just now." };
      const payload = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const answer = payload.choices?.[0]?.message?.content?.trim();
      if (!answer) return { error: "Couldn't answer that just now." };

      const { data: plan } = await context.supabase
        .from("user_plans")
        .select("book_slug")
        .eq("user_id", context.userId)
        .eq("is_active", true)
        .maybeSingle();

      await context.supabase.from("session_questions").insert({
        user_id: context.userId,
        book_slug: plan?.book_slug ?? "john",
        day_number: data.day,
        question: data.question,
        answer,
      });

      return { answer };
    } catch {
      return { error: "Couldn't answer that just now." };
    }
  });
