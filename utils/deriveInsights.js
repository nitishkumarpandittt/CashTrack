/**
 * Turns raw budget / income / expense rows into a ranked list of specific,
 * numeric observations.
 *
 * Deliberately deterministic rather than generated prose: every line here is
 * computed from the user's own figures and names a concrete next step, which
 * is more useful than a paragraph of encouragement. The Gemini call remains a
 * separate, optional layer on top.
 */

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (v) => `Rs.${Math.round(num(v)).toLocaleString("en-IN")}`;
const pct = (v) => `${(Math.round(num(v) * 10) / 10).toFixed(1)}%`;

/** Severity order used for ranking. */
const WEIGHT = { critical: 0, warn: 1, good: 2, info: 3 };

export function deriveInsights({ budgetList = [], incomeList = [], expensesList = [] } = {}) {
  const insights = [];

  const totalBudget = budgetList.reduce((sum, b) => sum + num(b.amount), 0);
  const totalSpend = budgetList.reduce((sum, b) => sum + num(b.totalSpend), 0);
  const totalIncome = incomeList.reduce((sum, i) => sum + num(i.amount), 0);
  const surplus = totalIncome - totalSpend;
  const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : null;
  const budgetUse = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

  // ---- Living beyond income -------------------------------------------------
  if (totalIncome > 0 && totalSpend > totalIncome) {
    insights.push({
      id: "deficit",
      tone: "critical",
      title: "You're spending more than you earn",
      detail: `Spending exceeds income by ${money(
        totalSpend - totalIncome
      )}. Trimming that from your largest category is the fastest way back to even.`,
    });
  }

  // ---- Budgets that have blown their limit ---------------------------------
  const overruns = budgetList
    .filter((b) => num(b.amount) > 0 && num(b.totalSpend) > num(b.amount))
    .map((b) => ({
      name: b.name,
      limit: num(b.amount),
      over: num(b.totalSpend) - num(b.amount),
      pctOver: ((num(b.totalSpend) - num(b.amount)) / num(b.amount)) * 100,
    }))
    .sort((a, b) => b.over - a.over);

  if (overruns.length) {
    const worst = overruns[0];
    insights.push({
      id: "overrun",
      tone: "critical",
      title: `${worst.name} is over budget`,
      detail:
        overruns.length > 1
          ? `${money(worst.over)} over (${pct(worst.pctOver)}), and ${
              overruns.length - 1
            } other ${overruns.length - 1 === 1 ? "budget is" : "budgets are"} over too. Raise the limit or cut back here.`
          : `${money(worst.over)} past its ${money(worst.limit)} limit — ${pct(
              worst.pctOver
            )} over. Raise the limit or cut back here.`,
    });
  }

  // ---- Budgets about to blow their limit -----------------------------------
  const nearLimit = budgetList
    .filter((b) => {
      const amt = num(b.amount);
      if (amt <= 0) return false;
      const used = (num(b.totalSpend) / amt) * 100;
      return used >= 80 && used <= 100;
    })
    .map((b) => ({ name: b.name, used: (num(b.totalSpend) / num(b.amount)) * 100 }))
    .sort((a, b) => b.used - a.used);

  if (nearLimit.length) {
    insights.push({
      id: "near-limit",
      tone: "warn",
      title: `${nearLimit[0].name} is close to its limit`,
      detail: `${pct(nearLimit[0].used)} used${
        nearLimit.length > 1 ? `, along with ${nearLimit.length - 1} other` : ""
      }. Worth watching before it tips over.`,
    });
  }

  // ---- One expense dominating everything -----------------------------------
  if (expensesList.length > 1 && totalSpend > 0) {
    const biggest = [...expensesList].sort((a, b) => num(b.amount) - num(a.amount))[0];
    const share = (num(biggest.amount) / totalSpend) * 100;
    if (share >= 30) {
      insights.push({
        id: "concentration",
        tone: share >= 50 ? "warn" : "info",
        title: `${biggest.name} is ${pct(share)} of all spending`,
        detail: `A single ${money(
          biggest.amount
        )} charge drives most of your total. If it was one-off, your usual month looks better than these numbers suggest.`,
      });
    }
  }

  // ---- Money sitting idle ---------------------------------------------------
  const idle = budgetList
    .filter((b) => num(b.amount) > 0 && num(b.totalSpend) < num(b.amount) * 0.5)
    .map((b) => ({ name: b.name, unused: num(b.amount) - num(b.totalSpend) }))
    .sort((a, b) => b.unused - a.unused);

  const idleTotal = idle.reduce((sum, b) => sum + b.unused, 0);
  if (idle.length && idleTotal > 0) {
    insights.push({
      id: "idle",
      tone: "info",
      title: `${money(idleTotal)} is allocated but unspent`,
      detail: `Across ${idle.length} ${idle.length === 1 ? "budget" : "budgets"}, led by ${
        idle[0].name
      } at ${money(idle[0].unused)}. Reallocating it beats letting it drift.`,
    });
  }

  // ---- Savings rate against the usual 20% benchmark ------------------------
  if (savingsRate !== null && totalIncome > 0) {
    if (savingsRate >= 20) {
      insights.push({
        id: "savings-strong",
        tone: "good",
        title: `Saving ${pct(savingsRate)} of income`,
        detail: `Comfortably above the 20% rule of thumb — ${money(
          surplus
        )} left over. Putting it somewhere that earns is the next step.`,
      });
    } else if (savingsRate >= 0) {
      insights.push({
        id: "savings-thin",
        tone: "warn",
        title: `Saving ${pct(savingsRate)} of income`,
        detail: `Below the 20% benchmark. Freeing up ${money(
          totalIncome * 0.2 - surplus
        )} a month would close the gap.`,
      });
    }
  }

  // ---- How long the surplus would last -------------------------------------
  if (surplus > 0 && totalSpend > 0) {
    const months = surplus / totalSpend;
    insights.push({
      id: "runway",
      tone: months >= 3 ? "good" : "info",
      title: `${months.toFixed(1)} months of cover`,
      detail: `Your ${money(surplus)} surplus would cover ${months.toFixed(
        1
      )} months at your current spend. Three to six months is the usual emergency-fund target.`,
    });
  }

  // ---- Structural gaps ------------------------------------------------------
  if (budgetList.length > 0 && incomeList.length === 0) {
    insights.push({
      id: "no-income",
      tone: "warn",
      title: "No income recorded yet",
      detail:
        "Savings rate and surplus stay blank until there's an income source to measure spending against.",
    });
  }

  if (budgetList.length > 0 && expensesList.length === 0) {
    insights.push({
      id: "no-expenses",
      tone: "info",
      title: "No expenses logged yet",
      detail: `${money(
        totalBudget
      )} is budgeted but nothing has been spent against it. Add expenses to see where it actually goes.`,
    });
  }

  insights.sort((a, b) => WEIGHT[a.tone] - WEIGHT[b.tone]);

  return {
    insights,
    totals: { totalBudget, totalSpend, totalIncome, surplus, savingsRate, budgetUse },
  };
}

export default deriveInsights;
