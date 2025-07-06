// utils/getFinancialAdvice.js

// Function to generate personalized financial advice using free AI services
const getFinancialAdvice = async (totalBudget, totalIncome, totalSpend) => {
  console.log("Inputs:", { totalBudget, totalIncome, totalSpend });

  try {
    // Calculate financial ratios and patterns
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpend) / totalIncome) * 100 : 0;
    const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;
    const surplus = totalIncome - totalSpend;

    // Generate intelligent financial advice based on patterns
    let advice = "";

    if (totalIncome === 0 && totalBudget === 0 && totalSpend === 0) {
      advice = "Welcome to CashTrack! Start by adding your income sources and creating budgets to get personalized financial insights. Setting up a budget is the first step towards financial freedom.";
    } else if (savingsRate >= 20) {
      advice = `Excellent financial discipline! You're saving ${savingsRate.toFixed(1)}% of your income. Consider investing your surplus of Rs.${surplus.toLocaleString()} in diversified portfolios or emergency funds for long-term wealth building.`;
    } else if (savingsRate >= 10) {
      advice = `Good savings habit with ${savingsRate.toFixed(1)}% savings rate. Try to increase your savings to 20% by reviewing discretionary expenses. Your current surplus of Rs.${surplus.toLocaleString()} can be optimized further.`;
    } else if (savingsRate >= 0) {
      advice = `Your savings rate is ${savingsRate.toFixed(1)}%. Focus on reducing non-essential expenses and aim for at least 10% savings. Review your spending patterns to identify areas for improvement.`;
    } else {
      advice = `You're spending Rs.${Math.abs(surplus).toLocaleString()} more than your income. Immediate action needed: cut unnecessary expenses, consider additional income sources, and create a strict budget to avoid debt accumulation.`;
    }

    // Add budget-specific advice
    if (budgetUtilization > 100) {
      advice += ` You've exceeded your budget by ${(budgetUtilization - 100).toFixed(1)}%. Review and adjust your spending categories to stay within limits.`;
    } else if (budgetUtilization > 80) {
      advice += ` You're using ${budgetUtilization.toFixed(1)}% of your budget. Monitor closely to avoid overspending in the remaining period.`;
    } else if (budgetUtilization < 50 && totalBudget > 0) {
      advice += ` Great budget control! You've only used ${budgetUtilization.toFixed(1)}% of your budget. Consider allocating unused funds to savings or investments.`;
    }

    console.log("Generated Advice:", advice);
    return advice;

  } catch (error) {
    console.error("Error generating financial advice:", error);

    // Fallback advice based on basic calculations
    const isOverspending = totalSpend > totalIncome;
    const fallbackAdvice = isOverspending
      ? "You're spending more than your income. Focus on reducing expenses and tracking your spending habits to achieve financial stability."
      : "You're managing your finances well. Continue tracking your expenses and consider setting aside more for savings and investments.";

    return fallbackAdvice;
  }
};

export default getFinancialAdvice;
