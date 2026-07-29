/**
 * One shared, factual snapshot of a user's money.
 *
 * Both the chat route and the insights route hand this exact text to the model.
 * Everything numeric is pre-computed here rather than left for the model to
 * derive: language models are unreliable at arithmetic, so giving them the
 * finished figures is what makes the output detailed *and* correct.
 */

import { deriveInsights } from "./deriveInsights";

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const rupees = (v) => `Rs.${Math.round(num(v)).toLocaleString("en-IN")}`;
const pct = (v) => `${(Math.round(num(v) * 10) / 10).toFixed(1)}%`;

/** Most recent expenses first, capped so the prompt stays a sane size. */
const MAX_EXPENSES = 40;

export function buildFinancialContext({
  budgetList = [],
  incomeList = [],
  expensesList = [],
} = {}) {
  const { totals, insights } = deriveInsights({ budgetList, incomeList, expensesList });
  const { totalBudget, totalSpend, totalIncome, surplus, savingsRate, budgetUse } = totals;

  const lines = [
    "TOTALS",
    `- Total income: ${rupees(totalIncome)}`,
    `- Total budgeted: ${rupees(totalBudget)}`,
    `- Total spent: ${rupees(totalSpend)}`,
    `- Surplus (income minus spend): ${rupees(surplus)}`,
    savingsRate === null
      ? "- Savings rate: not available (no income recorded)"
      : `- Savings rate: ${pct(savingsRate)} (the common benchmark is 20%)`,
    `- Budget utilisation: ${pct(budgetUse)} of the total budget has been spent`,
    `- Unallocated income (income minus budgeted): ${rupees(totalIncome - totalBudget)}`,
    "",
    "BUDGETS (name | limit | spent | remaining | used)",
  ];

  if (budgetList.length) {
    const ranked = [...budgetList].sort((a, b) => num(b.totalSpend) - num(a.totalSpend));
    for (const b of ranked) {
      const limit = num(b.amount);
      const spent = num(b.totalSpend);
      const used = limit > 0 ? (spent / limit) * 100 : 0;
      lines.push(
        `- ${b.name} | ${rupees(limit)} | ${rupees(spent)} | ${rupees(limit - spent)} | ${
          limit > 0 ? pct(used) : "n/a"
        }${spent > limit ? "  <-- OVER LIMIT" : ""}`
      );
    }
  } else {
    lines.push("- none");
  }

  lines.push("", "INCOME SOURCES (name | amount | share of income)");
  if (incomeList.length) {
    for (const i of [...incomeList].sort((a, b) => num(b.amount) - num(a.amount))) {
      const share = totalIncome > 0 ? (num(i.amount) / totalIncome) * 100 : 0;
      lines.push(`- ${i.name} | ${rupees(i.amount)} | ${totalIncome > 0 ? pct(share) : "n/a"}`);
    }
  } else {
    lines.push("- none");
  }

  lines.push("", `EXPENSES (name | amount | share of spend | date) — largest first`);
  if (expensesList.length) {
    const ranked = [...expensesList].sort((a, b) => num(b.amount) - num(a.amount));
    for (const e of ranked.slice(0, MAX_EXPENSES)) {
      const share = totalSpend > 0 ? (num(e.amount) / totalSpend) * 100 : 0;
      lines.push(
        `- ${e.name} | ${rupees(e.amount)} | ${totalSpend > 0 ? pct(share) : "n/a"} | ${
          e.createdAt || "unknown"
        }`
      );
    }
    if (ranked.length > MAX_EXPENSES) {
      lines.push(`- (${ranked.length - MAX_EXPENSES} smaller expenses omitted)`);
    }
  } else {
    lines.push("- none");
  }

  // The deterministic observations the dashboard already shows. Passing them in
  // stops the model repeating what the user can see and lets it build on top.
  lines.push("", "OBSERVATIONS ALREADY SHOWN TO THE USER (do not simply repeat these)");
  if (insights.length) {
    for (const i of insights) lines.push(`- [${i.tone}] ${i.title}: ${i.detail}`);
  } else {
    lines.push("- none");
  }

  return lines.join("\n");
}

export default buildFinancialContext;
