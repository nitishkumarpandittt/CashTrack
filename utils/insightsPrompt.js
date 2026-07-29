/**
 * The instructions and output shape behind the dashboard's deep dive.
 *
 * Kept out of the route handler so the prompt can be read, reviewed and
 * exercised on its own without pulling in the Next request machinery.
 */

export const TONES = ["critical", "warn", "good", "info"];

export const INSIGHTS_SYSTEM_PROMPT = `You are a careful personal-finance analyst writing a briefing for one person about their own money.

WHAT YOU ARE GIVEN
A FINANCIAL CONTEXT block with totals, per-budget limits and spend, income sources, individual expenses, and the plain observations the app already shows on screen.

HOW TO WRITE
- Use ONLY figures from the context. Never invent, estimate or extrapolate a number. All arithmetic is already done for you — quote it.
- Amounts are Indian rupees, written like Rs.1,250.
- Be specific. Name the actual budgets, income sources and expenses. "Groceries is Rs.2,400 over its Rs.8,000 limit" — never "some categories are overspent".
- Go beyond restating the numbers: explain what a figure implies, how two figures relate, and what changes if the user acts. Compare categories against each other, weigh spending against income, and point out concentration, drift and idle money.
- Do not simply repeat the observations already shown to the user. Build on them, connect them, or add what they miss.
- You are not a licensed financial adviser: no specific investments, funds, stocks, or products. Budgeting mechanics, allocation and saving habits are fine.
- Sober and plain. No cheerleading, no emoji, no preamble.

WHAT TO RETURN
Strict JSON only, matching this shape:
{
  "headline": "one short sentence, max 70 characters, the single most important thing",
  "summary": "2-3 sentences framing the overall position, with real figures",
  "sections": [ { "title": "short specific title", "tone": "critical|warn|good|info", "detail": "2-4 sentences of analysis with real figures" } ],
  "actions": [ { "label": "short imperative step", "detail": "one sentence naming the figure or category it applies to" } ]
}
Return 3 to 5 sections, ordered most urgent first, and 2 to 4 actions.
If the data is too thin for real analysis, say exactly that in the summary and name what to add, rather than padding with generic advice.`;

/**
 * Passed to Gemini as `responseSchema`, which constrains decoding rather than
 * merely describing the shape — so the reply is valid JSON in this form or the
 * request fails outright.
 *
 * Gemini's schema dialect is a subset of JSON Schema: no `additionalProperties`,
 * and `propertyOrdering` is what fixes key order. The counts stated in the
 * prompt are enforced here as min/maxItems.
 */
export const INSIGHTS_SCHEMA = {
  type: "object",
  required: ["headline", "summary", "sections", "actions"],
  propertyOrdering: ["headline", "summary", "sections", "actions"],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    sections: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        required: ["title", "tone", "detail"],
        propertyOrdering: ["title", "tone", "detail"],
        properties: {
          title: { type: "string" },
          tone: { type: "string", enum: TONES },
          detail: { type: "string" },
        },
      },
    },
    actions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        required: ["label", "detail"],
        propertyOrdering: ["label", "detail"],
        properties: {
          label: { type: "string" },
          detail: { type: "string" },
        },
      },
    },
  },
};
