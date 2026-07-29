import {
  MISSING_KEY_MESSAGE,
  describeGeminiError,
  generateContent,
  hasGeminiKey,
} from "@/utils/geminiClient";
import { INSIGHTS_SCHEMA, INSIGHTS_SYSTEM_PROMPT, TONES } from "@/utils/insightsPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deep-dive analysis of one user's finances.
 *
 * The dashboard already shows deterministic observations computed from the raw
 * rows (see utils/deriveInsights.js). This route is the layer above that: it
 * reads the whole picture at once and returns a structured brief — a verdict,
 * a few analytical sections, and concrete next steps — rather than the single
 * paragraph the earlier free-text call produced.
 */

const str = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * The model is asked for a fixed shape, but a bad or truncated reply must not
 * reach the renderer as `undefined`. Everything is coerced and clamped here.
 */
function normalise(raw) {
  const sections = Array.isArray(raw?.sections) ? raw.sections : [];
  const actions = Array.isArray(raw?.actions) ? raw.actions : [];

  return {
    headline: str(raw?.headline),
    summary: str(raw?.summary),
    sections: sections
      .map((s) => ({
        title: str(s?.title),
        tone: TONES.includes(s?.tone) ? s.tone : "info",
        detail: str(s?.detail),
      }))
      .filter((s) => s.title && s.detail)
      .slice(0, 5),
    actions: actions
      .map((a) => ({ label: str(a?.label), detail: str(a?.detail) }))
      .filter((a) => a.label)
      .slice(0, 4),
  };
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const context = typeof payload?.context === "string" ? payload.context : "";
  if (!context.trim()) {
    return Response.json({ error: "No financial data to analyse." }, { status: 400 });
  }

  if (!hasGeminiKey()) {
    return Response.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
  }

  try {
    const content = await generateContent({
      system: INSIGHTS_SYSTEM_PROMPT,
      contents: [{ role: "user", parts: [{ text: `FINANCIAL CONTEXT\n${context}` }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        // Constrained decoding, so the reply is JSON in the right shape without
        // the prose-and-code-fence cleanup the old free-text call needed.
        responseMimeType: "application/json",
        responseSchema: INSIGHTS_SCHEMA,
      },
    });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return Response.json({ error: "The analysis came back unreadable." }, { status: 502 });
    }

    const brief = normalise(parsed);
    if (!brief.summary && brief.sections.length === 0) {
      return Response.json({ error: "The analysis came back empty." }, { status: 502 });
    }

    return Response.json({ brief });
  } catch (error) {
    const { status, error: message } = describeGeminiError(error, "api/insights");
    return Response.json({ error: message }, { status });
  }
}
