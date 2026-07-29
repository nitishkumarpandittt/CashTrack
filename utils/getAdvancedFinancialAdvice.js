// utils/getAdvancedFinancialAdvice.js
// Detailed AI analysis of the dashboard figures, via Gemini.
//
// The model call happens in /api/insights so GEMINI_API_KEY stays on the
// server. This module only builds the snapshot, calls the route, caches the
// answer, and degrades to a locally computed brief when the API is unavailable.

import { deriveInsights } from "./deriveInsights";
import { buildFinancialContext } from "./financialContext";

const money = (v) => `Rs.${Math.round(Number(v) || 0).toLocaleString("en-IN")}`;

/**
 * CardInfo's effect re-runs whenever its list props change identity, which in
 * practice means several times per dashboard load. Keying in-flight promises
 * and settled results by the snapshot itself collapses those into one request —
 * without this, an unchanged dashboard billed the API on every render.
 */
const cache = new Map();
const MAX_CACHED = 8;

function remember(key, value) {
  cache.set(key, value);
  if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value);
}

/** Shape returned to the UI, whether it came from the model or from fallback. */
function emptyBrief() {
  return { headline: "", summary: "", sections: [], actions: [], source: "local" };
}

/**
 * Structured brief assembled from the deterministic observations. Not as
 * connected as the model's version, but always available and always accurate.
 */
function localBrief({ budgetList, incomeList, expensesList }) {
  const { insights, totals } = deriveInsights({ budgetList, incomeList, expensesList });
  const { totalIncome, totalSpend, surplus, savingsRate } = totals;

  const summary =
    totalIncome > 0
      ? `You have taken in ${money(totalIncome)} and spent ${money(totalSpend)}, leaving ${money(
          surplus
        )}${savingsRate !== null ? ` — a savings rate of ${savingsRate.toFixed(1)}%` : ""}.`
      : `You have spent ${money(
          totalSpend
        )} so far. Add an income source and the savings rate and surplus will fill in.`;

  return {
    headline: insights[0]?.title || "",
    summary,
    sections: insights.slice(0, 4).map((i) => ({
      title: i.title,
      tone: i.tone,
      detail: i.detail,
    })),
    actions: [],
    source: "local",
  };
}

const getAdvancedFinancialAdvice = async ({
  budgetList = [],
  incomeList = [],
  expensesList = [],
} = {}) => {
  const lists = { budgetList, incomeList, expensesList };

  let context;
  try {
    context = buildFinancialContext(lists);
  } catch (error) {
    console.error("Could not build the financial snapshot:", error);
    return emptyBrief();
  }

  if (cache.has(context)) return cache.get(context);

  const request = (async () => {
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const data = (await res.json().catch(() => ({}))) ?? {};

      if (!res.ok || !data.brief) {
        // Key problems and quota problems are worth seeing in the console, but
        // the dashboard should still render something useful.
        if (data.error) console.warn("[insights]", data.error);
        return { ...localBrief(lists), error: data.error || null };
      }

      return { ...data.brief, source: "gemini" };
    } catch (error) {
      console.warn("Could not reach the insights service:", error?.message || error);
      return localBrief(lists);
    }
  })();

  // Cache the promise so parallel callers share one request, then replace it
  // with the settled value. A failed lookup is dropped so a retry can happen.
  remember(context, request);
  try {
    const brief = await request;
    remember(context, brief);
    return brief;
  } catch (error) {
    cache.delete(context);
    throw error;
  }
};

export default getAdvancedFinancialAdvice;
