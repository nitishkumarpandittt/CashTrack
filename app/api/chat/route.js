import {
  MISSING_KEY_MESSAGE,
  describeGeminiError,
  generateContent,
  hasGeminiKey,
} from "@/utils/geminiClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Chat endpoint for the in-app assistant.
 *
 * Runs server-side on purpose: GEMINI_API_KEY is never exposed to the browser.
 * The route is behind Clerk (see proxy.js), so only signed-in users can spend
 * against the key.
 */
const SYSTEM_PROMPT = `You are CashTrack's in-app financial assistant. You help one user understand their own money.

Rules:
- Answer using ONLY the figures in the FINANCIAL CONTEXT below. Never invent or estimate a number that is not there.
- Every figure in the context is already computed for you. Quote those figures rather than doing your own arithmetic.
- If the context does not contain what is needed, say so plainly and name what the user should add (a budget, an income source, some expenses).
- Amounts are Indian rupees. Write them like Rs.1,250.
- Be specific and concrete. Cite the actual budget names, categories and amounts involved rather than talking in generalities.
- Default to a short answer of three to five sentences. If the question genuinely calls for a breakdown, use a few "- " bullets. Use **bold** for figures worth highlighting.
- You explain the user's own data and general budgeting principles. You are not a licensed financial adviser, so do not recommend specific investments, funds, stocks or products. If asked for that, say it is outside what you can advise on and redirect to what their own numbers show.
- If a question is not about their finances or this app, say briefly that it is outside what you can help with here.`;

/**
 * The panel's transcript, as turns Gemini will accept: `assistant` becomes
 * `model`, the trailing slice keeps the prompt bounded, and any leading model
 * turns are dropped because a Gemini conversation must open on a user turn.
 */
function toGeminiHistory(history) {
  const turns = (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter((m) => m?.text && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.text).slice(0, 2000) }],
    }));

  const first = turns.findIndex((t) => t.role === "user");
  return first === -1 ? [] : turns.slice(first);
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const { question, history = [], context = "" } = payload || {};

  if (typeof question !== "string" || !question.trim()) {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  if (!hasGeminiKey()) {
    return Response.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
  }

  try {
    const reply = await generateContent({
      system: `${SYSTEM_PROMPT}\n\nFINANCIAL CONTEXT\n${context || "(no data recorded yet)"}`,
      contents: [
        ...toGeminiHistory(history),
        { role: "user", parts: [{ text: question.slice(0, 2000) }] },
      ],
      generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
    });

    return Response.json({ reply });
  } catch (error) {
    const { status, error: message } = describeGeminiError(error, "api/chat");
    return Response.json({ error: message }, { status });
  }
}
