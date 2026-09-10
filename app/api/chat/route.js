import {
  MISSING_KEY_MESSAGE,
  describeGeminiError,
  generateContent,
  hasGeminiKey,
} from "@/utils/geminiClient";
import { CHAT_SYSTEM_PROMPT } from "@/utils/chatPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Chat endpoint for the in-app assistant.
 *
 * Runs server-side on purpose: GEMINI_API_KEY is never exposed to the browser.
 * The route is behind Clerk (see proxy.js), so only signed-in users can spend
 * against the key. The coaching instructions live in utils/chatPrompt.js.
 */

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
      system: `${CHAT_SYSTEM_PROMPT}\n\nFINANCIAL CONTEXT\n${context || "(no data recorded yet)"}`,
      contents: [
        ...toGeminiHistory(history),
        { role: "user", parts: [{ text: question.slice(0, 2000) }] },
      ],
      // Plans with an allocation and a couple of follow-up questions need more
      // room than the old three-sentence answers did.
      generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
    });

    return Response.json({ reply });
  } catch (error) {
    const { status, error: message } = describeGeminiError(error, "api/chat");
    return Response.json({ error: message }, { status });
  }
}
