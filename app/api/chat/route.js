import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Chat endpoint for the in-app assistant.
 *
 * Runs server-side on purpose. The existing advice helper reads
 * NEXT_PUBLIC_GEMINI_API_KEY, which Next inlines into the client bundle —
 * meaning the key is readable by anyone who opens devtools. This route prefers
 * a server-only GEMINI_API_KEY and only falls back to the public one so the
 * feature still works before that variable is renamed.
 */
const SYSTEM_PROMPT = `You are CashTrack's in-app assistant. You help one user understand their own money.

Rules:
- Answer using ONLY the figures in the FINANCIAL CONTEXT below. Never invent numbers.
- If the context does not contain what is needed, say so plainly and name what the user should add (a budget, an income source, some expenses).
- Amounts are Indian rupees. Write them like Rs.1,250.
- Be concise: two to four sentences unless asked for more. No preamble, no bullet lists unless comparing several things.
- You explain the user's own data and general budgeting principles. You are not a licensed financial adviser, so do not recommend specific investments, funds, stocks or products. If asked for that, say it is outside what you can advise on and redirect to what their own numbers show.
- If a question is not about their finances or this app, say briefly that it is outside what you can help with here.`;

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

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "The assistant needs a Gemini API key. Add GEMINI_API_KEY to your .env and restart the server.",
      },
      { status: 503 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `${SYSTEM_PROMPT}\n\nFINANCIAL CONTEXT\n${context || "(no data recorded yet)"}`,
    });

    // Gemini requires the transcript to start with a user turn.
    const trimmed = history.slice(-8).filter((m) => m?.role && m?.text);
    const firstUser = trimmed.findIndex((m) => m.role === "user");
    const contents = (firstUser === -1 ? [] : trimmed.slice(firstUser)).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));
    contents.push({ role: "user", parts: [{ text: question.slice(0, 2000) }] });

    const result = await model.generateContent({
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
    });

    const reply = result?.response?.text?.()?.trim();
    if (!reply) {
      return Response.json({ error: "The model returned an empty reply." }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (error) {
    const message = String(error?.message || error);
    // Surface the actionable cases rather than a generic failure.
    if (/API key not valid|API_KEY_INVALID|invalid api key/i.test(message)) {
      return Response.json(
        { error: "That Gemini API key is not valid. Replace it in .env and restart." },
        { status: 401 }
      );
    }
    if (/exceeded your current quota|billing/i.test(message)) {
      return Response.json(
        {
          error:
            "This Gemini key has used up its quota. Check the plan and billing for the key at ai.google.dev, then try again.",
        },
        { status: 429 }
      );
    }
    if (/rate limit|429|too many requests/i.test(message)) {
      return Response.json(
        { error: "Gemini is rate-limiting right now. Try again in a moment." },
        { status: 429 }
      );
    }
    if (/not found|404|is not supported/i.test(message)) {
      return Response.json(
        { error: "The configured Gemini model is unavailable for this key." },
        { status: 502 }
      );
    }
    console.error("[api/chat]", message);
    return Response.json({ error: "The assistant could not answer just now." }, { status: 500 });
  }
}
